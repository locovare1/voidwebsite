"use client";

import Link from 'next/link';
import { FaTwitter, FaDiscord, FaTwitch, FaYoutube, FaInstagram } from 'react-icons/fa';

const socialLinks = [
  { name: 'Twitter', href: 'https://x.com/VoidEsports2x', icon: FaTwitter },
  { name: 'Discord', href: 'https://discord.gg/voidesports2x', icon: FaDiscord },
  { name: 'Twitch', href: 'https://www.twitch.tv/voidfrankenstein', icon: FaTwitch },
  { name: 'YouTube', href: 'https://www.youtube.com/@VoidEsports1x', icon: FaYoutube },
  { name: 'Instagram', href: 'https://www.instagram.com/voidesports2x/', icon: FaInstagram },
];

const footerLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Careers', href: '/careers' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F0F0F] border-t border-gray-800">
      <div className="void-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold gradient-text">VOID</h3>
            <p className="text-gray-400">
              Professional esports organization pushing the boundaries of competitive gaming.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#FFFFFF] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/track-order"
                  className="text-gray-400 hover:text-[#FFFFFF] transition-colors"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Connect With Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-[#FFFFFF] transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  <social.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} Void Esports. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
