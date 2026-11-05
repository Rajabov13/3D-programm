import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { seededRandom } from '@/lib/random';
import { MONO_FONT_URL } from './HoloSign';
import { useScenePalette } from './scenePalette';

const GLYPHS = ['</>', '{ }', '=>', '( )', '[ ]', '#', 'def', 'const', '&&', '++', 'fn', '<div>', ';', '!==', '?:', 'useState', 'print()', '0x1F', '::', '%'];

/** Programming symbols drifting above the plaza. All animated from a single frame callback. */
export function FloatingSymbols({ count, animate }: { count: number; animate: boolean }) {
  const { lights } = useScenePalette();
  const refs = useRef<Array<THREE.Object3D | null>>([]);
  const items = useMemo(() => {
    const rand = seededRandom(2024);
    return Array.from({ length: count }, (_, i) => {
      const angle = rand() * Math.PI * 2;
      const radius = 7 + rand() * 13;
      return {
        glyph: GLYPHS[i % GLYPHS.length],
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        y: 5 + rand() * 10,
        speed: 0.3 + rand() * 0.5,
        phase: rand() * Math.PI * 2,
        size: 0.6 + rand() * 0.7,
        primary: rand() < 0.65,
      };
    });
  }, [count]);

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((obj, i) => {
      if (!obj) return;
      const it = items[i];
      if (animate) obj.position.y = it.y + Math.sin(t * it.speed + it.phase) * 0.8;
      obj.quaternion.copy(camera.quaternion); // billboard
    });
  });

  return (
    <group>
      {items.map((it, i) => (
        <Text
          key={i}
          ref={(o: THREE.Object3D | null) => {
            refs.current[i] = o;
          }}
          font={MONO_FONT_URL}
          position={[it.x, it.y, it.z]}
          fontSize={it.size}
          color={it.primary ? lights.primary : lights.secondary}
          fillOpacity={0.55}
          anchorX="center"
          anchorY="middle"
          material-toneMapped={false}
        >
          {it.glyph}
        </Text>
      ))}
    </group>
  );
}
