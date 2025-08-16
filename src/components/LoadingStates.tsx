"use client";

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'image' | 'button';
}

export function LoadingSkeleton({ className = '', variant = 'card' }: LoadingSkeletonProps) {
  const baseClasses = "skeleton animate-pulse";
  
  const variantClasses = {
    card: "h-64 w-full rounded-xl",
    text: "h-4 w-3/4 rounded",
    image: "h-48 w-full rounded-lg",
    button: "h-10 w-32 rounded-lg"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

interface LoadingGridProps {
  items: number;
  variant?: 'news' | 'products' | 'teams';
}

export function LoadingGrid({ items, variant = 'news' }: LoadingGridProps) {
  const gridClasses = {
    news: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
    products: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",
    teams: "space-y-16"
  };

  return (
    <div className={gridClasses[variant]}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="space-y-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          {variant === 'teams' ? (
            <div className="void-card">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LoadingSkeleton variant="image" />
                <div className="space-y-4">
                  <LoadingSkeleton variant="text" className="h-8 w-1/2" />
                  <LoadingSkeleton variant="text" className="h-4 w-full" />
                  <LoadingSkeleton variant="text" className="h-4 w-3/4" />
                  <div className="space-y-2">
                    <LoadingSkeleton variant="text" className="h-3 w-1/3" />
                    <LoadingSkeleton variant="text" className="h-3 w-1/2" />
                    <LoadingSkeleton variant="text" className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="void-card">
              <LoadingSkeleton variant="image" />
              <div className="space-y-3 mt-4">
                <div className="flex justify-between">
                  <LoadingSkeleton variant="text" className="h-3 w-16" />
                  <LoadingSkeleton variant="text" className="h-6 w-20 rounded-full" />
                </div>
                <LoadingSkeleton variant="text" className="h-6 w-3/4" />
                <LoadingSkeleton variant="text" className="h-4 w-full" />
                <LoadingSkeleton variant="text" className="h-4 w-2/3" />
                {variant === 'products' && (
                  <LoadingSkeleton variant="button" className="w-full" />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF] rounded-full animate-spin ${className}`} />
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <LoadingSpinner size="lg" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#a2a2a2] rounded-full animate-spin mx-auto" 
               style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <div className="space-y-2">
          <p className="text-white text-xl font-semibold animate-pulse">VOID</p>
          <div className="flex space-x-1 justify-center">
            {[0, 150, 300].map((delay, index) => (
              <div 
                key={index}
                className="w-2 h-2 bg-[#FFFFFF] rounded-full animate-bounce" 
                style={{ animationDelay: `${delay}ms` }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}