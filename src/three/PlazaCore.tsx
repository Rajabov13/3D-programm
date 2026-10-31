import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAccentMaterial, useCityMaterials, useGlowMaterial } from './materials';

export const PLAZA_CORE_RADIUS = 3.4;

/** Central holographic monument of the plaza. */
export function PlazaCore({ animate, shadows }: { animate: boolean; shadows: boolean }) {
  const { metal, dark } = useCityMaterials();
  const cyan = useAccentMaterial('#5ce1ff', 2.4);
  const violet = useAccentMaterial('#8b7cf6', 2);
  const beam = useGlowMaterial('#38d6ff', 0.12);
  const wire = useGlowMaterial('#5ce1ff', 0.5);
  const rings = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (!animate) return;
    if (rings.current) {
      rings.current.children.forEach((r, i) => {
        r.rotation.z += dt * (0.3 + i * 0.2) * (i % 2 ? -1 : 1);
      });
    }
    if (core.current) {
      core.current.rotation.y += dt * 0.6;
      core.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.3;
      core.current.position.y = 6.5 + Math.sin(clock.elapsedTime * 0.8) * 0.3;
    }
  });
  return (
    <group>
      <mesh position={[0, 0.4, 0]} material={dark} receiveShadow castShadow={shadows}>
        <cylinderGeometry args={[PLAZA_CORE_RADIUS, PLAZA_CORE_RADIUS + 0.4, 0.8, 48]} />
      </mesh>
      <mesh position={[0, 0.85, 0]} rotation-x={-Math.PI / 2} material={cyan}>
        <ringGeometry args={[PLAZA_CORE_RADIUS - 0.35, PLAZA_CORE_RADIUS - 0.2, 64]} />
      </mesh>
      <mesh position={[0, 2.2, 0]} material={metal} castShadow={shadows}>
        <cylinderGeometry args={[0.6, 1.1, 2.8, 8]} />
      </mesh>
      <mesh position={[0, 20, 0]} material={beam}>
        <cylinderGeometry args={[0.3, 1.6, 38, 16, 1, true]} />
      </mesh>
      <mesh ref={core} position={[0, 6.5, 0]} material={wire}>
        <icosahedronGeometry args={[1.5, 1]} />
      </mesh>
      <group ref={rings} position={[0, 6.5, 0]}>
        {[2.6, 3.2, 3.8].map((r, i) => (
          <group key={r} rotation={[Math.PI / 2 + i * 0.5, i * 0.7, 0]}>
            <mesh material={i === 1 ? violet : cyan}>
              <torusGeometry args={[r, 0.04, 6, 80]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
