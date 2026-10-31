import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useBackingMaterial, useGlowMaterial, useSignTextMaterial } from './materials';

export const FONT_URL = '/fonts/inter-600.woff';
export const FONT_BOLD_URL = '/fonts/inter-700.woff';
export const MONO_FONT_URL = '/fonts/jetbrains-mono-500.woff';

/** Floating holographic name plate in front of a building. */
export function HoloSign({
  title,
  symbol,
  color,
  y,
  z,
  width,
  locked,
  lockLabel,
  highlight,
  animate,
}: {
  title: string;
  symbol: string;
  color: string;
  y: number;
  z: number;
  width: number;
  locked: boolean;
  lockLabel?: string;
  highlight: boolean;
  animate: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const panel = useGlowMaterial(locked ? '#64748b' : color, highlight ? 0.2 : 0.11, THREE.FrontSide);
  const textMaterial = useSignTextMaterial();
  const backing = useBackingMaterial();
  const border = useGlowMaterial(locked ? '#94a3b8' : color, highlight ? 0.95 : 0.6, THREE.FrontSide);
  const seed = useRef(Math.random() * 10);

  useFrame(({ clock }) => {
    if (!group.current || !animate) return;
    const t = clock.elapsedTime + seed.current;
    group.current.position.y = y + Math.sin(t * 0.9) * 0.18;
    // Subtle hologram flicker.
    panel.opacity = (highlight ? 0.2 : 0.11) * (0.9 + Math.sin(t * 13) * 0.05 + (Math.sin(t * 2.3) > 0.985 ? -0.4 : 0));
  });

  const h = 2.1;
  return (
    <group ref={group} position={[0, y, z]} scale={1.35}>
      <mesh material={backing} position-z={-0.02}>
        <planeGeometry args={[width, h]} />
      </mesh>
      <mesh material={panel}>
        <planeGeometry args={[width, h]} />
      </mesh>
      <mesh material={border} position={[0, h / 2, 0.01]}>
        <planeGeometry args={[width, 0.05]} />
      </mesh>
      <mesh material={border} position={[0, -h / 2, 0.01]}>
        <planeGeometry args={[width * 0.6, 0.04]} />
      </mesh>
      <Text
        font={MONO_FONT_URL}
        fontSize={0.7}
        position={[-width / 2 + 0.55, 0.05, 0.03]}
        anchorX="left"
        anchorY="middle"
        color={locked ? '#94a3b8' : color}
        material={textMaterial}
      >
        {symbol}
      </Text>
      <Text
        font={FONT_URL}
        fontSize={0.52}
        maxWidth={width - 2.4}
        position={[-width / 2 + 1.9, locked ? 0.28 : 0.05, 0.03]}
        anchorX="left"
        anchorY="middle"
        color="#e6faff"
        letterSpacing={0.02}
        material={textMaterial}
      >
        {title}
      </Text>
      {locked && (
        <Text
          font={FONT_URL}
          fontSize={0.34}
          position={[-width / 2 + 1.9, -0.38, 0.03]}
          anchorX="left"
          anchorY="middle"
          color="#fbbf24"
          material={textMaterial}
        >
          {lockLabel ?? 'Locked'}
        </Text>
      )}
    </group>
  );
}
