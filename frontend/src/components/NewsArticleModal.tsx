"use client";

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NewsArticleModalProps {
  article: {
    title: string;
    date: string;
    image: string;
    description: string;
    category: string;
    isEvent?: boolean;
    eventDate?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsArticleModal({ article, isOpen, onClose }: NewsArticleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  return (
    <div
      className="fixed inset-0 z-[101] flex items-start justify-center bg-black/95 backdrop-blur-xl pt-20 pb-4 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 my-8 max-h-[calc(100vh-5rem)] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all border border-white/5 hover:border-white/20 group"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Article Image */}
          {article.image && (article.image.startsWith('/') || article.image.startsWith('http://') || article.image.startsWith('https://')) && (
            <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-[#050505] overflow-hidden flex-shrink-0">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
          )}

          {/* Article Content */}
          <div className="p-6 sm:p-8 lg:p-12">
            {/* Header Info */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {article.isEvent && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                  Upcoming Event
                </span>
              )}
              <span className="px-3 py-1 bg-[#FFFFFF]/20 text-[#FFFFFF] rounded-full text-xs font-medium">
                {article.category}
              </span>
              <span className="text-gray-400 text-sm">
                {article.eventDate || article.date}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 gradient-text">
              {article.title}
            </h1>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                {article.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

