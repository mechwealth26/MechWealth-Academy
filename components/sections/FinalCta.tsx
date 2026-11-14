"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { buttonClasses } from "@/lib/buttonStyles";
import { useSectionProgress } from "@/hooks/useSectionProgress";
import MarketStructureScene, { preloadMarketStructureScene } from "@/components/3d/outro/MarketStructureScene.lazy";

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Final CTA — the Three.js return-to-the-market transition with the
 * closing headline and call to action revealed as the structure forms.
 */
export default function FinalCta() {
  const wrapRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useSectionProgress(wrapRef);
  const reduced = useSyncExternalStore(subscribeToReducedMotion, prefersReducedMotion, () => false);
  const [sceneReady, setSceneReady] = useState(false);

  // Avoid loading and initialising the offscreen WebGL scene during page startup.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSceneReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "600px" });
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch on the first scroll so fast visitors cannot skip the preload trigger.
  // WebGL is still initialised only when the closing section approaches.
  useEffect(() => {
    const preload = () => {
      void preloadMarketStructureScene().catch(() => {
        // The dynamic component can retry loading when its section approaches.
      });
    };
    if (window.scrollY > 0) preload();
    else window.addEventListener("scroll", preload, { once: true, passive: true });
    return () => window.removeEventListener("scroll", preload);
  }, []);

  // Reveal the closing copy as the organised structure settles (p → ~0.85)
  useEffect(() => {
    if (reduced) {
      // Reduced motion: show the copy statically, no scroll choreography
      if (copyRef.current) {
        copyRef.current.inert = false;
        copyRef.current.style.opacity = "1";
        copyRef.current.style.transform = "none";
      }
      return;
    }

    let raf = 0;
    // Stop the per-frame writes entirely once the section is offscreen
    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "160px" }
    );
    if (wrapRef.current) io.observe(wrapRef.current);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const el = copyRef.current;
      if (!el) return;
      const p = progressRef.current ?? 0;
      const a = Math.min(1, Math.max(0, (p - 0.62) / 0.3));
      el.inert = a < 0.85;
      el.style.opacity = String(a);
      el.style.transform = `translateY(${(1 - a) * 24}px)`;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [progressRef, reduced]);

  return (
    <section id="enter" ref={wrapRef} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {sceneReady && <MarketStructureScene progressRef={progressRef} reducedMotion={reduced} />}

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <div
            ref={copyRef}
            inert={!reduced}
            className={`max-w-3xl text-center ${reduced ? "" : "opacity-0"}`}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold-500 sm:text-xs">
              The MECHWEALTH Academy
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] text-cream-100 sm:text-6xl xl:text-7xl">
              STOP GUESSING.
              <br />
              START <span className="text-gold-500">UNDERSTANDING.</span>
            </h2>
            <div className="pointer-events-auto mt-10">
              <a href="#programs" className={buttonClasses("primary", "lg")}>
                Enter the Academy
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
