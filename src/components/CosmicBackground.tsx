import React from 'react';

const CosmicBackground: React.FC = () => {
  // Generate fixed star positions for constellation lines
  const stars = Array.from({ length: 80 }, (_, i) => {
    const size = Math.random() > 0.8 ? 'large' : Math.random() > 0.5 ? 'medium' : 'small';
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size,
      delay: Math.random() * 3,
    };
  });


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
          }}
        />
      ))}


      {/* Photons */}
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={`photon-${i}`}
          className="photon"
          style={{
            top: `${20 + i * 20}%`,
            animationDelay: `${i * 1}s`,
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
            animationDelay: `${3 + i * 5}s`,
            animationDuration: `3s`,
          }}
        />
      ))}

    </div>
  );
};

export default CosmicBackground;