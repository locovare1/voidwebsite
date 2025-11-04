"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/contexts/CartContext';
import CartIcon from './CartIcon';
// Removed LanguageSelector import

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Teams', href: '/teams' },
  { name: 'News', href: '/news' },
  { name: 'Placements', href: '/placements' },
  { name: 'Schedule', href: '/schedule' },
  { name: 'Live Stream', href: '/live-stream' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Ambassadors', href: '/ambassadors' },
  // Removed Translation Test link
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    // Trigger navbar animation after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Hide navbar in admin panel - moved this after all hooks
  if (pathname && pathname.startsWith('/adminpanel')) {
    return null;
  }

  return (
    <header className={`fixed top-0 left-0 right-0 bg-gradient-to-r from-[#0F0F0F]/95 via-[#0F0F0F]/95 to-[#1a0f2e]/95 backdrop-blur-sm z-[100] transition-all duration-800 border-b border-purple-500/10 ${isVisible ? 'navbar-animate' : ''}`}>
      <nav className="void-container flex items-center justify-between py-4">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 hover:scale-105 transition-transform duration-300">
            <span className="sr-only">Void</span>
            <Image
              src="/logo.png"
              alt="Void Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white hover:bg-white/10 transition-colors duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold leading-6 text-white hover:text-[#a6a6a6] transition-all duration-300 relative group ${index === 0 ? 'delay-0' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : index === 3 ? 'delay-300' : index === 4 ? 'delay-400' : index === 5 ? 'delay-500' : index === 6 ? 'delay-600' : index === 7 ? 'delay-700' : 'delay-0'}`}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-6">
          {/* Removed LanguageSelector */}
          <CartIcon />
          <Link href="/contact" className="void-button-purple glow-on-hover">
            Contact Us
          </Link>
        </div>
      </nav>

      <div 
        className={`fixed inset-0 transition-all duration-500 ${mobileMenuOpen ? 'block opacity-100' : 'hidden opacity-0'} lg:hidden z-[999] bg-black/50`}
      >
        <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gradient-to-b from-[#0F0F0F] to-[#1a0f2e] shadow-xl transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="Void Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <button
              type="button"
              title="Close menu"
              aria-label="Close menu"
              className="rounded-md p-2.5 text-white hover:text-[#a6a6a6] hover:bg-white/10 transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-6 px-6 flex flex-col">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-3 text-base font-semibold text-white hover:text-purple-300 border-b border-purple-500/10 transition-all duration-300 hover:bg-purple-500/5 hover:pl-2 ${index === 0 ? 'delay-0' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : index === 3 ? 'delay-300' : index === 4 ? 'delay-400' : index === 5 ? 'delay-500' : index === 6 ? 'delay-600' : index === 7 ? 'delay-700' : 'delay-0'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/cart"
              className="mt-4 block py-3 text-base font-semibold text-white hover:text-[#a6a6a6] transition-all duration-300 hover:bg-white/5 hover:pl-2 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
            <Link
              href="/contact"
              className="mt-4 block py-3 text-base font-semibold text-white hover:text-[#a6a6a6] transition-all duration-300 hover:bg-white/5 hover:pl-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            {/* Removed Translation Test link */}
          </div>
        </div>
      </div>
    </header>
  );
}