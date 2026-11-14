"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";

export default function ServiceCardMotion({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const id = useId();

  return (
    <div className="mt-8" style={{ "--service-motion-state": paused ? "paused" : "running" } as CSSProperties}>
      <div className="mb-4 flex justify-end motion-reduce:hidden">
        <button
          type="button"
          aria-controls={id}
          onClick={() => setPaused((value) => !value)}
          className="min-h-11 rounded-full border border-white/10 px-4 text-xs text-copy-secondary transition-colors hover:border-gold-400/40 hover:text-gold-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
        >
          {paused ? "Resume animations" : "Pause animations"}
        </button>
      </div>
      <div id={id}>{children}</div>
    </div>
  );
}
