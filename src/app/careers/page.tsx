"use client";

import React from "react";

export default function CareersPage() {
  return (
    <>
      {/* SEO / Meta Tags */}
      <meta charSet="UTF-8" />
      <title>Careers | Void Esports</title>
      <meta name="description" content="Join Void Esports! We're looking for passionate individuals to help shape the future of our company." />
      <meta property="og:title" content="Careers | Void Esports" />
      <meta property="og:description" content="Join Void Esports! We're looking for passionate individuals to help shape the future of our company." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.voidesports.org/careers " />
      <meta property="og:image" content="https://www.voidesports.org/logo.png " />

      <main className="min-h-screen bg-black text-gray-100">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-black flex flex-col items-center justify-center min-h-[500px]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
              Build the Future With Us
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              We&apos;re crafting something amazing — and we want you on board.
              Check back soon for current openings across engineering, design, marketing, and more.
            </p>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 px-6 bg-[#0F0F0F]">
          <div className="max-w-3xl mx-auto bg-[#18181b] rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Positions Coming Soon
            </h2>
            <p className="text-gray-400">
              We&apos;re currently finalizing our hiring roadmap. Stay tuned for new opportunities
              in recruitment, design, marketing, customer success, and more.
            </p>
          </div>
        </section>

        {/* About Our Culture */}
        <section className="py-16 px-6 bg-black">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Why Join Us?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-white">Innovation First</h3>
                <p className="text-gray-300">
                  We encourage creativity and experimentation. Solve real-world problems with cutting-edge tools.
                </p>
              </div>
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-white">Growth-Focused</h3>
                <p className="text-gray-300">
                  We invest in your development. From mentorship to learning budgets, grow with us.
                </p>
              </div>
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-white">Remote Friendly</h3>
                <p className="text-gray-300">
                  Work from anywhere in the world. Flexible hours and inclusive culture.
                </p>
              </div>
              <div className="bg-[#18181b] p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2 text-white">Impactful Work</h3>
                <p className="text-gray-300">
                  Your work will make a difference — for users, for the planet, and for the future.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-[#0F0F0F]">
          <div className="max-w-3xl mx-auto bg-[#18181b] text-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay in the Loop</h2>
            <p className="mb-6">
              Want to be among the first to know when jobs are posted? Reach out now!
            </p>
            <a
              href="https://www.voidesports.org/contact "
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
