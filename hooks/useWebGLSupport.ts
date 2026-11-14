"use client";

import { useEffect, useState } from "react";

/**
 * Detect WebGL without constructing a Three.js renderer. Some browsers,
 * privacy modes, test runners, and low-power devices expose canvas but cannot
 * create a WebGL context; those environments should receive the static artwork.
 */
export function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (navigator.userAgent.includes("jsdom")) {
        setSupported(false);
        return;
      }

      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl2") ??
          canvas.getContext("webgl") ??
          canvas.getContext("experimental-webgl");
        setSupported(Boolean(context));
      } catch {
        setSupported(false);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return supported;
}
