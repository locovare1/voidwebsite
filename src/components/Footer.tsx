"use client";

import Link from 'next/link';
import { FaTwitter, FaDiscord, FaTwitch, FaYoutube, FaInstagram } from 'react-icons/fa';

const socialLinks = [
  { name: 'Twitter', href: 'https://x.com/VoidEsports2x', icon: FaTwitter },
  { name: 'Discord', href: 'https://discord.gg/voidesports2x', icon: FaDiscord },
  { name: 'Twitch', href: 'https://www.twitch.tv/voidesports2x', icon: FaTwitch },
  { name: 'YouTube', href: 'https://www.youtube.com/@VoidEsports1x', icon: FaYoutube },
  { name: 'Instagram', href: 'https://www.instagram.com/voidesports2x/', icon: FaInstagram },
];

const footerLinks = [
  { name: 'Contact', href: '/contact' },
  { name: 'Ambassadors', href: '/ambassadors' },
  { name: 'Careers', href: '/careers' },
];

export default function Footer() {
  // Use original data without translation
  const translatedFooterLinks = footerLinks;
  const translatedSocialLinks = socialLinks;

  return (
    <footer className="bg-gradient-to-t from-[#1a0f2e] to-[#0F0F0F] border-t border-purple-500/20">
      <div className="void-container py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-purple-gradient">VOID</h3>
            <p className="text-sm sm:text-base text-gray-400">
              Professional esports organization pushing the boundaries of competitive gaming.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {translatedFooterLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-gray-400 hover:text-purple-300 transition-colors inline-block min-h-[44px] flex items-center"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/track-order"
                  className="text-sm sm:text-base text-gray-400 hover:text-purple-300 transition-colors inline-block min-h-[44px] flex items-center"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              Connect With Us
            </h4>
            <div className="flex flex-wrap gap-4">
              {translatedSocialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-purple-300 transition-colors glow-on-hover min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={social.name}
                >
                  <span className="sr-only">{social.name}</span>
                  <social.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-purple-500/20">
          <p className="text-center text-xs sm:text-sm text-gray-400">
            © 2025 Void Esports. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
