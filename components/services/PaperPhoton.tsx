"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import SceneCanvas from "@/components/3d/SceneCanvas";

const GOLD = "#e8c96a";
const GOLD_LIGHT = "#f2dfa5";
const GRAPHITE = "#252b34";
const STEEL = "#697380";
const PAPER = "#4b4e50";

const CERTIFICATE_X = -1.28;
const DIGITAL_X = 1.28;
const RECORD_LINE_COUNT = 11;
const MATRIX_ROWS = 7;
const MATRIX_COLUMNS = 6;
const MATRIX_COUNT = MATRIX_ROWS * MATRIX_COLUMNS;
const EXTRACT_COUNT = 30;
const LOOP_PAUSE_SECONDS = 5;

type SequenceMode = "entry" | "demo" | "mobile";

type RecordLine = {
  x: number;
  y: number;
  width: number;
  threshold: number;
};

type MatrixCell = {
  x: number;
  y: number;
  order: number;
};

type DataFragment = {
  source: THREE.Vector3;
  target: THREE.Vector3;
  control: THREE.Vector3;
  threshold: number;
  length: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function phase(value: number, start: number, duration: number) {
  return clamp01((value - start) / duration);
}

function smooth(value: number) {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
}

function pulse(value: number) {
  return Math.sin(Math.PI * clamp01(value));
}

function createRecordLines(): RecordLine[] {
  return [
    { x: -0.28, y: 0.6, width: 0.55, threshold: 0.83 },
    { x: 0.24, y: 0.6, width: 0.27, threshold: 0.83 },
    { x: -0.14, y: 0.4, width: 0.83, threshold: 0.7 },
    { x: -0.24, y: 0.24, width: 0.62, threshold: 0.61 },
    { x: 0.34, y: 0.24, width: 0.22, threshold: 0.61 },
    { x: -0.06, y: 0.01, width: 0.98, threshold: 0.48 },
    { x: -0.2, y: -0.17, width: 0.69, threshold: 0.38 },
    { x: 0.32, y: -0.17, width: 0.24, threshold: 0.38 },
    { x: -0.08, y: -0.38, width: 0.94, threshold: 0.25 },
    { x: -0.27, y: -0.56, width: 0.55, threshold: 0.14 },
    { x: 0.27, y: -0.56, width: 0.3, threshold: 0.14 },
  ];
}

function createMatrixCells(): MatrixCell[] {
  const cells: MatrixCell[] = [];
  for (let row = 0; row < MATRIX_ROWS; row += 1) {
    for (let column = 0; column < MATRIX_COLUMNS; column += 1) {
      const rowProgress = row / Math.max(MATRIX_ROWS - 1, 1);
      const columnProgress = column / Math.max(MATRIX_COLUMNS - 1, 1);
      cells.push({
        x: (column - (MATRIX_COLUMNS - 1) / 2) * 0.19,
        y: ((MATRIX_ROWS - 1) / 2 - row) * 0.19,
        order: rowProgress * 0.66 + columnProgress * 0.34,
      });
    }
  }
  return cells;
}

function createFragments(
  recordLines: RecordLine[],
  matrixCells: MatrixCell[]
): DataFragment[] {
  return Array.from({ length: EXTRACT_COUNT }, (_, index) => {
    const line = recordLines[index % recordLines.length];
    const longitudinal = ((index * 7) % 13) / 12 - 0.5;
    const cell = matrixCells[(index * 11) % matrixCells.length];
    const source = new THREE.Vector3(
      CERTIFICATE_X + line.x + longitudinal * line.width * 0.72,
      line.y,
      0.18 + (index % 4) * 0.012
    );
    const target = new THREE.Vector3(
      DIGITAL_X + cell.x,
      cell.y,
      0.32 + (index % 3) * 0.012
    );
    const control = new THREE.Vector3(
      (source.x + target.x) * 0.5,
      source.y + Math.sin(index * 1.7) * 0.16,
      0.62 + (index % 5) * 0.055
    );
    return {
      source,
      target,
      control,
      threshold: clamp01(line.threshold - 0.07 + (index % 4) * 0.018),
      length: 0.07 + (index % 5) * 0.022,
    };
  });
}

function setQuadraticPoint(
  target: THREE.Vector3,
  start: THREE.Vector3,
  control: THREE.Vector3,
  end: THREE.Vector3,
  progress: number
) {
  const inverse = 1 - progress;
  const a = inverse * inverse;
  const b = 2 * inverse * progress;
  const c = progress * progress;
  target.set(
    a * start.x + b * control.x + c * end.x,
    a * start.y + b * control.y + c * end.y,
    a * start.z + b * control.z + c * end.z
  );
}

function PaperPhotonMechanism({
  sequence,
  mode,
  reducedMotion,
  pointerRef,
}: {
  sequence: number;
  mode: SequenceMode;
  reducedMotion: boolean;
  pointerRef: MutableRefObject<{ x: number; y: number }>;
}) {
  const physicalRef = useRef<THREE.Group>(null);
  const digitalRef = useRef<THREE.Group>(null);
  const certificateMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const certificateEdgeMaterialRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const sealMaterialRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const recordRef = useRef<THREE.InstancedMesh>(null);
  const scannerRef = useRef<THREE.Group>(null);
  const scannerLineMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const scannerBandMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const fragmentRef = useRef<THREE.InstancedMesh>(null);
  const digitalPlaneMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const digitalEdgeMaterialRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const matrixRef = useRef<THREE.InstancedMesh>(null);
  const idleCellRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const bridgeRef = useRef<THREE.Mesh>(null);
  const bridgeMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const confirmationRef = useRef<THREE.Mesh>(null);
  const confirmationMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const timelineRef = useRef(reducedMotion ? 1 : 0);
  const holdRef = useRef(0);
  const lastSequenceRef = useRef(sequence);
  const records = useMemo(() => createRecordLines(), []);
  const matrixCells = useMemo(() => createMatrixCells(), []);
  const fragments = useMemo(
    () => createFragments(records, matrixCells),
    [records, matrixCells]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const travelPoint = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    if (lastSequenceRef.current !== sequence) {
      lastSequenceRef.current = sequence;
      timelineRef.current = 0;
      holdRef.current = 0;
    }

    const duration = mode === "mobile" ? 6.1 : mode === "demo" ? 5.2 : 2.35;
    if (reducedMotion) {
      timelineRef.current = 1;
      holdRef.current = 0;
    } else if (sequence > 0) {
      if (timelineRef.current < 1) {
        timelineRef.current = Math.min(1, timelineRef.current + delta / duration);
      } else {
        holdRef.current += delta;
        if (holdRef.current >= LOOP_PAUSE_SECONDS) {
          timelineRef.current = 0;
          holdRef.current = 0;
        }
      }
    }

    const t = timelineRef.current;
    const fullSequence = mode !== "entry" || reducedMotion;
    const certificateReveal = reducedMotion
      ? 1
      : mode === "mobile"
        ? smooth(phase(t, 0, 0.18))
        : mode === "entry"
          ? smooth(phase(t, 0, 0.78))
          : 1;
    const scan = fullSequence && !reducedMotion
      ? smooth(phase(t, mode === "mobile" ? 0.17 : 0.06, 0.5))
      : reducedMotion
        ? 1
        : 0;
    const digitalBuild = reducedMotion
      ? 1
      : fullSequence
        ? smooth(phase(t, mode === "mobile" ? 0.36 : 0.24, 0.46))
        : 0;
    const bridge = reducedMotion
      ? 1
      : fullSequence
        ? smooth(phase(t, mode === "mobile" ? 0.74 : 0.7, 0.14))
        : 0;
    const lock = reducedMotion
      ? 1
      : fullSequence
        ? smooth(phase(t, mode === "mobile" ? 0.82 : 0.79, 0.14))
        : 0;
    const idle = reducedMotion ? 0 : smooth(phase(t, 0.95, 0.05));
    const elapsed = clock.elapsedTime;

    const physical = physicalRef.current;
    if (physical) {
      const revealScale = 0.001 + certificateReveal * 0.999;
      physical.scale.setScalar(
        THREE.MathUtils.damp(physical.scale.x, revealScale, 7, delta)
      );
      physical.position.y = THREE.MathUtils.damp(
        physical.position.y,
        (1 - certificateReveal) * -0.12 + Math.sin(elapsed * 0.22) * idle * 0.008,
        6,
        delta
      );
      physical.rotation.x = THREE.MathUtils.damp(
        physical.rotation.x,
        reducedMotion ? 0.025 : 0.025 - pointerRef.current.y * 0.018,
        5,
        delta
      );
      physical.rotation.y = THREE.MathUtils.damp(
        physical.rotation.y,
        reducedMotion ? -0.13 : -0.13 + pointerRef.current.x * 0.022,
        5,
        delta
      );
    }

    if (certificateMaterialRef.current) {
      certificateMaterialRef.current.opacity =
        certificateReveal * (0.48 - bridge * 0.41);
      certificateMaterialRef.current.emissiveIntensity =
        0.02 + pulse(phase(scan, 0.02, 0.98)) * 0.08;
    }
    certificateEdgeMaterialRefs.current.forEach((material) => {
      if (!material) return;
      material.opacity =
        certificateReveal * (0.19 + bridge * 0.13);
    });
    sealMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const solidOpacity = index === 0 ? 0.22 : 0.5;
      const ghostOpacity = index === 0 ? 0.05 : 0.03;
      material.opacity =
        certificateReveal * (solidOpacity * (1 - bridge) + ghostOpacity * bridge);
    });

    const recordsMesh = recordRef.current;
    if (recordsMesh) {
      records.forEach((record, index) => {
        const erased = fullSequence
          ? smooth(phase(scan, record.threshold, 0.085))
          : 0;
        const lineScale = certificateReveal * (1 - erased);
        dummy.position.set(record.x, record.y, 0.055);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(
          Math.max(0.001, record.width * lineScale),
          0.014,
          0.014
        );
        dummy.updateMatrix();
        recordsMesh.setMatrixAt(index, dummy.matrix);
      });
      recordsMesh.instanceMatrix.needsUpdate = true;
    }

    const scanner = scannerRef.current;
    const scannerVisibility = reducedMotion
      ? 0
      : fullSequence
        ? pulse(phase(t, mode === "mobile" ? 0.16 : 0.05, 0.54))
        : 0;
    if (scanner) {
      scanner.position.y = -0.92 + scan * 1.84;
      scanner.scale.x = certificateReveal;
    }
    if (scannerLineMaterialRef.current) {
      scannerLineMaterialRef.current.opacity = scannerVisibility * 0.9;
    }
    if (scannerBandMaterialRef.current) {
      scannerBandMaterialRef.current.opacity = scannerVisibility * 0.12;
    }

    const fragmentMesh = fragmentRef.current;
    if (fragmentMesh) {
      fragments.forEach((fragment, index) => {
        const travel = reducedMotion
          ? 1
          : fullSequence
            ? smooth(phase(scan, fragment.threshold, 0.26))
            : 0;
        setQuadraticPoint(
          travelPoint,
          fragment.source,
          fragment.control,
          fragment.target,
          travel
        );
        const visibility = reducedMotion ? 0 : pulse(travel);
        dummy.position.copy(travelPoint);
        dummy.rotation.set(
          travel * 0.18,
          travel * (index % 2 === 0 ? 0.45 : -0.38),
          (index % 5) * 0.08 + travel * 0.5
        );
        dummy.scale.set(
          Math.max(0.001, fragment.length * visibility),
          Math.max(0.001, 0.018 * visibility),
          Math.max(0.001, 0.022 * visibility)
        );
        dummy.updateMatrix();
        fragmentMesh.setMatrixAt(index, dummy.matrix);
      });
      fragmentMesh.instanceMatrix.needsUpdate = true;
    }

    const digital = digitalRef.current;
    if (digital) {
      const targetScale = 0.001 + digitalBuild * 0.999 + pulse(lock) * 0.012;
      digital.scale.setScalar(
        THREE.MathUtils.damp(digital.scale.x, targetScale, 7, delta)
      );
      digital.rotation.x = THREE.MathUtils.damp(
        digital.rotation.x,
        reducedMotion ? -0.015 : -0.015 + pointerRef.current.y * 0.014,
        5,
        delta
      );
      digital.rotation.y = THREE.MathUtils.damp(
        digital.rotation.y,
        (1 - lock) * 0.24 + 0.08 - (reducedMotion ? 0 : pointerRef.current.x * 0.018),
        6,
        delta
      );
      digital.position.z = THREE.MathUtils.damp(
        digital.position.z,
        0.05 + digitalBuild * 0.05,
        5,
        delta
      );
    }
    if (digitalPlaneMaterialRef.current) {
      digitalPlaneMaterialRef.current.opacity = 0.015 + digitalBuild * 0.13;
      digitalPlaneMaterialRef.current.emissiveIntensity = 0.02 + lock * 0.065;
    }
    digitalEdgeMaterialRefs.current.forEach((material) => {
      if (!material) return;
      material.opacity = 0.035 + digitalBuild * 0.29;
    });

    const matrix = matrixRef.current;
    if (matrix) {
      matrixCells.forEach((cell, index) => {
        const built = smooth(phase(digitalBuild, cell.order * 0.72, 0.25));
        const breathe = idle > 0 && index % 9 === 0
          ? 1 + Math.sin(elapsed * 0.55 + index) * 0.025
          : 1;
        dummy.position.set(cell.x, cell.y, 0.045);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(
          Math.max(0.001, built * breathe),
          Math.max(0.001, built * breathe),
          Math.max(0.001, built)
        );
        dummy.updateMatrix();
        matrix.setMatrixAt(index, dummy.matrix);
      });
      matrix.instanceMatrix.needsUpdate = true;
    }

    idleCellRefs.current.forEach((material, index) => {
      if (!material) return;
      const shimmer = idle > 0
        ? Math.max(0, Math.sin(elapsed * 0.42 + index * 1.83) - 0.78) / 0.22
        : 0;
      material.opacity = digitalBuild * (lock * 0.09 + shimmer * 0.34);
    });

    const bridgeMesh = bridgeRef.current;
    if (bridgeMesh) {
      bridgeMesh.scale.x = Math.max(0.001, bridge);
    }
    if (bridgeMaterialRef.current) {
      bridgeMaterialRef.current.opacity = bridge * 0.62;
    }

    const confirmation = confirmationRef.current;
    const confirmationProgress = reducedMotion ? 1 : phase(t, 0.84, 0.11);
    if (confirmation) {
      confirmation.position.y = -0.66 + confirmationProgress * 1.32;
      confirmation.scale.x = digitalBuild;
    }
    if (confirmationMaterialRef.current) {
      confirmationMaterialRef.current.opacity = reducedMotion
        ? 0
        : pulse(confirmationProgress) * 0.48;
    }
  });

  return (
    <group>
      <gridHelper
        args={[9, 16, "#282e38", "#171b22"]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -1.35]}
      />

      <group ref={physicalRef} position={[CERTIFICATE_X, 0, 0]} scale={0.001}>
        <mesh>
          <boxGeometry args={[1.5, 1.86, 0.055]} />
          <meshStandardMaterial
            ref={certificateMaterialRef}
            color={PAPER}
            emissive={GRAPHITE}
            emissiveIntensity={0.02}
            metalness={0.08}
            roughness={0.76}
            transparent
            opacity={0}
          />
        </mesh>

        <group position={[0, 0, 0.042]}>
          {[
            [0, 0.79, 1.26, 0.012],
            [0, -0.79, 1.26, 0.012],
            [-0.63, 0, 0.012, 1.58],
            [0.63, 0, 0.012, 1.58],
            [0, 0.7, 1.08, 0.007],
            [0, -0.7, 1.08, 0.007],
          ].map(([x, y, width, height], index) => (
            <mesh key={index} position={[x, y, 0]}>
              <boxGeometry args={[width, height, 0.012]} />
              <meshBasicMaterial
                ref={(material) => {
                  certificateEdgeMaterialRefs.current[index] = material;
                }}
                color={STEEL}
                transparent
                opacity={0.19}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>

        <instancedMesh ref={recordRef} args={[undefined, undefined, RECORD_LINE_COUNT]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#85898a"
            emissive={STEEL}
            emissiveIntensity={0.035}
            metalness={0.18}
            roughness={0.58}
          />
        </instancedMesh>

        <mesh position={[0.42, -0.48, 0.058]}>
          <torusGeometry args={[0.13, 0.012, 6, 38]} />
          <meshBasicMaterial
            ref={(material) => {
              sealMaterialRefs.current[0] = material;
            }}
            color={STEEL}
            transparent
            opacity={0.22}
          />
        </mesh>
        <mesh position={[0.42, -0.48, 0.058]}>
          <circleGeometry args={[0.075, 28]} />
          <meshBasicMaterial
            ref={(material) => {
              sealMaterialRefs.current[1] = material;
            }}
            color={GRAPHITE}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      <group ref={scannerRef} position={[CERTIFICATE_X, -0.92, 0.32]}>
        <mesh>
          <boxGeometry args={[1.7, 0.022, 0.04]} />
          <meshBasicMaterial
            ref={scannerLineMaterialRef}
            color={GOLD_LIGHT}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0, -0.025]}>
          <planeGeometry args={[1.78, 0.19]} />
          <meshBasicMaterial
            ref={scannerBandMaterialRef}
            color={GOLD}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <instancedMesh ref={fragmentRef} args={[undefined, undefined, EXTRACT_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          emissive={GOLD}
          emissiveIntensity={1.15}
          metalness={0.32}
          roughness={0.2}
        />
      </instancedMesh>

      <mesh ref={bridgeRef} position={[0, 0, 0.18]} scale={[0.001, 1, 1]}>
        <boxGeometry args={[1.02, 0.014, 0.014]} />
        <meshBasicMaterial
          ref={bridgeMaterialRef}
          color={GOLD}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <group ref={digitalRef} position={[DIGITAL_X, 0, 0.05]} scale={0.001}>
        <mesh>
          <boxGeometry args={[1.48, 1.82, 0.06]} />
          <meshPhysicalMaterial
            ref={digitalPlaneMaterialRef}
            color="#405064"
            emissive={GRAPHITE}
            emissiveIntensity={0.02}
            metalness={0.48}
            roughness={0.2}
            transmission={0.22}
            transparent
            opacity={0.015}
            depthWrite={false}
          />
        </mesh>
        {[
          [0, 0.78, 1.27, 0.012],
          [0, -0.78, 1.27, 0.012],
          [-0.63, 0, 0.012, 1.57],
          [0.63, 0, 0.012, 1.57],
        ].map(([x, y, width, height], index) => (
          <mesh key={index} position={[x, y, 0.048]}>
            <boxGeometry args={[width, height, 0.012]} />
            <meshBasicMaterial
              ref={(material) => {
                digitalEdgeMaterialRefs.current[index] = material;
              }}
              color={index === 0 ? GOLD : STEEL}
              transparent
              opacity={0.035}
              depthWrite={false}
            />
          </mesh>
        ))}

        <instancedMesh ref={matrixRef} args={[undefined, undefined, MATRIX_COUNT]}>
          <boxGeometry args={[0.125, 0.105, 0.024]} />
          <meshStandardMaterial
            color="#697583"
            emissive="#46505c"
            emissiveIntensity={0.11}
            metalness={0.46}
            roughness={0.27}
            transparent
            opacity={0.72}
          />
        </instancedMesh>

        {[4, 11, 19, 26, 34, 39].map((cellIndex, index) => {
          const cell = matrixCells[cellIndex];
          return (
            <mesh key={cellIndex} position={[cell.x, cell.y, 0.068]}>
              <planeGeometry args={[0.102, 0.082]} />
              <meshBasicMaterial
                ref={(material) => {
                  idleCellRefs.current[index] = material;
                }}
                color={GOLD}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>
          );
        })}

        <mesh ref={confirmationRef} position={[0, -0.66, 0.09]}>
          <planeGeometry args={[1.15, 0.028]} />
          <meshBasicMaterial
            ref={confirmationMaterialRef}
            color={GOLD_LIGHT}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function PaperPhoton({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const playedOnEntryRef = useRef(false);
  const previousActiveRef = useRef(false);
  const reduceMotion = Boolean(useReducedMotion());
  const [visible, setVisible] = useState(false);
  const [sequence, setSequence] = useState(0);
  const [mode, setMode] = useState<SequenceMode>("entry");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const playThreshold = mobile ? 0.55 : 0.4;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (
          !reduceMotion &&
          entry.intersectionRatio >= playThreshold &&
          !playedOnEntryRef.current
        ) {
          playedOnEntryRef.current = true;
          setMode(mobile ? "mobile" : "demo");
          setSequence((value) => value + 1);
        }
      },
      { threshold: [0, 0.2, 0.4, 0.55, 0.72] }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (active && !previousActiveRef.current && !reduceMotion) {
      setMode("demo");
      setSequence((value) => value + 1);
    }
    previousActiveRef.current = active;
  }, [active, reduceMotion]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current.x =
      ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1;
    pointerRef.current.y = -(
      ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 -
      1
    );
  };

  const handlePointerLeave = () => {
    pointerRef.current.x = 0;
    pointerRef.current.y = 0;
  };

  return (
    <div
      ref={rootRef}
      className="h-full w-full"
      aria-hidden
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <SceneCanvas
        frameloop={reduceMotion ? "demand" : visible ? "always" : "never"}
        dpr={[1, 1.5]}
        orthographic
        camera={{ position: [0, 0, 7], zoom: 72 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.52} />
        <directionalLight position={[2.8, 4.2, 5.5]} intensity={1.2} color="#eadfbf" />
        <pointLight position={[0, 0.2, 3]} intensity={3.2} distance={6.5} color={GOLD} />
        <PaperPhotonMechanism
          sequence={sequence}
          mode={mode}
          reducedMotion={reduceMotion}
          pointerRef={pointerRef}
        />
      </SceneCanvas>
    </div>
  );
}
