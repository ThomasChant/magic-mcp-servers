import React, { useState, useCallback, useMemo, useEffect } from 'react';
import InteractiveStar from './InteractiveStar';
import StarTooltip from './StarTooltip';
import { useStarData, type StarData } from '../hooks/useStarData';
import type { MCPServer } from '../types';

interface InteractiveStarFieldProps {
  servers: MCPServer[];
  searchQuery?: string;
  selectedCategory?: string;
  enableCategoryFilter?: boolean;
  maxStars?: number;
}

const InteractiveStarField: React.FC<InteractiveStarFieldProps> = ({
  servers,
  searchQuery = '',
  selectedCategory,
  enableCategoryFilter = false,
  maxStars = 500,
}) => {
  const [hoveredStar, setHoveredStar] = useState<StarData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get star data
  const starData = useStarData(servers, {
    maxStars,
    enableCategoryFilter,
    selectedCategory,
    searchQuery,
  });

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

  // Handle star hover
  const handleStarHover = useCallback((star: StarData | null) => {
    setHoveredStar(star);
  }, []);

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

  // Generate background decorative elements
  const backgroundElements = useMemo(() => {
    const elements = [];
    
    // Photons
    for (let i = 0; i < 3; i++) {
      elements.push(
        <div
          key={`photon-${i}`}
          className="photon"
          style={{
            top: `${25 + i * 25}%`,
            animationDelay: `${i * 2.5}s`,
            animationIterationCount: 'infinite',
          }}
        />
      );
    }

    // Shooting stars
    for (let i = 0; i < 2; i++) {
      elements.push(
        <div
          key={`shooting-${i}`}
          className="shooting-star"
          style={{
            top: `${30 + i * 40}%`,
            left: `${10 + i * 20}%`,
            animationDelay: `${6 + i * 8}s`,
            animationDuration: '3s',
            animationIterationCount: 'infinite',
          }}
        />
      );
    }

    return elements;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Background decorative elements */}
      {backgroundElements}

      {/* Interactive server stars */}
      {starData.map((star) => (
        <InteractiveStar
          key={star.id}
          starData={star}
          isHighlighted={highlightedStars.has(star.id)}
          onHover={handleStarHover}
        />
      ))}

      {/* Tooltip */}
      <StarTooltip 
        starData={hoveredStar} 
        mousePosition={mousePosition}
      />

      {/* Star count indicator */}
      {starData.length > 0 && (
        <div 
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs"
          style={{ zIndex: 10 }}
        >
          {starData.length} stars visible
        </div>
      )}
    </div>
  );
};

export default InteractiveStarField;