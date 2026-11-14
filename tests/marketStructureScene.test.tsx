import { act, cleanup, render, screen } from "@testing-library/react";
import { advance, createRoot, extend, type RootState } from "@react-three/fiber";
import * as THREE from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketStructureScene, { StructureRig } from "@/components/3d/outro/MarketStructureScene";

vi.mock("@/components/theme/ThemeProvider", () => ({ useTheme: () => ({ resolvedTheme: "dark" }) }));
vi.mock("@/components/3d/SceneCanvas", () => ({
  default: ({ frameloop }: { frameloop: string }) => <div data-testid="scene-canvas" data-frameloop={frameloop} />,
}));

extend({
  Group: THREE.Group,
  InstancedMesh: THREE.InstancedMesh,
  BoxGeometry: THREE.BoxGeometry,
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  GridHelper: THREE.GridHelper,
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function createRig(reducedMotion: boolean) {
  const canvas = document.createElement("canvas");
  const root = createRoot(canvas);
  let state!: RootState;
  const progressRef = { current: 0 };
  await act(async () => {
    await root.configure({
      gl: { render: vi.fn(), setPixelRatio: vi.fn(), setSize: vi.fn() } as unknown as THREE.WebGLRenderer,
      size: { width: 800, height: 600, top: 0, left: 0 },
      camera: { position: [-7, 7, 26], fov: 42 },
      frameloop: "never",
      onCreated: (created) => { state = created; },
    });
    root.render(<StructureRig progressRef={progressRef} isLight={false} reducedMotion={reducedMotion} />);
  });
  const snapshot = (time: number) => {
    advance(time, false, state);
    const group = state.scene.children[0];
    const meshes = group.children.filter((child): child is THREE.InstancedMesh => child instanceof THREE.InstancedMesh);
    return {
      matrices: meshes.map((mesh) => Array.from(mesh.instanceMatrix.array)),
      colors: meshes.map((mesh) => Array.from(mesh.instanceColor!.array)),
      camera: [...state.camera.position.toArray(), ...state.camera.quaternion.toArray()],
    };
  };
  return { root, progressRef, snapshot, state };
}

describe("closing scene motion", () => {
  it("keeps settled candle transforms, colors and camera fixed across time and scroll in reduced motion", async () => {
    const rig = await createRig(true);
    try {
      const initial = rig.snapshot(1);
      expect(initial.matrices).toHaveLength(2);
      expect(initial.matrices[0]).toHaveLength(90 * 16);
      expect(rig.state.camera.position.toArray()).toEqual([0, 4.8, 17.5]);
      rig.progressRef.current = 0.5;
      expect(rig.snapshot(5)).toEqual(initial);
      rig.progressRef.current = 1;
      expect(rig.snapshot(12)).toEqual(initial);
    } finally { await act(async () => rig.root.unmount()); }
  });

  it("preserves normal motion and settles immediately when reduced motion is enabled", async () => {
    const rig = await createRig(false);
    try {
      const initial = rig.snapshot(1);
      expect(rig.snapshot(2).matrices).not.toEqual(initial.matrices);
      rig.progressRef.current = 1;
      const finished = rig.snapshot(3);
      expect(finished.camera).not.toEqual(initial.camera);
      await act(async () => {
        rig.root.render(<StructureRig progressRef={rig.progressRef} isLight={false} reducedMotion />);
      });
      const settled = rig.snapshot(4);
      rig.progressRef.current = 0;
      expect(rig.snapshot(10)).toEqual(settled);
      expect(rig.state.camera.position.toArray()).toEqual([0, 4.8, 17.5]);
    } finally { await act(async () => rig.root.unmount()); }
  });

  it("uses demand rendering for reduced motion, continuous rendering for normal motion and pauses offscreen", () => {
    let notify!: IntersectionObserverCallback;
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe() {}
      disconnect() {}
    });
    const { rerender } = render(<MarketStructureScene progressRef={{ current: 0 }} reducedMotion />);
    expect(screen.getByTestId("scene-canvas").dataset.frameloop).toBe("demand");
    rerender(<MarketStructureScene progressRef={{ current: 0 }} reducedMotion={false} />);
    expect(screen.getByTestId("scene-canvas").dataset.frameloop).toBe("always");
    act(() => notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByTestId("scene-canvas").dataset.frameloop).toBe("never");
  });
});
