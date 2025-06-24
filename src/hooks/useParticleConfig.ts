import { useMemo, useEffect, useState } from 'react';
import type { ISourceOptions } from 'tsparticles-engine';
import type { MCPServer } from '../types';

interface UseParticleConfigOptions {
  servers: MCPServer[];
  searchQuery?: string;
}

export const useParticleConfig = ({ 
  servers, 
  searchQuery, 
}: UseParticleConfigOptions) => {
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isMobile: false,
    isLowEndDevice: false,
    supportsWebGL: true,
  });

  // Detect device capabilities
  useEffect(() => {
    const checkDeviceCapabilities = () => {
      const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4; // Default to 4GB if not available
      const isLowEndDevice = memory < 4 || isMobile;
      
      // Check WebGL support
      let supportsWebGL = true;
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        supportsWebGL = !!gl;
      } catch {
        supportsWebGL = false;
      }

      setDeviceCapabilities({
        isMobile,
        isLowEndDevice,
        supportsWebGL,
      });
    };

    checkDeviceCapabilities();
    window.addEventListener('resize', checkDeviceCapabilities);
    return () => window.removeEventListener('resize', checkDeviceCapabilities);
  }, []);

  // Get category colors for particles
  const getCategoryColors = () => {
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // purple  
      '#10b981', // green
      '#06b6d4', // cyan
      '#f59e0b', // amber
      '#ec4899', // pink
      '#84cc16', // lime
      '#22c55e', // green
      '#6b7280', // gray
      '#f97316', // orange
      '#64748b', // slate
      '#ffffff', // white
    ];
    return colors;
  };

  // Optimized particle configuration
  const particleOptions: ISourceOptions = useMemo(() => {
    const baseParticleCount = deviceCapabilities.isLowEndDevice ? 40 : 80;
    const particleCount = searchQuery ? Math.min(baseParticleCount, servers.length + 20) : baseParticleCount;
    
    return {
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: deviceCapabilities.isLowEndDevice ? 30 : 60,
      interactivity: {
        detect_on: 'canvas',
        events: {
          onClick: {
            enable: true,
            mode: 'push',
          },
          onHover: {
            enable: !deviceCapabilities.isMobile, // Disable hover on mobile for performance
            mode: deviceCapabilities.isLowEndDevice ? ['bubble'] : ['attract', 'bubble'],
          },
          resize: true,
        },
        modes: {
          attract: {
            distance: deviceCapabilities.isMobile ? 100 : 200,
            factor: deviceCapabilities.isLowEndDevice ? 10 : 20,
            speed: 1,
          },
          bubble: {
            distance: deviceCapabilities.isMobile ? 100 : 150,
            size: deviceCapabilities.isLowEndDevice ? 8 : 12,
            duration: 2,
            opacity: 0.8,
            speed: deviceCapabilities.isLowEndDevice ? 2 : 3,
          },
          push: {
            quantity: deviceCapabilities.isLowEndDevice ? 2 : 4,
          },
          repulse: {
            distance: deviceCapabilities.isMobile ? 100 : 200,
            factor: deviceCapabilities.isLowEndDevice ? 50 : 100,
            speed: 1,
          },
        },
      },
      particles: {
        color: {
          value: getCategoryColors(),
        },
        links: {
          color: '#64ffda',
          distance: deviceCapabilities.isMobile ? 100 : 150,
          enable: !deviceCapabilities.isLowEndDevice, // Disable links on low-end devices
          opacity: deviceCapabilities.isMobile ? 0.15 : 0.2,
          width: 1,
          triangles: {
            enable: !deviceCapabilities.isLowEndDevice,
            opacity: 0.1,
          },
        },
        collisions: {
          enable: false, // Disable for performance
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: true,
          speed: deviceCapabilities.isLowEndDevice ? 0.3 : 0.5,
          straight: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
        number: {
          density: {
            enable: true,
            area: deviceCapabilities.isMobile ? 1200 : 1000,
          },
          value: particleCount,
        },
        opacity: {
          value: 0.7,
          random: true,
          animation: {
            enable: !deviceCapabilities.isLowEndDevice,
            speed: 1,
            minimumValue: 0.1,
            sync: false,
          },
        },
        shape: {
          type: deviceCapabilities.isLowEndDevice ? ['circle'] : ['circle', 'star'],
          options: {
            star: {
              sides: 5,
            },
          },
        },
        size: {
          value: { 
            min: deviceCapabilities.isMobile ? 1 : 1, 
            max: deviceCapabilities.isMobile ? 4 : 6 
          },
          random: true,
          animation: {
            enable: !deviceCapabilities.isLowEndDevice,
            speed: deviceCapabilities.isLowEndDevice ? 1 : 2,
            minimumValue: 0.1,
            sync: false,
          },
        },
        twinkle: {
          particles: {
            enable: !deviceCapabilities.isLowEndDevice,
            frequency: 0.05,
            opacity: 1,
          },
        },
      },
      detectRetina: true,
      emitters: deviceCapabilities.isLowEndDevice ? [] : [
        {
          direction: 'top',
          life: {
            count: 0,
            duration: 0.1,
            delay: 0.1,
          },
          rate: {
            delay: 0.3, // Slower on mobile
            quantity: 1,
          },
          shape: 'square',
          startCount: 0,
          size: {
            mode: 'percent',
            height: 0,
            width: 0,
          },
          particles: {
            shape: {
              type: 'circle',
            },
            size: {
              value: deviceCapabilities.isMobile ? 1.5 : 2,
              random: { enable: true, minimumValue: 1 },
            },
            move: {
              direction: 'random',
              speed: deviceCapabilities.isMobile ? 1.5 : 2,
              outModes: {
                default: 'destroy',
                left: 'none',
                right: 'none',
                top: 'none',
                bottom: 'destroy',
              },
            },
            life: {
              duration: {
                value: deviceCapabilities.isMobile ? 3 : 4,
                sync: false,
              },
              count: 1,
            },
            opacity: {
              value: 1,
              animation: {
                enable: true,
                startValue: 'max',
                destroy: 'min',
                speed: 0.5,
                sync: false,
              },
            },
          },
          position: {
            x: { random: true },
            y: 0,
          },
        },
      ],
      // Performance optimizations
      smooth: true,
      retina_detect: true,
      motion: {
        disable: deviceCapabilities.isLowEndDevice,
        reduce: {
          factor: 4,
          value: true,
        },
      },
    };
  }, [deviceCapabilities, servers.length, searchQuery]);

  return {
    particleOptions,
    deviceCapabilities,
  };
};