'use client';

import React, { useEffect } from "react";
import Image from "next/image";

export default function ClientAmbassadorsPage() {
  useEffect(() => {
    const handleScroll = () => {
      const logo = document.querySelector(".fade-on-scroll");
      if (logo) {
        const fadeStart = 0;
        const fadeEnd = 200;
        const scrollY = window.scrollY;
        let opacity = 1;
        if (scrollY > fadeStart) {
          opacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
        }
        (logo as HTMLElement).style.opacity = String(opacity * 0.2);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-black text-gray-100">
      {/* Your full JSX goes here as before */}
      {/* Hero section, ambassador sections, footer, etc. */}
    </main>
  );
}

