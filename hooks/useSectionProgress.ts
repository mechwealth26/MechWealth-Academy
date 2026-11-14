"use client";

import { useEffect, type RefObject, useRef } from "react";

/**
 * Tracks scroll progress (0..1) through a tall wrapper element.
 * Written into a ref so rAF render loops can read it per frame
 * without triggering React re-renders.
 */
export function useSectionProgress(target: RefObject<HTMLElement | null> | string) {
  const progressRef = useRef(0);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      const el = typeof target === "string" ? document.getElementById(target) : target.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      progressRef.current =
        total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);

  return progressRef;
}

export default useSectionProgress;
