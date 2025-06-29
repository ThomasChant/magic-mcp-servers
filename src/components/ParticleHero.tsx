import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Container, Engine } from 'tsparticles-engine';
import type { MCPServer } from '../types';
import type { StarServer } from '../hooks/useTopStarServers';
import StarTooltip from './StarTooltip';
import { useStarData, type StarData } from '../hooks/useStarData';
import { useParticleConfig } from '../hooks/useParticleConfig';

interface ParticleHeroProps {
  servers: (MCPServer | StarServer)[];
  searchQuery?: string;
  selectedCategory?: string;
  enableCategoryFilter?: boolean;
  maxStars?: number;
}

const ParticleHero: React.FC<ParticleHeroProps> = ({
  servers,
  searchQuery = '',
  selectedCategory,
  enableCategoryFilter = false,
  maxStars = 500,
}) => {
  const navigate = useNavigate();
  const [hoveredStar, setHoveredStar] = useState<StarData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Force minimum particles even with no servers
  const particleServers = servers.length > 0 ? servers : [
    { 
      id: 'demo', 
      name: 'Demo Server', 
      stats: { stars: 10 }, 
      repository: { stars: 10 },
      category: 'development', 
      description: { en: 'Demo server for particle effects', 'zh-CN': 'Demo server for particle effects' }, 
      tags: ['demo', 'particle'],
      slug: 'demo-server',
      owner: 'demo',
      metadata: { featured: false, verified: false }
    }
  ] as (MCPServer | StarServer)[];

  console.log("particleServers count", particleServers.length);
  // Get star data for interactive particles - always try to use real servers for stars
  const starData = useStarData(particleServers, {
    maxStars,
    enableCategoryFilter,
    selectedCategory,
    searchQuery,
  });

  console.log('ParticleHero - servers count:', servers.length, 'starData count:', starData.length);

  // Get optimized particle configuration
  const { particleOptions, deviceCapabilities } = useParticleConfig({
    servers: particleServers,
    searchQuery,
  });

  // Initialize particles engine
  const particlesInit = useCallback(async (engine: Engine) => {
    try {
      await loadSlim(engine);
      console.log('Particles engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize particles engine:', error);
    }
  }, []);

  // Handle particles container load  
  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    if (container) {
      console.log('Particles container loaded successfully:', container.id);
      // Force a refresh to ensure particles are visible
      container.refresh();
    } else {
      console.warn('Particles container failed to load');
    }
  }, []);

  // Handle mouse movement for tooltip positioning
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (hoveredStar) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [hoveredStar, handleMouseMove]);

  // Determine which stars to highlight based on search
  const highlightedStars = useMemo(() => {
    if (!searchQuery) return new Set();
    const query = searchQuery.toLowerCase();
    return new Set(
      starData
        .filter(star => 
          star.server.name.toLowerCase().includes(query) ||
          star.server.description["zh-CN"].toLowerCase().includes(query) ||
          star.server.tags.some(tag => tag.toLowerCase().includes(query))
        )
        .map(star => star.id)
    );
  }, [starData, searchQuery]);


  // Interactive stars overlays
  const renderInteractiveStars = () => {
    console.log('Rendering interactive stars:', starData.length);
    return starData.map((star) => {
      const isHighlighted = highlightedStars.has(star.id);
      const sizeMultiplier = deviceCapabilities.isMobile ? 0.8 : 1;
      const baseSize = (star.size === 'extra-large' ? 12 : 
                       star.size === 'large' ? 8 : 
                       star.size === 'medium' ? 5 : 3) * sizeMultiplier;
      
      // Generate random animation delay for natural twinkling effect
      const animationDelay = Math.random() * 3;
      const blinkDuration = 2 + Math.random() * 2; // 2-4 seconds
      
      return (
        <div
          key={`interactive-${star.id}`}
          className="absolute cursor-pointer group"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
          }}
          onClick={() => navigate(`/servers/${star.server.slug || star.server.id}`)}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(null)}
        >
          {/* Main interactive star */}
          <div
            className={`rounded-full transition-all duration-300 ${
              isHighlighted ? 'animate-pulse' : ''
            }`}
            style={{
              width: `${baseSize}px`,
              height: `${baseSize}px`,
              background: '#ffffff',
              boxShadow: isHighlighted 
                ? `0 0 ${baseSize * 4}px ${star.categoryColor}, 0 0 ${baseSize * 2}px rgba(255, 255, 255, 0.9)` 
                : `0 0 ${baseSize * 2}px rgba(255, 255, 255, 0.8)`,
              opacity: star.brightness,
              animation: `starTwinkle ${blinkDuration}s ease-in-out infinite`,
              animationDelay: `${animationDelay}s`,
            }}
          />
          
          {/* Hover effect ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-60 transition-all duration-300 group-hover:scale-150"
            style={{
              animation: hoveredStar?.id === star.id ? 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none',
            }}
          />
          
          {/* Featured/verified pulse */}
          {(star.server.metadata?.featured || star.server.metadata?.verified) && (
            <div
              className="absolute inset-0 rounded-full border border-cyan-400 opacity-60"
              style={{
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                transform: 'scale(2)',
              }}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="absolute inset-0 overflow-hidden particle-hero-container" style={{ zIndex: 0, contain: 'layout style paint', visibility: 'visible', opacity: 1, position: 'absolute' }}>
      {/* Particles background */}
      <Particles
        id="particle-hero"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particleOptions}
        className="absolute inset-0 particles-container"
        style={{ zIndex: 1, visibility: 'visible', opacity: 1 }}
      />
      
      {/* Cosmic background gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.9) 50%, rgba(15, 15, 30, 0.95) 100%)',
          zIndex: 2,
        }}
      />
      
      {/* Interactive server stars */}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        {renderInteractiveStars()}
      </div>
      
      {/* Shooting stars effect - reduced on low-end devices */}
      {!deviceCapabilities.isLowEndDevice && (
        <div className="absolute inset-0" style={{ zIndex: 4 }}>
          {[1, 2].map((i) => (
            <div
              key={`shooting-${i}`}
              className="enhanced-shooting-star"
              style={{
                top: `${30 + i * 40}%`,
                left: `${10 + i * 20}%`,
                animationDelay: `${6 + i * 8}s`,
                animationDuration: '4s',
                animationIterationCount: 'infinite',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Additional cosmic effects - simplified on mobile */}
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        {/* Nebula effects */}
        {(deviceCapabilities.isLowEndDevice ? [1] : [1, 2, 3]).map((i) => (
          <div
            key={`nebula-${i}`}
            className="absolute rounded-full opacity-20"
            style={{
              top: `${20 + i * 25}%`,
              left: `${15 + i * 30}%`,
              width: `${(100 + i * 50) * (deviceCapabilities.isMobile ? 0.7 : 1)}px`,
              height: `${(100 + i * 50) * (deviceCapabilities.isMobile ? 0.7 : 1)}px`,
              background: `radial-gradient(circle, ${
                i === 1 ? 'rgba(100, 255, 218, 0.15)' :
                i === 2 ? 'rgba(147, 51, 234, 0.15)' :
                'rgba(59, 130, 246, 0.15)'
              } 0%, transparent 70%)`,
              animation: deviceCapabilities.isLowEndDevice ? 'none' : `nebula ${12 + i * 3}s ease-in-out infinite`,
              filter: 'blur(2px)',
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Tooltip */}
      <StarTooltip 
        starData={hoveredStar} 
        mousePosition={mousePosition}
      />
      
      {/* Star count indicator */}
      {starData.length > 0 && (
        <div 
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm"
          style={{ zIndex: 10 }}
        >
          ✨ {starData.length} servers visible
        </div>
      )}
    </div>
  );
};

export default ParticleHero;