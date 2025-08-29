"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Scrolls window to top whenever the route (pathname or query) changes.
 * Place this once in the root layout so it runs across the entire app.
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Always jump to top on navigation
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname, searchParams?.toString()]);

  return null;
}
