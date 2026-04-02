"use client";

import { useEffect, ReactNode } from "react";
import { useSecurityHardening } from "@/lib/useSecurityHardening";
import { initializeStorageProtection } from "@/lib/secureStorage";
import { initializeWindowProtection } from "@/lib/windowProtection";

interface SecurityInitProps {
  children: ReactNode;
}

/**
 * Security Initialization Component
 * Wraps the entire application with comprehensive security protections
 */
export default function SecurityInit({ children }: SecurityInitProps) {
  // Initialize console protection and debugger detection
  useSecurityHardening();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize storage protection (encrypts sensitive data automatically)
    initializeStorageProtection();

    // Initialize window object protection (blocks credential harvesting)
    initializeWindowProtection();

    // Additional runtime protections
    const preventScreenshotNotification = () => {
      // Note: This is limited in browsers but we can detect some cases
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        // Detect Print Screen key
        if (e.key === "PrintScreen" || e.code === "PrintScreen") {
          console.warn("⚠️ Screenshot attempt detected");
          // You could log this or take action
          e.preventDefault();
        }
      });
    };

    // Prevent drag-and-drop of sensitive elements
    const preventSensitiveDrag = () => {
      document.addEventListener("dragstart", (e: DragEvent) => {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.hasAttribute("data-sensitive")
        ) {
          e.preventDefault();
        }
      });
    };

    // Add anti-clickjacking layer
    const addClickjackingProtection = () => {
      // Make sure we're not in a frame (additional layer beyond CSP)
      if (window.self !== window.top) {
        // Try to break out of frame
        try {
          window.top!.location.href = window.location.href;
        } catch (e) {
          // If we can't break out, at least warn
          console.warn("⚠️ Clickjacking attempt detected");
        }
      }
    };

    // Initialize all protections
    preventScreenshotNotification();
    preventSensitiveDrag();
    addClickjackingProtection();

    // Log security initialization
    console.log("🔒 Security hardening initialized");

    // Cleanup on unmount
    return () => {
      // No cleanup needed for now
    };
  }, []);

  return <>{children}</>;
}
