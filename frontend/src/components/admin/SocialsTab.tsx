"use client";

import { LinkIcon } from '@heroicons/react/24/outline';
import { AnimatedCard } from '@/components/FramerAnimations';
import { useRouter } from 'next/navigation';

export default function SocialsTab() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <AnimatedCard className="admin-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LinkIcon className="w-6 h-6" />
            Social Media Management
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/adminpanel/socials')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Open Socials Manager
            </button>
          </div>
        </div>
        <p className="text-gray-400 text-sm">Manage social media links displayed on the website footer and other pages.</p>
      </AnimatedCard>
    </div>
  );
}
