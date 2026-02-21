"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTwitter, FaDiscord, FaTwitch, FaYoutube, FaInstagram, FaTiktok, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { socialService, type SocialLink } from '@/lib/socialService';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: FaTwitter,
  discord: FaDiscord,
  twitch: FaTwitch,
  youtube: FaYoutube,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
};

const footerLinks = [
  { name: 'Contact', href: '/contact' },
  { name: 'Ambassadors', href: '/ambassadors' },
  { name: 'Careers', href: '/careers' },
  { name: 'Track Order', href: '/track-order' },
];

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const links = await socialService.getAll();
        if (!mounted) return;
        setSocialLinks(links);
      } catch (error) {
        console.error('Error loading social links:', error);
        // Fallback to empty array
        setSocialLinks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const translatedFooterLinks = footerLinks;

  return (
    <footer className="bg-gradient-to-t from-[#2a1a3a] to-[#1a0a2e] border-t border-purple-500/20">
      <div className="void-container py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-purple-gradient">VOID</h3>
            <p className="text-sm sm:text-base text-gray-400">
              Professional esports organization pushing the boundaries of competitive gaming.
            </p>
            <p className="text-sm sm:text-base text-gray-400">
              Developed by Layne454 and X.y.c.l.o.p.s (Discord)
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
            </ul>
          </div>

          {/* Social Links */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
              Connect With Us
            </h4>
            <div className="flex flex-wrap gap-4">
              {loading ? (
                <div className="text-gray-400 text-sm">Loading social links...</div>
              ) : socialLinks.length === 0 ? (
                <div className="text-gray-400 text-sm">No social links available</div>
              ) : (
                socialLinks.map((social) => {
                  const IconComponent = iconMap[social.icon.toLowerCase()] || FaTwitter;
                  return (
                    <Link
                      key={social.id || social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center group"
                      aria-label={social.name}
                    >
                      <span className="sr-only">{social.name}</span>
                      <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 group-hover:outline group-hover:outline-2 group-hover:outline-purple-300 group-hover:outline-offset-2 group-hover:rounded" />
                    </Link>
                  );
                })
              )}
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
