"use client";

import { useEffect } from "react";

export default function ScrollRevealProvider() {
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const observeAll = () => {
      const elements = document.querySelectorAll(".scroll-reveal");
      elements.forEach((el) => observer.observe(el));
    };

    // Initial attach
    observeAll();

    // Re-run on route updates via mutation observer (covers client nav and late inserts)
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
