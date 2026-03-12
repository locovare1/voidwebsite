"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import CartIcon from "./CartIcon";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Roster", href: "/teams" },
  { name: "News", href: "/news" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Hide navbar during checkout
  const isCheckoutActive = pathname?.includes("/checkout") ||
    (typeof window !== 'undefined' &&
      (document.body.classList.contains('checkout-open') ||
        document.querySelector('[data-checkout-modal="true"]')));

  if (isCheckoutActive) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 bg-gradient-to-r from-[#1a0a2e]/98 via-[#2a1a3a]/98 to-[#740FA8]/40 backdrop-blur-md z-[100] border-b border-purple-500/10 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
      >
        {/* 3-column layout: perfectly centers logo even with different side elements */}
        <nav className="void-container relative grid grid-cols-3 items-center h-16 lg:h-20">
          {/* LEFT COLUMN: Hamburger & Desktop Nav */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-7 w-7" />
            </button>

            <div className="hidden lg:flex gap-x-8 ml-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold text-white transition-all duration-300 group ${pathname === item.href ? "text-purple-400" : "hover:text-gray-300"
                    }`}
                >
                  {item.name}
                  <span className={`block h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 ${pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              ))}
            </div>
          </div>

          {/* CENTER COLUMN: Logo - Sized consistently with header height */}
          <div className="flex justify-center items-center">
            <Link href="/" className="hover:scale-105 transition duration-300 flex items-center">
              <Image
                src="/logos/new-logo.png"
                alt="Void"
                width={200}
                height={200}
                className="h-10 lg:h-14 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* RIGHT COLUMN: Cart and Shop button */}
          <div className="flex justify-end items-center gap-2 lg:gap-4">
            <CartIcon />
            <Link
              href="/shop"
              className="hidden lg:block px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg hover:from-purple-500 hover:to-purple-700 transition duration-300 shadow-lg hover:shadow-purple-500/50"
            >
              Shop
            </Link>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200]">
          {/* Enhanced backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 w-full sm:max-w-xs bg-gradient-to-b from-[#1a0a2e] to-[#050505] shadow-2xl border-l border-purple-500/20 flex flex-col h-full animate-slideInRight">
            {/* COMPACT DRAWER HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/10 flex-shrink-0">
              <Image
                src="/logos/new-logo.png"
                alt="Void"
                width={100}
                height={100}
                className="h-7 w-auto object-contain"
              />
              <button
                type="button"
                className="text-white p-1.5 hover:bg-white/10 rounded-full transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            {/* VERTICALLY CENTERED LINKS */}
            <div className="flex-1 flex flex-col justify-center py-2 min-h-0">
              <nav className="flex flex-col px-6 gap-0.5">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xl font-bold transition-all duration-300 text-center ${pathname === item.href
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* COMPACT DRAWER FOOTER */}
            <div className="p-5 border-t border-purple-500/10 bg-black/60 flex-shrink-0 space-y-4">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-3.5 px-6 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all duration-300"
              >
                Shop Now
              </Link>
              <div className="flex flex-col items-center gap-1">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Void Esports</p>
                <p className="text-gray-600 text-[9px]">© 2026 OFFICIAL WEBSITE</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
