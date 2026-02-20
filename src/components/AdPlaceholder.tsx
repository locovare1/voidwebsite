"use client";

interface AdPlaceholderProps {
  size?: 'banner' | 'rectangle' | 'square' | 'skyscraper';
  className?: string;
  label?: string;
}

const sizeClasses = {
  banner: 'w-full h-24 sm:h-32 md:h-40', // 728x90, 970x250
  rectangle: 'w-full h-60 sm:h-80 md:h-96', // 300x250, 336x280
  square: 'w-full aspect-square max-w-xs mx-auto', // 250x250, 300x300
  skyscraper: 'w-full h-96 sm:h-[600px] max-w-[160px] mx-auto' // 160x600, 120x600
};

export default function AdPlaceholder({ 
  size = 'rectangle', 
  className = '',
  label = 'Advertisement'
}: AdPlaceholderProps) {
  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-white/10 rounded-lg relative overflow-hidden group`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
        }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <div className="text-gray-500 text-xs sm:text-sm font-medium mb-1 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-gray-600 text-xs">
          {size === 'banner' && '728x90 / 970x250'}
          {size === 'rectangle' && '300x250 / 336x280'}
          {size === 'square' && '250x250 / 300x300'}
          {size === 'skyscraper' && '160x600 / 120x600'}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}


