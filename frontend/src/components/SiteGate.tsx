"use client";

import { useState } from "react";

const ACCESS_PASSWORD = "Iamgreat2;";

type Props = {
  children: React.ReactNode;
};

export default function SiteGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password. Try again.");
      setPassword("");
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#05010a] via-[#110022] to-[#05010a] flex items-center justify-center px-4">
        {/* Glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-purple-600/30 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-500/30 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-fuchsia-400 shadow-[0_0_40px_rgba(168,85,247,0.8)] flex items-center justify-center">
                <span className="text-2xl font-black tracking-tight text-black">
                  V
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text mb-2">
              VOID ACCESS REQUIRED
            </h1>
            <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text mb-2">
              WEBSITE NOT RELEASED YET
            </h1>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              This site is locked behind a private access key. Enter the admin
              password to continue.
            </p>
          </div>

          <div className="admin-card glass shine-hover rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="px-6 pt-6 pb-5 border-b border-white/10">
              <p className="text-xs font-medium tracking-[0.3em] text-gray-400 uppercase">
                SECURE GATEWAY
              </p>
              <p className="mt-2 text-sm text-gray-300">
                Only authorized VOID members may enter.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 uppercase tracking-[0.2em]">
                  Access password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] focus:border-transparent transition-all duration-300"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-xs text-red-400">{error}</p>
                )}
              </div>

              <button
                type="submit"
                className="void-button w-full mt-2 min-h-[44px] text-sm font-semibold tracking-wide uppercase"
              >
                Enter VOID
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

