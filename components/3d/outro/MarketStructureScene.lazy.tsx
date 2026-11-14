"use client";

import dynamic from "next/dynamic";

export function preloadMarketStructureScene() {
  return import("./MarketStructureScene");
}

/** Lazy wrapper — see PERFORMANCE.md P-03. */
const MarketStructureScene = dynamic(() => import("./MarketStructureScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" aria-hidden />,
});

export default MarketStructureScene;
