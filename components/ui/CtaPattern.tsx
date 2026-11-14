"use client";

import { useEffect, useRef } from "react";
import styles from "./CtaPattern.module.css";

/** Decorative only; the containing panel supplies relative positioning and isolation. */
export default function CtaPattern() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.dataset.entered = "true";
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={styles.pattern}>
      <div className={styles.sweep} />
    </div>
  );
}
