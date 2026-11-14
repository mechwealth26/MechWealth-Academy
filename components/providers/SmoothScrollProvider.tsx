"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { LenisRefContext } from "@/hooks/useLenis";

/**
 * Global smooth-scroll provider.
 *
 * Uses Lenis' own animation-frame loop and disables itself when the user
 * prefers reduced motion.
 * The instance is exposed via a ref (see `hooks/useLenis.ts`) rather than
 * state so consumers never cause extra renders.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const instance = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenisRef.current = instance;

    return () => {
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisRefContext.Provider value={lenisRef}>
      {children}
    </LenisRefContext.Provider>
  );
}
