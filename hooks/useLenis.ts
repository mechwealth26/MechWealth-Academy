"use client";

import { createContext, useContext, type RefObject } from "react";
import type Lenis from "lenis";

export const LenisRefContext = createContext<RefObject<Lenis | null> | null>(
  null
);

/**
 * Access the active Lenis instance for imperative use
 * (e.g. `useLenis()?.scrollTo("#section")`).
 * Returns null before hydration or when reduced motion is preferred.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisRefContext)?.current ?? null;
}
