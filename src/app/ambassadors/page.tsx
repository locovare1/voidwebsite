import React from "react";
import Image from 'next/image';

export default function AmbassadorsPage() {
  return (
    <>
      {/* SEO / Meta Tags */}
      <title>Void Outreach Program | Void Esports</title>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Join the Void Outreach Program and become an official brand ambassador! Help Void grow in every game you play." />
      <meta property="og:title" content="Void Outreach Program | Void Esports" />
      <meta property="og:description" content="Join the Void Outreach Program and become an official brand ambassador! Help Void grow in every game you play." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.voidesports.org/ambassadors " />
      <meta property="og:image" content="https://www.voidesports.org/logo.png " />

      <main className="min-h-screen bg-black text-gray-100">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-black flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
          {/* Logo background */}
          <Image
            src="/logos/logo.png"
            alt="Void Logo Background"
            width={400}
            height={400}
            className="absolute left-1/2 top-1/2 w-72 md:w-[400px] -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none transition-opacity duration-500 will-change-opacity fade-on-scroll"
            style={{ zIndex: 0 }}
          />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-10 leading-tight text-white">
              Announcing the Void Outreach Program!
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mt-4">
              The Void Outreach Program allows anyone to become an official brand ambassador today and help Void grow in every game you play!
            </p>
          </div>
        </section>

        {/* What is it Section */}
        <section className="py-16 px-6 bg-[#0F0F0F]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              What is it?
            </h2>
            <div className="bg-[#18181b] rounded-xl shadow-md p-8">
              <p className="text-lg text-gray-300 leading-relaxed">
                The Void Outreach Program is very simple. Make a team or group in any game you play. Reach out to us showing you have made it and then that&apos;s it. You will be an official brand ambassador in that game and will be featured on our website when it is all set up. All you have to do is make sure that you play that game often enough so that we are active in that game.
              </p>
            </div>
          </div>
        </section>

        {/* Why we're doing this Section */}
        <section className="py-16 px-6 bg-black">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Why we&apos;re doing this?
            </h2>
            <div className="bg-[#18181b] rounded-xl shadow-md p-8">
              <p className="text-lg text-gray-300 leading-relaxed">
                This is to help us grow outside of Fortnite. We would love to gain a presence in games like Siege, CSGO, Warzone, Clash Royale, Brawl Stars and more!
              </p>
            </div>
          </div>
        </section>

        {/* What you get out of it Section */}
        <section className="py-16 px-6 bg-[#0F0F0F]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              What you get out of it?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-white">Board of Directors</h3>
                <p className="text-gray-300">
                  If you are the brand ambassador for any game and that game becomes successful for Void you are put onto the board of directors automatically. This allows you to make money from Void and have Void invest in your favorite games.
                </p>
              </div>
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-white">Content Promotion</h3>
                <p className="text-gray-300">
                  If you also want you can make content and we can end up promoting it around our brand. (This is by discretion of leadership if we invest!)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Ambassadors by Game Section */}
        <section className="py-16 px-6 bg-black">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Our Brand Ambassadors
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fortnite */}
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-white">Fortnite</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Frankenstein</p>
                  <p className="text-gray-300">- Void Gruun</p>
                </div>
              </div>
              
              {/* Brawl Stars */}
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-white">Brawl Stars</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Hyper</p>
                </div>
              </div>
              
              {/* Clash Royale */}
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-white">Clash Royale</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Bxezy</p>
                </div>
              </div>

              {/* Split Gate 2 */}
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-white">Split Gate 2</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Ego</p>
                </div>
              </div>

              {/* Overwatch 2 */}
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-white">Overwatch 2</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Current Ambassadors:</p>
                  <p className="text-gray-300">- Void Fuzzy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-[#0F0F0F]">
          <div className="max-w-3xl mx-auto bg-[#18181b] text-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Join?</h2>
            <p className="mb-6">
              If you want to become an official brand ambassador, open a support ticket today and we will discuss there!
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-black hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Contact us on the contact page
            </a>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center text-sm text-gray-600 py-8">
          <p>© {new Date().getFullYear()} Void Esports, Inc. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}

// Add this to the bottom of the file for the fade effect
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    const logo = document.querySelector('.fade-on-scroll');
    if (logo) {
      const fadeStart = 0;
      const fadeEnd = 200;
      const scrollY = window.scrollY;
      let opacity = 1;
      if (scrollY > fadeStart) {
        opacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
      }
      (logo as HTMLElement).style.opacity = String(opacity * 0.2); // 0.2 is the base opacity
    }
  });
}
