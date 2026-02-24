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

  // Show on admin panel but with different styling
  const isAdminPanel = pathname?.startsWith("/adminpanel");
  
  // Hide navbar during checkout
  const isCheckoutActive = pathname?.includes("/checkout") || 
                          (typeof window !== 'undefined' && 
                           (document.body.classList.contains('checkout-open') ||
                            document.querySelector('[data-checkout-modal="true"]')));
  
  if (isCheckoutActive) {
    return null; // Don't render navbar during checkout
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-gradient-to-r from-[#1a0a2e]/95 via-[#2a1a3a]/95 to-[#740FA8]/30 backdrop-blur-sm z-[100] border-b border-purple-500/10 transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      {/* Desktop: 3-column layout to perfectly center the logo */}
      <nav className="void-container relative grid grid-cols-3 items-center py-4">
        {/* LEFT COLUMN — Mobile menu & desktop nav */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-md text-white hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold text-white transition group ${
                  pathname === item.href ? "text-purple-400" : "hover:text-gray-300"
                }`}
              >
                {item.name}
                <span className="block h-0.5 w-0 bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN — Logo */}
        <div className="flex justify-center items-center">
          <Link
            href="/"
            className="hover:scale-105 transition duration-300"
          >
            <Image
              src="/logos/new-logo.png"
              alt="Void"
              width={250}
              height={250}
              className="h-16 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* RIGHT COLUMN — Cart and Shop button (desktop only) */}
        <div className="hidden lg:flex justify-end items-center gap-4">
          <CartIcon />
          <Link
            href="/shop"
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg hover:from-purple-500 hover:to-purple-700 transition duration-300 shadow-lg hover:shadow-purple-500/50"
          >
            Shop
          </Link>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] bg-black/70">
          <div className="fixed right-0 top-0 h-full w-64 bg-[#05010a] p-6 shadow-xl">
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-md transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Mobile Nav Items */}
            <div className="mt-10 space-y-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-semibold text-white hover:text-purple-400 transition"
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Cart and Shop Buttons */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/cart"
                  className="block px-4 py-2 text-lg font-semibold text-white bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg hover:from-gray-500 hover:to-gray-700 transition duration-300 text-center"
                >
                  Cart
                </Link>
                <Link
                  href="/shop"
                  className="block px-4 py-2 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg hover:from-purple-500 hover:to-purple-700 transition duration-300 text-center"
                >
                  Shop
                </Link>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}
