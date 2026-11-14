"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import SceneCanvas from "../SceneCanvas";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Final transition — "return to the market".
 *
 * The scattered candlesticks from the hero converge, staggered, into a
 * large organised market structure: an ascending terrace of upright
 * candles. Chaos resolves into order as the visitor scrolls toward the
 * closing headline and CTA.
 */

const COUNT = 90;
const COLS = 15;
const ROWS = COUNT / COLS;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ramp(v: number, a: number, b: number) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}
function smooth(v: number) {
  return v * v * (3 - 2 * v);
}

interface CandleSeed {
  /** Scatter (chaos) transform */
  s: [number, number, number];
  r: [number, number, number];
  /** Organised (target) position */
  t: [number, number, number];
  bodyH: number;
  delay: number;
  bull: boolean;
}

function buildSeeds(): CandleSeed[] {
  const rand = mulberry32(2024);
  const seeds: CandleSeed[] = [];
  for (let i = 0; i < COUNT; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;

    // Organised target: ascending terrace of aligned candles
    const tx = (col - (COLS - 1) / 2) * 1.12;
    const terrace = 0.9 + row * 1.05;
    const bodyH = 0.62 + rand() * 0.28;

    seeds.push({
      s: [(rand() - 0.5) * 32, 1 + rand() * 9, -8 + rand() * 13],
      r: [(rand() - 0.5) * 1.4, (rand() - 0.5) * 1.8, (rand() - 0.5) * 1.4],
      t: [tx, terrace + bodyH / 2, 0],
      bodyH,
      // Staggered organisation: lower terraces settle first
      delay: (1 - row / ROWS) * 0.28 + rand() * 0.22,
      bull: i % 9 !== 4, // sparse controlled red accents
    });
  }
  return seeds;
}

const BULL = new THREE.Color("#0fae7d");
const BEAR = new THREE.Color("#b03636");
const tmpColor = new THREE.Color();

/** Camera drifts up over the chaos, then descends into the formed structure. */
const POS = [
  [-7, 7, 26],
  [0, 10.5, 21],
  [0, 4.8, 17.5],
];
const TGT = [
  [0, 4.5, 0],
  [0, 5.2, 0],
  [0, 4.2, 0],
];

export function StructureRig({
  progressRef,
  isLight,
  reducedMotion,
}: {
  progressRef: React.RefObject<number>;
  isLight: boolean;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const seeds = useMemo(() => buildSeeds(), []);
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const wickRef = useRef<THREE.InstancedMesh>(null);
  const gridRef = useRef<THREE.GridHelper>(null);

  const p = useRef(-1);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const keyA = useMemo(() => new THREE.Vector3(), []);
  const keyB = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const white = new THREE.Color(1, 1, 1);
    for (const ref of [bodyRef, wickRef]) {
      const mesh = ref.current;
      if (!mesh) continue;
      for (let i = 0; i < COUNT; i++) mesh.setColorAt(i, white);
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, []);

  useFrame(({ clock }, delta) => {
    const body = bodyRef.current;
    const wick = wickRef.current;
    if (!body || !wick) return;

    const targetP = reducedMotion ? 1 : progressRef.current ?? 0;
    p.current =
      reducedMotion || p.current < 0
        ? targetP
        : p.current + (targetP - p.current) * Math.min(1, delta * 6);
    const pr = Math.min(Math.max(p.current, 0), 1);
    const time = reducedMotion ? 0 : clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      const seed = seeds[i];
      // Staggered convergence from chaos to structure
      const org = smooth(ramp(pr * 1.55 - seed.delay, 0, 0.62));

      const wobY = reducedMotion ? 0 : (1 - org) * Math.sin(time * 0.7 + i * 1.3) * 0.4;
      const x = seed.s[0] + (seed.t[0] - seed.s[0]) * org;
      const y = seed.s[1] + (seed.t[1] - seed.s[1]) * org + wobY;
      const z = seed.s[2] + (seed.t[2] - seed.s[2]) * org;

      const shimmer = !reducedMotion && org > 0.95 ? 1 + Math.sin(time * 2 + i * 0.9) * 0.04 : 1;

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        seed.r[0] * (1 - org),
        seed.r[1] * (1 - org),
        seed.r[2] * (1 - org)
      );
      const bw = 0.42 * shimmer;
      dummy.scale.set(bw, seed.bodyH, bw);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);

      const wickH = seed.bodyH * 1.35;
      dummy.position.set(x, y + seed.bodyH * 0.18, z);
      dummy.scale.set(0.055, wickH, 0.055);
      dummy.updateMatrix();
      wick.setMatrixAt(i, dummy.matrix);

      tmpColor.copy(seed.bull ? BULL : BEAR);
      tmpColor.multiplyScalar((0.45 + 0.65 * org) * shimmer);
      body.setColorAt(i, tmpColor);
      wick.setColorAt(i, tmpColor);
    }
    body.instanceMatrix.needsUpdate = true;
    wick.instanceMatrix.needsUpdate = true;
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (wick.instanceColor) wick.instanceColor.needsUpdate = true;

    // The market grid emerges once order takes hold
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.Material;
      mat.transparent = true;
      mat.opacity = ramp(pr, 0.55, 0.88) * 0.22;
    }

    // Camera path
    const seg = pr * (POS.length - 1);
    const ki = Math.min(Math.floor(seg), POS.length - 2);
    const local = smooth(seg - ki);
    keyA.set(...(POS[ki] as [number, number, number]));
    keyB.set(...(POS[ki + 1] as [number, number, number]));
    pos.lerpVectors(keyA, keyB, local);
    if (reducedMotion) camera.position.copy(pos);
    else camera.position.lerp(pos, 1 - Math.exp(-5 * delta));
    keyA.set(...(TGT[ki] as [number, number, number]));
    keyB.set(...(TGT[ki + 1] as [number, number, number]));
    lookAt.lerpVectors(keyA, keyB, local);
    camera.lookAt(lookAt);
  });

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={0.35} metalness={0.15} />
      </instancedMesh>
      <instancedMesh
        ref={wickRef}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={0.55} metalness={0.05} />
      </instancedMesh>
      <gridHelper
        key={isLight ? "light-grid" : "dark-grid"}
        ref={gridRef}
        args={
          isLight
            ? [240, 120, "#a79d8a", "#ddd6c8"]
            : [240, 120, "#2a3648", "#131a26"]
        }
        position={[0, 0.002, 0]}
      />
    </group>
  );
}

/**
 * Outro canvas. Pauses its render loop entirely while offscreen.
 */
export default function MarketStructureScene({
  progressRef,
  reducedMotion,
}: {
  progressRef: React.RefObject<number>;
  reducedMotion: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  BULL.set(isLight ? "#087d58" : "#0fae7d");
  BEAR.set(isLight ? "#b42333" : "#b03636");
  const background = isLight ? "#f3f6f7" : "#05070f";

  return (
    <div ref={rootRef} className="absolute inset-0" aria-hidden>
      <SceneCanvas
        frameloop={active ? (reducedMotion ? "demand" : "always") : "never"}
        dpr={[1, 1.75]}
        camera={{ position: (reducedMotion ? POS[2] : POS[0]) as [number, number, number], fov: 42 }}
      >
        <color attach="background" args={[background]} />
        <fog attach="fog" args={[background, 30, 92]} />
        <ambientLight intensity={isLight ? 0.65 : 0.24} />
        <hemisphereLight
          args={isLight ? ["#fbfcfd", "#cbd4d0", 0.9] : ["#232b3a", "#05070a", 0.55]}
        />
        <directionalLight
          position={[10, 20, 12]}
          intensity={1.25}
          color={isLight ? "#fff7df" : "#ffe9c4"}
        />
        <directionalLight
          position={[-14, 10, -10]}
          intensity={0.45}
          color={isLight ? "#66768a" : "#8fa3bf"}
        />
        <StructureRig progressRef={progressRef} isLight={isLight} reducedMotion={reducedMotion} />
      </SceneCanvas>

      {/* Legibility gradient for the closing copy */}
      <div className="pointer-events-none absolute inset-0 bg-ink-950/40" />
    </div>
  );
}
