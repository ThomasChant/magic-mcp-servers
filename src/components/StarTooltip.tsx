import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, GitFork, Tag } from 'lucide-react';
import type { StarData } from '../hooks/useStarData';

interface StarTooltipProps {
  starData: StarData | null;
  mousePosition: { x: number; y: number };
}

const StarTooltip: React.FC<StarTooltipProps> = ({ starData, mousePosition }) => {
  const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Create portal container only once
    const container = document.createElement('div');
    container.id = 'star-tooltip-portal';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '999999';
    container.style.pointerEvents = 'none';
    container.style.width = '100%';
    container.style.height = '100%';
    
    // Check if portal already exists and remove it
    const existingPortal = document.getElementById('star-tooltip-portal');
    if (existingPortal) {
      document.body.removeChild(existingPortal);
    }
    
    document.body.appendChild(container);
    setPortalRoot(container);
    
    return () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setPortalRoot(null);
    };
  }, []);

  // Don't render if no star data or portal not ready
  if (!starData || !portalRoot) {
    return null;
  }

  const { server } = starData;

  // Calculate tooltip position to avoid edges
  const tooltipStyle = {
    position: 'fixed' as const,
    left: mousePosition.x + 15,
    top: mousePosition.y - 10,
    transform: mousePosition.x > window.innerWidth - 300 ? 'translateX(-100%)' : 'none',
    zIndex: 999999,
    pointerEvents: 'none' as const,
  };

  const tooltipContent = (
    <div
      style={tooltipStyle}
      className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700 max-w-xs animate-in fade-in duration-200"
    >
      {/* Header with icon and name */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{server.icon}</span>
        <div className="flex-1 min-w-0">
          {server.owner && (
            <div className="text-xs text-gray-400 mb-1">
              @{server.owner}
            </div>
          )}
          <h3 className="font-semibold text-sm truncate">{server.name}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>{server.stats?.stars || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              <span>{server.stats?.forks || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-300 mb-2 line-clamp-2">
        {server.description["zh-CN"]}
      </p>

      {/* Category badge */}
      <div className="flex items-center gap-2 mb-2">
        <span 
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
          style={{ 
            backgroundColor: `${starData.categoryColor}20`,
            color: starData.categoryColor,
            border: `1px solid ${starData.categoryColor}40`
          }}
        >
          <Tag className="w-3 h-3 mr-1" />
          {server.category}
        </span>
      </div>

      {/* Tags */}
      {server.tags && server.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {server.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-1.5 py-0.5 bg-gray-800 text-gray-300 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {server.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{server.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Quality score */}
      {server.quality?.score && (
        <div className="mt-2 text-xs text-gray-400">
          Quality: {server.quality.score}%
        </div>
      )}

      {/* Badges */}
      {(server.metadata?.featured || server.metadata?.verified) && (
        <div className="flex gap-1 mt-2">
          {server.metadata?.featured && (
            <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
              ⭐ Featured
            </span>
          )}
          {server.metadata?.verified && (
            <span className="inline-flex items-center px-1.5 py-0.5 bg-green-600 text-white text-xs rounded">
              ✓ Verified
            </span>
          )}
        </div>
      )}

      {/* Arrow pointer */}
      <div 
        className="absolute w-2 h-2 bg-gray-900 border-l border-b border-gray-700 rotate-45"
        style={{
          left: mousePosition.x > window.innerWidth - 300 ? 'calc(100% - 12px)' : '-4px',
          top: '16px',
        }}
      />
    </div>
  );

  return createPortal(tooltipContent, portalRoot);
};

export default StarTooltip;