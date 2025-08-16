"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Teams', href: '/teams' },
  { name: 'Live Stream', href: '/live-stream' },
  { name: 'News', href: '/news' },
  { name: 'Placements', href: '/placements' },
  { name: 'Schedule', href: '/schedule' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Ambassadors', href: '/ambassadors' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-[#0F0F0F]/95 backdrop-blur-sm z-[100] animate-slide-in-down gpu-accelerated">
      <nav className="void-container flex items-center justify-between py-4">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Void</span>
            <Image
              src="/logo.png"
              alt="Void Logo"
              width={48}
              height={48}
              className="h-12 w-auto transition-transform duration-300 hover:scale-110 hover:rotate-12 gpu-accelerated"
            />
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95 gpu-accelerated"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className={`h-6 w-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`} aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold leading-6 text-white hover:text-[#a6a6a6] transition-all duration-300 relative group animate-fade-in gpu-accelerated`}
              style={{animationDelay: `${index * 0.05}s`}}
            >
              <span className="relative z-10">{item.name}</span>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#FFFFFF] to-[#a6a6a6] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link href="/contact" className="void-button hover-lift animate-scale-in stagger-1">
            Contact Us
          </Link>
        </div>
      </nav>

      {/* Enhanced Mobile Menu with better animations */}
      <div 
        className={`fixed inset-0 ${mobileMenuOpen ? 'block' : 'hidden'} lg:hidden z-[999] transition-all duration-300`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className={`fixed inset-y-0 right-0 w-full max-w-sm bg-[#0F0F0F] shadow-xl transform transition-all duration-500 ${mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} gpu-accelerated`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Image
                src="/logo.png"
                alt="Void Logo"
                width={32}
                height={32}
                className="h-8 w-auto animate-rotate-in"
              />
            </Link>
            <button
              type="button"
              className="rounded-md p-2.5 text-white hover:text-[#a6a6a6] transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95 gpu-accelerated"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 animate-rotate-in" />
            </button>
          </div>
          
          <div className="mt-6 px-6 flex flex-col bg-[#0F0F0F]">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-3 text-base font-semibold text-white hover:text-[#a6a6a6] border-b border-gray-800 transition-all duration-300 hover:translate-x-2 hover:bg-[#1A1A1A] px-2 rounded animate-slide-in-left gpu-accelerated`}
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-4 block py-3 text-base font-semibold text-white hover:text-[#a6a6a6] transition-all duration-300 hover:translate-x-2 hover:bg-[#1A1A1A] px-2 rounded animate-slide-in-left gpu-accelerated"
              style={{animationDelay: `${navigation.length * 0.1}s`}}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 
