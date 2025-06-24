# ParticleHero Component

## Overview
The ParticleHero component is a modern, performance-optimized particle system that replaces the previous InteractiveStarField component. It provides a visually stunning cosmic background with interactive particle effects while maintaining excellent performance across all device types.

## Features

### 🌟 Interactive Particle Effects
- **Dynamic particle system** using tsParticles with 60fps performance
- **Mouse interaction** with attraction/repulsion effects
- **Click-to-add** particles for user engagement
- **Bubble effects** on hover with size and opacity animations

### 🎨 Visual Effects
- **Category-based colors** for particles based on server categories
- **Star-shaped particles** mixed with traditional circles
- **Twinkle animations** for enhanced visual appeal
- **Connected particle links** creating constellation patterns
- **Enhanced shooting stars** with gradient trails
- **Nebula effects** with rotating cosmic backgrounds

### 📱 Performance Optimization
- **Device capability detection** for adaptive rendering
- **Mobile-specific optimizations** with reduced particle counts
- **Low-end device support** with simplified effects
- **WebGL detection** with fallback options
- **FPS limiting** based on device capabilities

### 🔍 Search Integration
- **Search query highlighting** with animated particle effects
- **Category filtering** support
- **Real-time particle updates** based on search results
- **Server interaction** with click-to-navigate functionality

## Props

```typescript
interface ParticleHeroProps {
  servers: MCPServer[];           // Array of server data for interactive stars
  searchQuery?: string;          // Current search query for highlighting
  selectedCategory?: string;     // Selected category for filtering
  enableCategoryFilter?: boolean; // Enable category-based filtering
  maxStars?: number;            // Maximum number of interactive stars (default: 200)
}
```

## Performance Characteristics

### Desktop (High-end)
- **80 particles** with full effects
- **60 FPS** target with all animations
- **Constellation links** and triangulation
- **Multiple shooting stars** and nebula effects
- **Full interactivity** with attraction/repulsion

### Mobile/Tablet
- **40-60 particles** with optimized effects
- **30 FPS** on lower-end devices
- **Simplified animations** with reduced complexity
- **Disabled hover effects** for touch devices
- **Smaller interactive elements** for touch targets

### Low-end Devices
- **40 particles** maximum
- **Minimal animations** and effects
- **No constellation links** to reduce rendering load
- **Static nebula effects** without rotation
- **Reduced emitter particles**

## Device Detection

The component automatically detects:
- **Screen size** for mobile vs desktop rendering
- **Device memory** for performance scaling
- **User agent** for mobile device identification
- **WebGL support** for advanced rendering features

## Interactive Features

### Server Stars
- Each server is represented as an interactive star
- **Size** based on GitHub stars (small → extra-large)
- **Brightness** based on fork count
- **Color** based on server category
- **Click navigation** to server detail pages
- **Hover tooltips** with server information

### Search Highlighting
- Particles matching search query are highlighted
- **Pulsing animation** for matched servers
- **Category color coding** for visual categorization
- **Real-time updates** as search query changes

## CSS Integration

The component uses CSS classes from `index.css`:
- `.particle-hero-container` - Main container styling
- `.interactive-star-container` - Interactive star styling
- `.enhanced-shooting-star` - Improved shooting star animation
- `.particle-glow` - Particle glow effects
- `.particle-attract` - Mouse attraction animations

## Usage Example

```jsx
import ParticleHero from '../components/ParticleHero';

function HomePage() {
  const { data: servers } = useServers();
  const { searchQuery } = useAppStore();

  return (
    <section className="relative h-[80vh] cosmic-bg">
      <ParticleHero 
        servers={servers || []}
        searchQuery={searchQuery}
        maxStars={200}
      />
      {/* Your hero content here */}
    </section>
  );
}
```

## Performance Tips

1. **Reduce maxStars** on pages with many particles
2. **Disable effects** on very low-end devices using `deviceCapabilities`
3. **Use requestAnimationFrame** for custom animations
4. **Monitor performance** with browser dev tools
5. **Test on various devices** to ensure smooth experience

## Browser Support
- **Modern browsers** with ES6+ support
- **WebGL-enabled browsers** for full effects
- **Mobile browsers** with touch interaction support
- **Graceful degradation** for older browsers

## Migration from InteractiveStarField

The ParticleHero component is a drop-in replacement for InteractiveStarField with:
- **Same props interface** for easy migration
- **Enhanced visual effects** with modern particle system
- **Better performance** across all device types
- **Maintained functionality** for search and navigation
- **Improved accessibility** and responsive design