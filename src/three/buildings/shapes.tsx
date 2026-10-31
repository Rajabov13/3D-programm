import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useAccentMaterial, useCityMaterials, useGlowMaterial } from '../materials';

export interface ShapeProps {
  accent: string;
  highlight: boolean;
  animate: boolean;
  shadows: boolean;
}

const edgeOpacity = (highlight: boolean) => (highlight ? 0.95 : 0.45);

/** HTML Academy — stepped glass tower. */
export function SteppedTower({ accent, highlight, shadows }: ShapeProps) {
  const { facade, metal, glass } = useCityMaterials();
  const trim = useAccentMaterial(accent, highlight ? 2.2 : 1.3);
  const tiers: Array<[number, number, number, number]> = [
    [10, 9, 9, 0],
    [8, 7, 7, 9],
    [5.5, 5, 6, 16],
  ];
  return (
    <group>
      {tiers.map(([w, h, d, y], i) => (
        <group key={i}>
          <mesh position={[0, y + h / 2, 0]} material={facade} castShadow={shadows} receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <Edges color={accent} transparent opacity={edgeOpacity(highlight)} />
          </mesh>
          <mesh position={[0, y + h + 0.08, 0]} material={metal}>
            <boxGeometry args={[w + 0.3, 0.16, d + 0.3]} />
            <Edges color={accent} transparent opacity={edgeOpacity(highlight)} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3, 5.2]} material={metal} castShadow={shadows}>
        <boxGeometry args={[5, 0.3, 2]} />
      </mesh>
      <mesh position={[0, 1.4, 4.56]} material={glass}>
        <boxGeometry args={[2.6, 2.8, 0.1]} />
        <Edges color={accent} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 2.95, 4.62]} material={trim}>
        <boxGeometry args={[2.8, 0.08, 0.06]} />
      </mesh>
    </group>
  );
}

/** CSS Design Studio — twisting stack of slabs. */
export function TwistedTower({ accent, highlight, animate, shadows }: ShapeProps) {
  const { facadeAlt } = useCityMaterials();
  const trim = useAccentMaterial(accent, highlight ? 2.2 : 1.3);
  const group = useRef<THREE.Group>(null);
  const floors = 12;
  useFrame(({ clock }) => {
    if (!animate || !group.current) return;
    group.current.children.forEach((child, i) => {
      if (child.userData.slab) child.rotation.y = i * 0.11 + Math.sin(clock.elapsedTime * 0.25 + i * 0.2) * 0.04;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: floors }, (_, i) => (
        <mesh key={i} userData={{ slab: true }} position={[0, i * 2 + 1, 0]} rotation-y={i * 0.11} material={facadeAlt} castShadow={shadows} receiveShadow>
          <boxGeometry args={[8 - i * 0.12, 1.75, 8 - i * 0.12]} />
          <Edges color={accent} transparent opacity={edgeOpacity(highlight) * 0.8} />
        </mesh>
      ))}
      <mesh position={[0, floors * 2 + 0.4, 0]} material={trim}>
        <cylinderGeometry args={[0.15, 0.15, 3, 8]} />
      </mesh>
    </group>
  );
}

/** JavaScript Laboratory — cylindrical lab with glowing bands and a dome. */
export function LabTower({ accent, highlight, animate, shadows }: ShapeProps) {
  const { facade, glass } = useCityMaterials();
  const trim = useAccentMaterial(accent, highlight ? 2.2 : 1.3);
  const rings = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (animate && rings.current) rings.current.rotation.y += dt * 0.3;
  });
  return (
    <group>
      <mesh position={[0, 8, 0]} material={facade} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[5.2, 5.6, 16, 32, 1, false]} />
      </mesh>
      {[3, 7, 11, 15].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2} material={trim}>
          <torusGeometry args={[5.45 - y * 0.02, 0.09, 6, 48]} />
        </mesh>
      ))}
      <mesh position={[0, 16, 0]} material={glass} castShadow={shadows}>
        <sphereGeometry args={[5.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <group ref={rings} position={[0, 19, 0]}>
        <mesh rotation-x={Math.PI / 2.4} material={trim}>
          <torusGeometry args={[2.2, 0.06, 6, 40]} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2.4} material={trim}>
          <torusGeometry args={[2.2, 0.06, 6, 40]} />
        </mesh>
      </group>
    </group>
  );
}

/** Python Center — twin towers joined by a sky bridge. */
export function TwinTowers({ accent, highlight, shadows }: ShapeProps) {
  const { facade, glass, metal } = useCityMaterials();
  const trim = useAccentMaterial(accent, highlight ? 2.2 : 1.3);
  const towers: Array<[number, number]> = [
    [-3.6, 21],
    [3.6, 17],
  ];
  return (
    <group>
      {towers.map(([x, h]) => (
        <mesh key={x} position={[x, h / 2, 0]} material={facade} castShadow={shadows} receiveShadow>
          <boxGeometry args={[5, h, 5.5]} />
          <Edges color={accent} transparent opacity={edgeOpacity(highlight)} />
        </mesh>
      ))}
      <mesh position={[0, 12, 0]} material={glass} castShadow={shadows}>
        <boxGeometry args={[2.4, 2.2, 3.4]} />
      </mesh>
      <mesh position={[0, 10.85, 0]} material={trim}>
        <boxGeometry args={[2.4, 0.1, 3.5]} />
      </mesh>
      {towers.map(([x, h]) => (
        <mesh key={`cap${x}`} position={[x, h + 0.1, 0]} material={metal}>
          <boxGeometry args={[5.3, 0.2, 5.8]} />
          <Edges color={accent} transparent opacity={edgeOpacity(highlight)} />
        </mesh>
      ))}
    </group>
  );
}

/** React Development Tower — tapered spire crowned by orbiting rings. */
export function SpireTower({ accent, highlight, animate, shadows }: ShapeProps) {
  const { facade } = useCityMaterials();
  const trim = useAccentMaterial(accent, highlight ? 2.4 : 1.6);
  const atom = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!animate || !atom.current) return;
    atom.current.children.forEach((ring, i) => {
      if (ring.userData.ring) ring.rotation.z += dt * (0.6 + i * 0.15);
    });
  });
  return (
    <group>
      <mesh position={[0, 15, 0]} material={facade} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[2, 4.5, 30, 6]} />
        <Edges color={accent} transparent opacity={edgeOpacity(highlight)} />
      </mesh>
      <group ref={atom} position={[0, 33, 0]}>
        <mesh material={trim}>
          <sphereGeometry args={[0.7, 20, 20]} />
        </mesh>
        {[0, Math.PI / 3, -Math.PI / 3].map((r) => (
          <group key={r} rotation={[Math.PI / 2, r, 0]}>
            <mesh userData={{ ring: true }} scale={[1, 0.42, 1]} material={trim}>
              <torusGeometry args={[3, 0.07, 6, 64]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Mission Center — hexagonal command hub with a scanning beacon. */
export function HexHub({ accent, highlight, animate, shadows }: ShapeProps) {
  const { facadeAlt, metal } = useCityMaterials();
  const trim = useAccentMaterial(accent, highlight ? 2.2 : 1.3);
  const beam = useGlowMaterial(accent, 0.12);
  const radar = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (animate && radar.current) radar.current.rotation.y += dt * 0.8;
  });
  return (
    <group>
      <mesh position={[0, 4, 0]} material={facadeAlt} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[6.4, 7, 8, 6]} />
        <Edges color={accent} transparent opacity={edgeOpacity(highlight)} />
      </mesh>
      <mesh position={[0, 8.15, 0]} rotation-x={Math.PI / 2} material={trim}>
        <torusGeometry args={[6.45, 0.07, 4, 6]} />
      </mesh>
      <mesh position={[0, 10, 0]} material={metal} castShadow={shadows}>
        <cylinderGeometry args={[0.25, 0.4, 4, 8]} />
      </mesh>
      <group ref={radar} position={[0, 12, 0]}>
        <mesh rotation-x={Math.PI / 2} material={trim}>
          <torusGeometry args={[1.6, 0.08, 6, 32, Math.PI]} />
        </mesh>
      </group>
      <mesh position={[0, 30, 0]} material={beam}>
        <cylinderGeometry args={[0.15, 0.6, 36, 12, 1, true]} />
      </mesh>
    </group>
  );
}

/** Achievement Hall — colonnade with a floating trophy. */
export function TrophyHall({ accent, highlight, animate, shadows }: ShapeProps) {
  const { metal, glass, dark } = useCityMaterials();
  const trim = useAccentMaterial(accent, highlight ? 2.2 : 1.4);
  const trophy = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!animate || !trophy.current) return;
    trophy.current.rotation.y = clock.elapsedTime * 0.5;
    trophy.current.position.y = 13 + Math.sin(clock.elapsedTime) * 0.35;
  });
  const columns = useMemo(() => {
    const list: Array<[number, number]> = [];
    for (const x of [-5.5, -2, 2, 5.5]) for (const z of [-3.5, 3.5]) list.push([x, z]);
    return list;
  }, []);
  return (
    <group>
      <mesh position={[0, 0.6, 0]} material={dark} receiveShadow castShadow={shadows}>
        <boxGeometry args={[14, 1.2, 10]} />
        <Edges color={accent} transparent opacity={edgeOpacity(highlight) * 0.7} />
      </mesh>
      {columns.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 4.7, z]} material={metal} castShadow={shadows}>
          <cylinderGeometry args={[0.45, 0.45, 7, 12]} />
        </mesh>
      ))}
      <mesh position={[0, 4.7, 0]} material={glass}>
        <boxGeometry args={[9, 6.5, 5]} />
      </mesh>
      <mesh position={[0, 8.5, 0]} material={metal} castShadow={shadows}>
        <boxGeometry args={[14.5, 0.8, 10.5]} />
        <Edges color={accent} transparent opacity={edgeOpacity(highlight)} />
      </mesh>
      <group ref={trophy} position={[0, 13, 0]}>
        <mesh material={trim}>
          <octahedronGeometry args={[1.3, 0]} />
        </mesh>
        <mesh position={[0, -1.6, 0]} material={trim}>
          <coneGeometry args={[0.6, 1, 6]} />
        </mesh>
      </group>
    </group>
  );
}

/** Personal Progress Center — glass dome with orbiting data rings. */
export function DomeCenter({ accent, highlight, animate, shadows }: ShapeProps) {
  const { glass, facadeAlt } = useCityMaterials();
  const trim = useAccentMaterial(accent, highlight ? 2.2 : 1.3);
  const wire = useGlowMaterial(accent, 0.14);
  const rings = useRef<THREE.Group>(null);
  const bars = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2, h: 1 + ((i * 7) % 5) * 0.7 })), []);
  useFrame(({ clock }) => {
    if (!animate || !rings.current) return;
    rings.current.rotation.y = clock.elapsedTime * 0.2;
    rings.current.children.forEach((c, i) => {
      c.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.4 + i) * 0.25;
    });
  });
  return (
    <group>
      <mesh position={[0, 1.5, 0]} material={facadeAlt} castShadow={shadows} receiveShadow>
        <cylinderGeometry args={[7.5, 7.8, 3, 48]} />
      </mesh>
      <mesh position={[0, 3, 0]} material={glass} castShadow={shadows}>
        <sphereGeometry args={[7, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 3, 0]} material={wire}>
        <sphereGeometry args={[7.05, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <group ref={rings} position={[0, 7, 0]}>
        {[8.6, 9.6].map((r) => (
          <mesh key={r} rotation-x={Math.PI / 2} material={trim}>
            <torusGeometry args={[r, 0.06, 6, 96]} />
          </mesh>
        ))}
      </group>
      {bars.map(({ a, h }) => (
        <mesh key={a} position={[Math.cos(a) * 8.6, h / 2 + 0.1, Math.sin(a) * 8.6]} material={trim}>
          <boxGeometry args={[0.35, h, 0.35]} />
        </mesh>
      ))}
    </group>
  );
}

export const SHAPES = {
  stepped: SteppedTower,
  twisted: TwistedTower,
  lab: LabTower,
  twin: TwinTowers,
  spire: SpireTower,
  hex: HexHub,
  hall: TrophyHall,
  dome: DomeCenter,
} as const;
