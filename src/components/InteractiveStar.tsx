import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StarData } from '../hooks/useStarData';

interface InteractiveStarProps {
  starData: StarData;
  isHighlighted?: boolean;
  onHover?: (starData: StarData | null) => void;
}

const InteractiveStar: React.FC<InteractiveStarProps> = ({ 
  starData, 
  isHighlighted = false, 
  onHover 
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const starRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    navigate(`/servers/${starData.server.slug}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(starData);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  // Calculate star styles based on data
  const getStarStyles = () => {
    const baseStyles = {
      left: `${starData.x}%`,
      top: `${starData.y}%`,
      zIndex: starData.zIndex,
      opacity: starData.brightness,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: isHovered || isHighlighted ? 'scale(1.8)' : 'scale(1)',
    };

    // Size-specific styles
    const sizeStyles = {
      small: { width: '3px', height: '3px' },
      medium: { width: '4px', height: '4px' },
      large: { width: '6px', height: '6px' },
      'extra-large': { width: '8px', height: '8px' },
    };

    return {
      ...baseStyles,
      ...sizeStyles[starData.size],
    };
  };

  // Generate box-shadow based on category color and state
  const getBoxShadow = () => {
    const color = starData.color;
    const intensity = isHovered || isHighlighted ? 1.5 : 1;
    const baseGlow = `0 0 ${8 * intensity}px ${color}`;
    const mediumGlow = `0 0 ${16 * intensity}px ${color}`;
    const largeGlow = `0 0 ${24 * intensity}px ${color}`;
    
    if (starData.size === 'extra-large') {
      return `${baseGlow}, ${mediumGlow}, ${largeGlow}`;
    } else if (starData.size === 'large') {
      return `${baseGlow}, ${mediumGlow}`;
    } else {
      return baseGlow;
    }
  };

  return (
    <>
      <div
        ref={starRef}
        className={`star ${starData.size} interactive-star`}
        style={{
          ...getStarStyles(),
          background: starData.color,
          boxShadow: getBoxShadow(),
          animation: isHovered || isHighlighted ? 'none' : undefined,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={`Navigate to ${starData.server.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      />
      
      {/* Pulse effect for featured/verified servers */}
      {(starData.server.metadata?.featured || starData.server.metadata?.verified) && (
        <div
          className="star-pulse"
          style={{
            position: 'absolute',
            left: `${starData.x}%`,
            top: `${starData.y}%`,
            width: starData.size === 'extra-large' ? '16px' : starData.size === 'large' ? '12px' : '8px',
            height: starData.size === 'extra-large' ? '16px' : starData.size === 'large' ? '12px' : '8px',
            borderRadius: '50%',
            border: `1px solid ${starData.color}`,
            transform: 'translate(-50%, -50%)',
            animation: 'star-pulse 2s ease-in-out infinite',
            opacity: 0.6,
            pointerEvents: 'none',
            zIndex: starData.zIndex - 1,
          }}
        />
      )}
    </>
  );
};

export default InteractiveStar;