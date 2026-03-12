"use client";

import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md transition-all border border-neutral-300 dark:border-neutral-700 bg-background text-foreground hover:bg-purple-50 dark:hover:bg-purple-900/30"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
