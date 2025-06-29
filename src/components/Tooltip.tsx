import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 500, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        const tooltipWidth = 300; // Approximate width
        const tooltipHeight = 100; // Approximate height
        
        let x = rect.left + rect.width / 2;
        let y = rect.top - tooltipHeight - 10;
        
        // Adjust if tooltip would go off screen
        if (x + tooltipWidth / 2 > window.innerWidth) {
          x = window.innerWidth - tooltipWidth / 2 - 10;
        }
        if (x - tooltipWidth / 2 < 0) {
          x = tooltipWidth / 2 + 10;
        }
        if (y < 0) {
          y = rect.bottom + 10;
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
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg max-w-xs border border-gray-600 dark:border-gray-500"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="relative">
            {content}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tooltip;