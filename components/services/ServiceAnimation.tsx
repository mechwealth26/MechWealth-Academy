"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ServiceMotifId } from "@/data/services";

function ServiceAnimationFallback() {
  return (
    <div
      aria-hidden
      className="h-full w-full animate-pulse bg-[radial-gradient(circle_at_center,rgba(232,201,106,0.12),transparent_65%)]"
    />
  );
}

const SERVICE_ANIMATIONS = {
  demat: dynamic(() => import("@/components/services/MarketAccessVault"), {
    ssr: false,
    loading: ServiceAnimationFallback,
  }),
  mutual: dynamic(() => import("@/components/services/PortfolioLoom"), {
    ssr: false,
    loading: ServiceAnimationFallback,
  }),
  insurance: dynamic(
    () => import("@/components/services/AdaptiveProtectionField"),
    { ssr: false, loading: ServiceAnimationFallback }
  ),
  physical: dynamic(() => import("@/components/services/PaperPhoton"), {
    ssr: false,
    loading: ServiceAnimationFallback,
  }),
  iepf: dynamic(() => import("@/components/services/ClaimArchaeology"), {
    ssr: false,
    loading: ServiceAnimationFallback,
  }),
} satisfies Record<ServiceMotifId, ComponentType<{ active: boolean }>>;

/**
 * Single source of truth for service illustrations. Both the index cards and
 * detail heroes use this selector so their motion, lifecycle and artwork stay
 * identical as each animation evolves.
 */
export default function ServiceAnimation({
  motif,
  active,
}: {
  motif: ServiceMotifId;
  active: boolean;
}) {
  const Animation = SERVICE_ANIMATIONS[motif];
  return (
    <div className="theme-service-animation h-full w-full">
      <Animation active={active} />
    </div>
  );
}
