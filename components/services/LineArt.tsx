"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const INK = "#707984";
const GOLD = "#e8c96a";
const GOLD_LIGHT = "#f1dda0";
const GRID = "rgba(207, 204, 194, 0.105)";
const GRID_MAJOR = "rgba(232, 201, 106, 0.09)";
const LOOP_PAUSE_MS = 5000;

export type LineArtDefinition = {
  paths: readonly string[];
  accentPaths: ReadonlySet<number>;
  viewBox: { width: number; height: number };
  framing: { width: number; height: number; x: number; y: number };
  grid: { step: number; x: number; y: number };
  penLift: number;
  sampleSpacing: number;
  drawSeconds: number;
  strokeWidth: number;
  opacity: number;
  headLength: number;
  playThreshold: number;
  fills?: readonly { d: string; color: string; appear: readonly [number, number] }[];
};

const VERTEX_SHADER = `
uniform float uProgress;
uniform float uWidth;

attribute vec2 aOffset;
attribute float aSide;
attribute float aT;
attribute vec2 aRange;
attribute float aAccent;

varying float vT;
varying float vReveal;
varying float vSide;
varying float vAccent;

void main() {
  vT = aT;
  vSide = aSide;
  vAccent = aAccent;

  float span = max(aRange.y - aRange.x, 1e-5);
  vReveal = clamp((uProgress - aRange.x) / span, 0.0, 1.0);

  vec3 p = position + vec3(aOffset * uWidth * 0.5, 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec3 uColor;
uniform vec3 uAccentColor;
uniform vec3 uHeadColor;
uniform float uOpacity;
uniform float uHeadLength;

varying float vT;
varying float vReveal;
varying float vSide;
varying float vAccent;

void main() {
  if (vT > vReveal) discard;

  float drawing = 1.0 - step(0.9995, vReveal);
  float head = 1.0 - smoothstep(0.0, uHeadLength, vReveal - vT);
  vec3 base = mix(uColor, uAccentColor, vAccent);
  vec3 color = mix(base, uHeadColor, head * drawing);
  float alpha = smoothstep(1.0, 0.55, abs(vSide));

  gl_FragColor = vec4(color, alpha * uOpacity);
}
`;

type LineArtRuntime = {
  pause: () => void;
  restart: () => void;
  resume: () => void;
  destroy: () => void;
};

const FILL_VERTEX_SHADER = `
uniform float uProgress;
attribute vec3 aColor;
attribute vec2 aRange;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = aColor;
  float span = max(aRange.y - aRange.x, 1e-5);
  vAlpha = clamp((uProgress - aRange.x) / span, 0.0, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FILL_FRAGMENT_SHADER = `
precision highp float;
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;

void main() {
  if (vAlpha <= 0.001) discard;
  gl_FragColor = vec4(vColor, vAlpha * uOpacity);
}
`;

function buildGeometry(artwork: LineArtDefinition) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  svg.appendChild(pathElement);

  const lengths = artwork.paths.map((path) => {
    pathElement.setAttribute("d", path);
    return pathElement.getTotalLength();
  });
  const penLift = artwork.penLift;
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  const timeline = totalLength + penLift * (artwork.paths.length - 1);

  const positions: number[] = [];
  const offsets: number[] = [];
  const sides: number[] = [];
  const progress: number[] = [];
  const ranges: number[] = [];
  const accents: number[] = [];
  const indices: number[] = [];
  let cursor = 0;
  let vertexBase = 0;

  artwork.paths.forEach((path, pathIndex) => {
    pathElement.setAttribute("d", path);
    const length = lengths[pathIndex];
    if (length < 0.5) return;

    const rangeStart = cursor / timeline;
    const rangeEnd = (cursor + length) / timeline;
    cursor += length + penLift;

    const steps = Math.max(8, Math.ceil(length / artwork.sampleSpacing));
    const points: Array<[number, number]> = [];
    for (let index = 0; index <= steps; index += 1) {
      const point = pathElement.getPointAtLength((index / steps) * length);
      points.push([point.x, artwork.viewBox.height - point.y]);
    }

    for (let index = 0; index <= steps; index += 1) {
      const previous = points[Math.max(index - 1, 0)];
      const next = points[Math.min(index + 1, steps)];
      let tangentX = next[0] - previous[0];
      let tangentY = next[1] - previous[1];
      const magnitude = Math.hypot(tangentX, tangentY) || 1;
      tangentX /= magnitude;
      tangentY /= magnitude;
      const normalX = -tangentY;
      const normalY = tangentX;
      const pathProgress = index / steps;
      const accent = artwork.accentPaths.has(pathIndex) ? 1 : 0;

      positions.push(
        points[index][0],
        points[index][1],
        0,
        points[index][0],
        points[index][1],
        0
      );
      offsets.push(normalX, normalY, -normalX, -normalY);
      sides.push(1, -1);
      progress.push(pathProgress, pathProgress);
      ranges.push(rangeStart, rangeEnd, rangeStart, rangeEnd);
      accents.push(accent, accent);
    }

    for (let index = 0; index < steps; index += 1) {
      const start = vertexBase + index * 2;
      indices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2);
    }
    vertexBase += (steps + 1) * 2;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "aOffset",
    new THREE.Float32BufferAttribute(offsets, 2)
  );
  geometry.setAttribute("aSide", new THREE.Float32BufferAttribute(sides, 1));
  geometry.setAttribute("aT", new THREE.Float32BufferAttribute(progress, 1));
  geometry.setAttribute(
    "aRange",
    new THREE.Float32BufferAttribute(ranges, 2)
  );
  geometry.setAttribute(
    "aAccent",
    new THREE.Float32BufferAttribute(accents, 1)
  );
  geometry.setIndex(indices);
  return geometry;
}

function buildFillGeometry(artwork: LineArtDefinition) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  svg.appendChild(pathElement);
  const positions: number[] = [];
  const colors: number[] = [];
  const ranges: number[] = [];
  const color = new THREE.Color();

  artwork.fills?.forEach((fill) => {
    pathElement.setAttribute("d", fill.d);
    const length = pathElement.getTotalLength();
    if (length < 1) return;
    const steps = Math.max(12, Math.ceil(length / 4));
    const contour: THREE.Vector2[] = [];
    for (let index = 0; index < steps; index += 1) {
      const point = pathElement.getPointAtLength((index / steps) * length);
      contour.push(new THREE.Vector2(point.x, artwork.viewBox.height - point.y));
    }

    color.set(fill.color);
    const faces = THREE.ShapeUtils.triangulateShape(contour, []);
    faces.forEach((face) => {
      for (let index = 0; index < 3; index += 1) {
        const vertex = contour[face[index]];
        positions.push(vertex.x, vertex.y, -1);
        colors.push(color.r, color.g, color.b);
        ranges.push(fill.appear[0], fill.appear[1]);
      }
    });
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aRange", new THREE.Float32BufferAttribute(ranges, 2));
  return geometry;
}

function fitCamera(camera: THREE.OrthographicCamera, canvasWidth: number, canvasHeight: number, framing: LineArtDefinition["framing"]) {
  const target = canvasWidth / Math.max(canvasHeight, 1);
  let { width, height } = framing;
  if (target > width / height) width = height * target;
  else height = width / target;
  camera.left = framing.x - width / 2;
  camera.right = framing.x + width / 2;
  camera.top = framing.y + height / 2;
  camera.bottom = framing.y - height / 2;
  camera.updateProjectionMatrix();
}

function TechnicalGrid({ artwork }: { artwork: LineArtDefinition }) {
  const { width, height } = artwork.viewBox;
  const { step, x, y } = artwork.grid;
  return (
    <svg aria-hidden viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <g>
        {Array.from({ length: Math.ceil(height / step) - 1 }, (_, i) => (i + 1) * step).map((y) => (
          <line key={`grid-y-${y}`} x1="0" x2={width} y1={y} y2={y} stroke={GRID} />
        ))}
        {Array.from({ length: Math.ceil(width / step) - 1 }, (_, i) => (i + 1) * step).map((x) => (
          <line key={`grid-x-${x}`} x1={x} x2={x} y1="0" y2={height} stroke={GRID} />
        ))}
        <line x1="0" x2={width} y1={y} y2={y} stroke={GRID_MAJOR} />
        <line x1={x} x2={x} y1="0" y2={height} stroke={GRID_MAJOR} />
      </g>
    </svg>
  );
}

export default function LineArt({ active, artwork }: { active: boolean; artwork: LineArtDefinition }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<LineArtRuntime | null>(null);
  const visibleRef = useRef(false);
  const playedOnEntryRef = useRef(false);
  const previousActiveRef = useRef(false);
  const lastStartRef = useRef(0);
  const reduceMotion = Boolean(useReducedMotion());
  const [sequence, setSequence] = useState(0);
  const webglAvailable = useWebGLSupport();

  useEffect(() => {
    if (!webglAvailable) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, artwork.viewBox.width, artwork.viewBox.height, 0, -100, 100);
    camera.position.z = 10;

    const geometry = buildGeometry(artwork);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uProgress: { value: reduceMotion ? 1 : 0 },
        uWidth: { value: artwork.strokeWidth },
        uColor: { value: new THREE.Color(INK) },
        uAccentColor: { value: new THREE.Color(GOLD) },
        uHeadColor: { value: new THREE.Color(GOLD_LIGHT) },
        uOpacity: { value: artwork.opacity },
        uHeadLength: { value: artwork.headLength },
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const fillMesh = artwork.fills ? new THREE.Mesh(
      buildFillGeometry(artwork),
      new THREE.ShaderMaterial({
        vertexShader: FILL_VERTEX_SHADER,
        fragmentShader: FILL_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
          uProgress: { value: reduceMotion ? 1 : 0 },
          uOpacity: { value: 0.075 },
        },
      })
    ) : null;
    if (fillMesh) {
      fillMesh.frustumCulled = false;
      fillMesh.renderOrder = -1;
      scene.add(fillMesh);
    }

    let frameId = 0;
    let elapsed = reduceMotion ? artwork.drawSeconds : 0;
    let lastFrameTime = 0;
    let hasStarted = reduceMotion;
    let loopTimer = 0;
    let loopDueAt = 0;
    let loopDelayRemaining = LOOP_PAUSE_MS;
    let waitingToLoop = false;

    const render = () => renderer.render(scene, camera);
    const cancelFrame = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      lastFrameTime = 0;
    };
    const pause = () => {
      cancelFrame();
      if (loopTimer) {
        clearTimeout(loopTimer);
        loopTimer = 0;
        loopDelayRemaining = Math.max(0, loopDueAt - performance.now());
      }
    };
    const restart = () => {
      cancelFrame();
      if (loopTimer) clearTimeout(loopTimer);
      loopTimer = 0;
      waitingToLoop = false;
      loopDelayRemaining = LOOP_PAUSE_MS;
      hasStarted = true;
      elapsed = 0;
      material.uniforms.uProgress.value = 0;
      if (fillMesh) fillMesh.material.uniforms.uProgress.value = 0;
      render();
      resume();
    };
    const scheduleLoop = () => {
      waitingToLoop = true;
      if (reduceMotion || !visibleRef.current || loopTimer) return;
      loopDueAt = performance.now() + loopDelayRemaining;
      loopTimer = window.setTimeout(() => {
        loopTimer = 0;
        waitingToLoop = false;
        loopDelayRemaining = LOOP_PAUSE_MS;
        restart();
      }, loopDelayRemaining);
    };
    const tick = (time: number) => {
      frameId = 0;
      if (!visibleRef.current || reduceMotion) return;
      if (lastFrameTime) elapsed += Math.min((time - lastFrameTime) / 1000, 0.05);
      lastFrameTime = time;
      const progress = Math.min(elapsed / artwork.drawSeconds, 1);
      material.uniforms.uProgress.value = progress;
      if (fillMesh) fillMesh.material.uniforms.uProgress.value = progress;
      render();
      if (progress < 1) frameId = requestAnimationFrame(tick);
      else {
        lastFrameTime = 0;
        loopDelayRemaining = LOOP_PAUSE_MS;
        scheduleLoop();
      }
    };
    const resume = () => {
      if (reduceMotion || !hasStarted || !visibleRef.current) return;
      if (waitingToLoop || elapsed >= artwork.drawSeconds) {
        scheduleLoop();
        return;
      }
      if (frameId) return;
      lastFrameTime = 0;
      frameId = requestAnimationFrame(tick);
    };
    const resize = () => {
      const width = Math.max(root.clientWidth, 1);
      const height = Math.max(root.clientHeight, 1);
      renderer.setSize(width, height, false);
      fitCamera(camera, width, height, artwork.framing);
      render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    resize();
    if (reduceMotion) render();

    runtimeRef.current = {
      pause,
      restart,
      resume,
      destroy: () => {
        pause();
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        fillMesh?.geometry.dispose();
        fillMesh?.material.dispose();
        renderer.dispose();
      },
    };

    return () => {
      runtimeRef.current?.destroy();
      runtimeRef.current = null;
    };
  }, [artwork, reduceMotion, webglAvailable]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const playThreshold = mobile ? 0.55 : artwork.playThreshold;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) runtimeRef.current?.resume();
        else runtimeRef.current?.pause();

        if (
          !reduceMotion &&
          entry.intersectionRatio >= playThreshold &&
          !playedOnEntryRef.current
        ) {
          playedOnEntryRef.current = true;
          lastStartRef.current = performance.now();
          setSequence((value) => value + 1);
        }
      },
      { threshold: [0, 0.2, artwork.playThreshold, 0.55, 0.72] }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [artwork.playThreshold, reduceMotion]);

  useEffect(() => {
    if (sequence > 0 && !reduceMotion) runtimeRef.current?.restart();
  }, [reduceMotion, sequence]);

  useEffect(() => {
    if (active && !previousActiveRef.current && !reduceMotion) {
      const now = performance.now();
      if (now - lastStartRef.current >= artwork.drawSeconds * 1000) {
        playedOnEntryRef.current = true;
        lastStartRef.current = now;
        setSequence((value) => value + 1);
      }
    }
    previousActiveRef.current = active;
  }, [active, artwork.drawSeconds, reduceMotion]);

  return (
    <div ref={rootRef} className="relative h-full w-full" aria-hidden>
      <TechnicalGrid artwork={artwork} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
}
