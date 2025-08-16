# Void Esports Website

A modern, professional esports organization website built with Next.js 15, featuring advanced animations, responsive design, and comprehensive multi-page navigation.

## 🚀 Features

### Multi-Page Structure
- **Comprehensive Navigation**: Full site navigation with breadcrumbs and smooth transitions
- **Pagination System**: Advanced pagination for news, products, and team content
- **Category Filtering**: Dynamic filtering for news articles and products
- **Responsive Design**: Optimized for all screen sizes from mobile to desktop

### Enhanced Animations
- **Scroll Reveal Animations**: Elements animate into view as users scroll
- **Parallax Effects**: Smooth parallax scrolling for enhanced visual appeal
- **Micro-interactions**: Hover effects, button animations, and loading states
- **Performance Optimized**: GPU-accelerated animations with reduced motion support

### Display Improvements
- **Grid Layouts**: Organized content display with proper spacing and alignment
- **Image Optimization**: Next.js Image component with proper sizing and lazy loading
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: Comprehensive error boundaries and fallback states

### Technical Enhancements
- **SEO Optimization**: Complete meta tags, structured data, and sitemap
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Performance**: Optimized animations, lazy loading, and efficient rendering
- **Type Safety**: Full TypeScript implementation with proper interfaces

## 🛠️ Components

### Core Components
- `Navbar` - Enhanced navigation with mobile menu and animations
- `Footer` - Social links and site information
- `PageTransition` - Smooth page transitions with loading states
- `Breadcrumbs` - Navigation breadcrumbs for better UX

### Content Components
- `NewsGrid` - Paginated news articles with category filtering
- `TeamGrid` - Team display with detailed information and pagination
- `ProductGrid` - Shop products with sorting and filtering
- `PlacementGrid` - Tournament placements with game filtering

### Animation Components
- `EnhancedAnimations` - Advanced animation utilities and hooks
- `LoadingStates` - Skeleton loaders and loading indicators
- `AnimatedCounter` - Number counting animations
- `ScrollToTop` - Smooth scroll to top with progress indicator

### Utility Components
- `Pagination` - Reusable pagination component
- `ErrorBoundary` - Error handling and recovery
- `SEOHead` - SEO optimization utilities

## 📱 Pages

1. **Home** (`/`) - Hero section with featured content and stats
2. **Teams** (`/teams`) - Team information with pagination
3. **News** (`/news`) - Latest news with filtering and pagination
4. **Shop** (`/shop`) - Product catalog with sorting and filtering
5. **Placements** (`/placements`) - Tournament results with game filtering
6. **Schedule** (`/schedule`) - Upcoming matches and events
7. **Live Stream** (`/live-stream`) - Twitch integration and live content
8. **About** (`/about`) - Organization information and values
9. **Ambassadors** (`/ambassadors`) - Brand ambassador program
10. **Careers** (`/careers`) - Job opportunities and company culture
11. **Contact** (`/contact`) - Contact form with email integration

## 🎨 Design System

### Colors
- Primary: `#FFFFFF` (White)
- Secondary: `#a2a2a2` (Light Gray)
- Background: `#0F0F0F` (Dark)
- Card Background: `#1A1A1A`
- Border: `#2A2A2A`

### Typography
- Headings: Bold, gradient text effects
- Body: Clean, readable with proper line spacing
- Interactive: Hover states and transitions

### Animations
- **Duration**: 300-800ms for most interactions
- **Easing**: Custom cubic-bezier functions
- **Performance**: GPU-accelerated with `will-change` properties
- **Accessibility**: Respects `prefers-reduced-motion`

## 🔧 Technical Implementation

### Animation System
```css
/* Enhanced animations with performance optimization */
.gpu-accelerated {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### Scroll Reveal
```typescript
// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
```

### Pagination Logic
```typescript
// Advanced pagination with filtering
const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
const currentItems = filteredItems.slice(startIndex, endIndex);
```

## 📊 Performance Optimizations

1. **Image Optimization**: Next.js Image component with proper sizing
2. **Animation Performance**: GPU acceleration and requestAnimationFrame
3. **Code Splitting**: Component-based architecture for better loading
4. **Lazy Loading**: Content loads as needed
5. **Reduced Motion**: Accessibility support for motion preferences

## 🌐 SEO Features

- Complete meta tag implementation
- Structured data for search engines
- Sitemap and robots.txt generation
- Open Graph and Twitter Card support
- Canonical URLs and proper heading hierarchy

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Key Improvements Made

1. **Multi-Page Navigation**: Implemented comprehensive pagination system
2. **Enhanced Animations**: Upgraded all animations for smoother, more professional feel
3. **Display Fixes**: Resolved content rendering issues and improved layouts
4. **Performance**: Optimized animations and loading states
5. **Accessibility**: Added proper ARIA labels and reduced motion support
6. **SEO**: Complete meta tag implementation and structured data
7. **Error Handling**: Comprehensive error boundaries and fallback states
8. **Mobile Experience**: Enhanced mobile navigation and responsive design

The website now provides a premium, professional experience with smooth animations, proper content organization, and excellent performance across all devices.