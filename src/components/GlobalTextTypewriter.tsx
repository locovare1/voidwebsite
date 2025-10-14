"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface GlobalTextTypewriterProps {
  selector?: string;
  minSpeed?: number; // ms per char min
  maxSpeed?: number; // ms per char max
  initialStagger?: number; // ms stagger between elements
  showCursor?: boolean;
}

function isSimpleTextElement(el: Element): boolean {
  // Only animate elements that contain a single text node (avoid breaking links, spans, icons)
  let elementChildren = 0;
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) elementChildren++;
  }
  return elementChildren === 0;
}

function typeElement(el: HTMLElement, text: string, opts: { min: number; max: number; showCursor: boolean }) {
  if (el.getAttribute('data-typewriter-done') === '1') return;

  const cursor = document.createElement('span');
  cursor.className = 'tw-cursor';
  cursor.textContent = '|';

  // Accessibility: preserve original text via aria-label while visually typing
  el.setAttribute('aria-label', text);
  el.setAttribute('data-typewriter-done', '0');

  const textSpan = document.createElement('span');
  textSpan.className = 'tw-text';
  textSpan.textContent = '';

  el.textContent = '';
  el.appendChild(textSpan);
  if (opts.showCursor) el.appendChild(cursor);

  let i = 0;
  const step = () => {
    if (i <= text.length) {
      textSpan.textContent = text.slice(0, i);
      i++;
      const delay = Math.random() * (opts.max - opts.min) + opts.min;
      setTimeout(step, delay);
    } else {
      el.setAttribute('data-typewriter-done', '1');
      if (opts.showCursor) cursor.remove();
    }
  };

  step();
}

export default function GlobalTextTypewriter({
  selector = 'main h1, main h2, main h3, main h4, main h5, main h6, main p, main li, main blockquote, [data-typetype]',
  minSpeed = 18,
  maxSpeed = 45,
  initialStagger = 80,
  showCursor = true,
}: GlobalTextTypewriterProps) {
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (pathname?.startsWith('/adminpanel')) return; // exclude admin panel

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter(el => !el.closest('[data-no-typetype]'))
      .filter(el => !el.hasAttribute('data-no-typetype'))
      .filter(el => isSimpleTextElement(el))
      .filter(el => !el.getAttribute('data-typewriter-done'))
      .filter(el => (el.textContent || '').trim().length >= 3);

    if (nodes.length === 0) return;

    const startTyping = (el: HTMLElement, delayMs: number) => {
      const original = (el.textContent || '').trim();
      typeElement(el, original, { min: minSpeed, max: maxSpeed, showCursor });
    };

    // Lazy start when visible
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting && el.getAttribute('data-typewriter-done') !== '1') {
          const index = nodes.indexOf(el);
          const delay = Math.max(0, index) * initialStagger;
          setTimeout(() => startTyping(el, delay), delay);
          observerRef.current?.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    nodes.forEach(el => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [pathname, selector, minSpeed, maxSpeed, initialStagger, showCursor]);

  return null;
}
