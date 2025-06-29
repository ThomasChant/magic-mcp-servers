import React, { useState, useRef, useEffect } from 'react';
import { Star, Tag, Calendar } from 'lucide-react';
import type { MCPServer } from '../types';

interface ServerTooltipProps {
  server: MCPServer;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const ServerTooltip: React.FC<ServerTooltipProps> = ({ server, children, delay = 300, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        const tooltipWidth = 320;
        const tooltipHeight = 220; // Approximate height
        const margin = 10;
        
        let x = rect.left + rect.width / 2;
        let y = rect.top - tooltipHeight - margin;
        
        // Adjust horizontal position if tooltip would go off screen
        const maxX = window.innerWidth - tooltipWidth - margin;
        const minX = margin;
        
        if (x + tooltipWidth / 2 > window.innerWidth - margin) {
          x = maxX - tooltipWidth / 2;
        }
        if (x - tooltipWidth / 2 < margin) {
          x = minX + tooltipWidth / 2;
        }
        
        // Adjust vertical position if tooltip would go off screen
        if (y < margin) {
          y = rect.bottom + margin;
        }
        
        setPosition({ x: x - tooltipWidth / 2, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const description = server.fullDescription || 
    server.description?.en || 
    server.description?.["zh-CN"] || 
    'No description available';

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className={className}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className="fixed z-50 w-80 max-w-sm p-4 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 transform transition-all duration-200 ease-out"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-8px)',
          }}
        >
          <div className="space-y-3">
            {/* Server Name */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base truncate pr-2">{server.name}</h4>
              <div className="flex items-center space-x-1 text-yellow-500">
                <Star className="h-3 w-3" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {server.repository?.stars || 0}
                </span>
              </div>
            </div>

            {/* Owner */}
            {server.owner && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                by @{server.owner}
              </div>
            )}

            {/* Description */}
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {description.length > 150 ? `${description.substring(0, 150)}...` : description}
            </div>

            {/* Tags */}
            {server.tags && server.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="h-3 w-3 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {server.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {server.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{server.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Updated {formatDate(server.stats?.lastUpdated || server.repository?.lastUpdated || '')}</span>
              </div>
              {server.quality?.score && (
                <div className="flex items-center space-x-1">
                  <span>Quality: {server.quality.score}/100</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-2">
              {server.featured && (
                <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                  Featured
                </span>
              )}
              {server.verified && (
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServerTooltip;