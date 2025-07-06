"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Teams', href: '/teams' },
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
    <header className="fixed w-full bg-[#0F0F0F]/95 backdrop-blur-sm z-[100]">
      <nav className="void-container flex items-center justify-between py-4">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
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
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-white hover:text-[#a6a6a6] transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link href="/contact" className="void-button">
            Contact Us
          </Link>
        </div>
      </nav>

      <div 
        className={`fixed inset-0 ${mobileMenuOpen ? 'block' : 'hidden'} lg:hidden z-[999]`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#0F0F0F] shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
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
              className="rounded-md p-2.5 text-white hover:text-[#a6a6a6]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-6 px-6 flex flex-col bg-[#0F0F0F]">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 text-base font-semibold text-white hover:text-[#a6a6a6] border-b border-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-4 block py-3 text-base font-semibold text-white hover:text-[#a6a6a6]"
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
