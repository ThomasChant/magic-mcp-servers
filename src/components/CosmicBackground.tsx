import React, { useMemo } from 'react';

const CosmicBackground: React.FC = React.memo(() => {
  // Generate stars with consistent but varied properties
  const stars = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => {
      // Increase chances of larger stars
      const size = Math.random() > 0.6 ? 'large' : Math.random() > 0.3 ? 'medium' : 'small';
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        delay: Math.random() * 6, // Increased delay range for more variation
      };
    }), []
  );


  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Generated Stars */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className={`star ${star.size}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      ))}


      {/* Photons - increased count for more activity */}
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={`photon-${i}`}
          className="photon"
          style={{
            top: `${25 + i * 25}%`,
            animationDelay: `${i * 2.5}s`,
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Shooting Stars */}
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={`shooting-${i}`}
          className="shooting-star"
          style={{
            top: `${30 + i * 40}%`,
            left: `${10 + i * 20}%`,
            animationDelay: `${6 + i * 8}s`,
            animationDuration: `3s`,
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Additional twinkling stars with different patterns */}
      {Array.from({ length: 25 }, (_, i) => {
        const size = Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small';
        return (
          <div
            key={`twinkle-${i}`}
            className={`star ${size}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${1.5 + Math.random() * 3}s`,
              animationIterationCount: 'infinite',
              opacity: 0.6 + Math.random() * 0.4,
            }}
          />
        );
      })}

      {/* Extra bright stars */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`bright-${i}`}
          className="star extra-large"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${4 + Math.random() * 2}s`,
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {/* Constellation stars - strategic placement */}
      {[
        { x: 20, y: 30 }, { x: 25, y: 25 }, { x: 30, y: 35 },
        { x: 70, y: 20 }, { x: 75, y: 15 }, { x: 80, y: 25 }
      ].map((pos, i) => (
        <div
          key={`constellation-${i}`}
          className="star large"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `3s`,
            animationIterationCount: 'infinite',
          }}
        />
      ))}

    </div>
  );
});

CosmicBackground.displayName = 'CosmicBackground';

export default CosmicBackground;