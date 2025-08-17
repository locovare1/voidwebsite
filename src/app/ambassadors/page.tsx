"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';

export default function AmbassadorsPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Initialize scroll reveal animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-[#0F0F0F] text-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#0F0F0F] flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
        {/* Logo background (centered) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ zIndex: 0 }}>
          <Image
            src="/logos/logo.png"
            alt="Void Logo Background"
            width={400}
            height={400}
            className="w-72 md:w-[400px] opacity-20 animate-float gpu-accelerated"
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="stagger-child stagger-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-10 leading-tight gradient-text animate-bounce-in gpu-accelerated">
              Announcing the Void Outreach Program!
            </h1>
          </div>
          <div className="stagger-child stagger-2">
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mt-4 animate-slide-in-up gpu-accelerated">
              The Void Outreach Program allows anyone to become an official brand ambassador today and help Void grow in every game you play!
            </p>
          </div>
        </div>
      </section>

      {/* What is it Section */}
      <section className="py-16 px-6 bg-[#1A1A1A] scroll-reveal">
        <div className="max-w-4xl mx-auto">
          <div className="stagger-child stagger-1">
            <h2 className="text-3xl font-bold text-center gradient-text mb-8 animate-slide-in-up gpu-accelerated">
              What is it?
            </h2>
          </div>
          <div className="stagger-child stagger-2">
            <div className="void-card">
              <p className="text-lg text-gray-300 leading-relaxed">
                The Void Outreach Program is very simple. Make a team or group in any game you play. Reach out to us showing you have made it and then that&apos;s it. You will be an official brand ambassador in that game and will be featured on our website when it is all set up. All you have to do is make sure that you play that game often enough so that we are active in that game.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why we're doing this Section */}
      <section className="py-16 px-6 bg-[#0F0F0F] scroll-reveal">
        <div className="max-w-4xl mx-auto">
          <div className="stagger-child stagger-1">
            <h2 className="text-3xl font-bold text-center gradient-text mb-8 animate-slide-in-up gpu-accelerated">
              Why we&apos;re doing this?
            </h2>
          </div>
          <div className="stagger-child stagger-2">
            <div className="void-card">
              <p className="text-lg text-gray-300 leading-relaxed">
                This is to help us grow outside of Fortnite. We would love to gain a presence in games like Siege, CSGO, Warzone, Clash Royale, Brawl Stars and more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What you get out of it Section */}
      <section className="py-16 px-6 bg-[#1A1A1A] scroll-reveal">
        <div className="max-w-4xl mx-auto">
          <div className="stagger-child stagger-1">
            <h2 className="text-3xl font-bold text-center gradient-text mb-8 animate-slide-in-up gpu-accelerated">
              What you get out of it?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="stagger-child stagger-2">
              <div className="void-card hover-lift gpu-accelerated">
                <h3 className="text-xl font-semibold mb-2 text-white">Board of Directors</h3>
                <p className="text-gray-300">
                  If you are the brand ambassador for any game and that game becomes successful for Void you are put onto the board of directors automatically. This allows you to make money from Void and have Void invest in your favorite games.
                </p>
              </div>
            </div>
            <div className="stagger-child stagger-3">
              <div className="void-card hover-lift gpu-accelerated">
                <h3 className="text-xl font-semibold mb-2 text-white">Content Promotion</h3>
                <p className="text-gray-300">
                  If you also want you can make content and we can end up promoting it around our brand. (This is by discretion of leadership if we invest!)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Ambassadors by Game Section */}
      <section className="py-16 px-6 bg-[#0F0F0F] scroll-reveal">
        <div className="max-w-4xl mx-auto">
          <div className="stagger-child stagger-1">
            <h2 className="text-3xl font-bold text-center gradient-text mb-8 animate-slide-in-up gpu-accelerated">
              Our Brand Ambassadors
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fortnite */}
            <div className="stagger-child stagger-2">
              <div className="void-card hover-lift gpu-accelerated">
                <h3 className="text-xl font-semibold mb-4 text-white">Fortnite</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Frankenstein</p>
                  <p className="text-gray-300">- Void Gruun</p>
                </div>
              </div>
            </div>
            
            {/* Brawl Stars */}
            <div className="stagger-child stagger-3">
              <div className="void-card hover-lift gpu-accelerated">
                <h3 className="text-xl font-semibold mb-4 text-white">Brawl Stars</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Hyper</p>
                </div>
              </div>
            </div>
            
            {/* Clash Royale */}
            <div className="stagger-child stagger-4">
              <div className="void-card hover-lift gpu-accelerated">
                <h3 className="text-xl font-semibold mb-4 text-white">Clash Royale</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Bxezy</p>
                </div>
              </div>
            </div>

            {/* Split Gate 2 */}
            <div className="stagger-child stagger-5">
              <div className="void-card hover-lift gpu-accelerated">
                <h3 className="text-xl font-semibold mb-4 text-white">Split Gate 2</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Ego</p>
                </div>
              </div>
            </div>

            {/* Overwatch 2 */}
            <div className="stagger-child stagger-6">
              <div className="void-card hover-lift gpu-accelerated">
                <h3 className="text-xl font-semibold mb-4 text-white">Overwatch 2</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Fuzzy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#1A1A1A] scroll-reveal">
        <div className="max-w-3xl mx-auto">
          <div className="stagger-child stagger-1">
            <div className="void-card text-center">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Ready to Join?</h2>
              <p className="mb-6 text-gray-300">
                If you want to become an official brand ambassador, open a support ticket today and we will discuss there!
              </p>
              <a
                href="/contact"
                className="inline-block void-button hover-lift"
              >
                Contact us on the contact page
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="text-center text-sm text-gray-600 py-8">
        <p>© {new Date().getFullYear()} Void Esports, Inc. All rights reserved.</p>
      </footer>
    </main>
  );
}
