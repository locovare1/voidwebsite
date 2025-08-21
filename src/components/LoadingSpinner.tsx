"use client";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'gray' | 'custom';
  customColor?: string;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'white', 
  customColor,
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    white: 'border-white/20 border-t-white',
    gray: 'border-gray-400/20 border-t-gray-400',
    custom: `border-${customColor}/20 border-t-${customColor}`
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-3 rounded-full animate-spin ${colorClasses[color]}`}
        style={customColor ? {
          borderColor: `${customColor}20`,
          borderTopColor: customColor
        } : undefined}
      ></div>
      {text && (
        <p className={`mt-3 text-gray-400 ${textSizes[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
}
