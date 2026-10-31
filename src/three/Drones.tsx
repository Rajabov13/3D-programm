import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seededRandom } from '@/lib/random';

/** Small light-trail vehicles circling the skyline — one instanced draw call. */
export function Drones({ count, animate }: { count: number; animate: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const paths = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: count }, () => ({
      radius: 26 + rand() * 30,
      height: 14 + rand() * 22,
      speed: (0.04 + rand() * 0.06) * (rand() < 0.5 ? -1 : 1),
      phase: rand() * Math.PI * 2,
      wobble: rand() * 2,
    }));
  }, [count]);
  const geometry = useMemo(() => new THREE.CapsuleGeometry(0.18, 1.4, 4, 8).rotateZ(Math.PI / 2), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#9be7ff', toneMapped: false }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const time = useRef(0);

  const update = (t: number) => {
    const mesh = ref.current;
    if (!mesh) return;
    paths.forEach((p, i) => {
      const a = p.phase + t * p.speed;
      dummy.position.set(Math.cos(a) * p.radius, p.height + Math.sin(t * 0.6 + p.phase) * p.wobble, Math.sin(a) * p.radius);
      dummy.rotation.set(0, -a + (p.speed > 0 ? 0 : Math.PI), 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => update(0));
  useLayoutEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useFrame((_, dt) => {
    if (!animate) return;
    time.current += dt;
    update(time.current);
  });

  if (count === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} />;
}
