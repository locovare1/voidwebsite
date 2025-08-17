"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on home page
  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  
  const breadcrumbItems = [
    { name: 'Home', href: '/', icon: HomeIcon },
    ...pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
      return { name, href, icon: undefined };
    })
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8 animate-slide-in-up scroll-reveal">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center stagger-child" style={{ animationDelay: `${index * 50}ms` }}>
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-600 animate-pulse" />
          )}
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-white font-medium flex items-center transition-all duration-300 hover:scale-105">
              {index === 0 && item.icon && (
                <item.icon className="w-4 h-4 mr-1 animate-pulse" />
              )}
              {item.name}
            </span>
          ) : (
            <Link 
              href={item.href}
              className="hover:text-[#FFFFFF] transition-all duration-300 flex items-center hover:scale-105 transform hover:translate-x-1 group"
            >
              {index === 0 && item.icon && (
                <item.icon className="w-4 h-4 mr-1 group-hover:animate-bounce" />
              )}
              <span className="relative">
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFFFFF] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}