import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import * as THREE from "three";
import MarketAccessVault from "@/components/services/MarketAccessVault";
import PortfolioLoom from "@/components/services/PortfolioLoom";
import ClaimArchaeology from "@/components/services/ClaimArchaeology";
import AdaptiveProtectionField from "@/components/services/AdaptiveProtectionField";

const state = vi.hoisted(() => ({ reduced: false }));
vi.mock("framer-motion", () => ({ useReducedMotion: () => state.reduced }));
vi.mock("@/hooks/useWebGLSupport", () => ({ useWebGLSupport: () => true }));
vi.mock("three", async (importOriginal) => {
  const actual = await importOriginal<typeof import("three")>();
  return { ...actual, WebGLRenderer: vi.fn(class {
    setPixelRatio = vi.fn();
    setClearColor = vi.fn();
    setSize = vi.fn();
    render = vi.fn();
    dispose = vi.fn();
  }) };
});

let intersect: IntersectionObserverCallback;
let frames: Map<number, FrameRequestCallback>;
let frameId: number;

beforeEach(() => {
  vi.useFakeTimers();
  state.reduced = false;
  frames = new Map();
  frameId = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersect = callback; }
    observe() {}
    disconnect() {}
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(640);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(360);
  // jsdom has no SVG path sampling; use a deterministic contour for geometry tests.
  Object.defineProperty(SVGElement.prototype, "getTotalLength", {
    configurable: true, value() { return 120; },
  });
  Object.defineProperty(SVGElement.prototype, "getPointAtLength", {
    configurable: true, value(distance: number) {
      return { x: 100 + 50 * Math.cos(distance / 120 * Math.PI * 2), y: 100 + 50 * Math.sin(distance / 120 * Math.PI * 2) };
    },
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  Reflect.deleteProperty(SVGElement.prototype, "getTotalLength");
  Reflect.deleteProperty(SVGElement.prototype, "getPointAtLength");
});

function scene() {
  const renderer = vi.mocked(THREE.WebGLRenderer).mock.results.at(-1)!.value;
  const current = renderer.render.mock.calls.at(-1)[0] as THREE.Scene;
  return { renderer, meshes: current.children as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>[] };
}
function visibility(visible: boolean) {
  act(() => intersect([{ isIntersecting: visible, intersectionRatio: visible ? 1 : 0 } as IntersectionObserverEntry], {} as IntersectionObserver));
}
function advanceFrames(count: number) {
  act(() => {
    for (let i = 0; i < count; i++) {
      vi.advanceTimersByTime(50);
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(performance.now()));
    }
  });
}

describe("service line art", () => {
  it.each([MarketAccessVault, PortfolioLoom, ClaimArchaeology, AdaptiveProtectionField])("keeps reduced-motion artwork complete and disposes its meshes: %s", (Artwork) => {
    state.reduced = true;
    const view = render(<Artwork active={false} />);
    const { renderer, meshes } = scene();
    expect(meshes.length).toBe(Artwork === AdaptiveProtectionField ? 2 : 1);
    const disposals = meshes.map((mesh) => ({ geometry: vi.spyOn(mesh.geometry, "dispose"), material: vi.spyOn(mesh.material, "dispose") }));
    meshes.forEach((mesh) => expect(mesh.material.uniforms.uProgress.value).toBe(1));
    visibility(true);
    expect(frames.size).toBe(0);
    view.unmount();
    disposals.forEach(({ geometry, material }) => {
      expect(geometry).toHaveBeenCalledOnce();
      expect(material).toHaveBeenCalledOnce();
    });
    expect(renderer.dispose).toHaveBeenCalledOnce();
  });

  it("pauses offscreen, resumes, holds for five seconds, and replays both insurance layers together", () => {
    const view = render(<AdaptiveProtectionField active={false} />);
    const { meshes } = scene();
    visibility(true);
    advanceFrames(20);
    const progress = meshes[0].material.uniforms.uProgress.value;
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
    expect(meshes[1].material.uniforms.uProgress.value).toBe(progress);
    visibility(false);
    advanceFrames(20);
    expect(meshes[0].material.uniforms.uProgress.value).toBe(progress);
    visibility(true);
    advanceFrames(90);
    meshes.forEach((mesh) => expect(mesh.material.uniforms.uProgress.value).toBe(1));
    visibility(false);
    act(() => vi.advanceTimersByTime(6000));
    meshes.forEach((mesh) => expect(mesh.material.uniforms.uProgress.value).toBe(1));
    visibility(true);
    act(() => vi.advanceTimersByTime(5000));
    meshes.forEach((mesh) => expect(mesh.material.uniforms.uProgress.value).toBe(0));
    advanceFrames(90);
    view.rerender(<AdaptiveProtectionField active />);
    meshes.forEach((mesh) => expect(mesh.material.uniforms.uProgress.value).toBe(0));
    view.unmount();
    expect(frames.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
