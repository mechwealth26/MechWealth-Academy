"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

type SceneCanvasProps = CanvasProps & { children: ReactNode };

/**
 * Shared R3F canvas with sensible defaults for this project
 * (transparent background, capped DPR, perspective camera).
 * Wrap scenes inside sections with this instead of using <Canvas> directly.
 */
export default function SceneCanvas({ children, ...props }: SceneCanvasProps) {
  const webglAvailable = useWebGLSupport();

  if (!webglAvailable) {
    return (
      <div
        aria-hidden
        className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(232,201,106,0.12),transparent_65%)]"
      />
    );
  }

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
      {...props}
    >
      {children}
    </Canvas>
  );
}
