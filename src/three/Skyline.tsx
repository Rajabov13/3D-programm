import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seededRandom } from '@/lib/random';
import { useCityMaterials } from './materials';
import type { ScenePalette } from './scenePalette';

/** Background towers rendered as a single InstancedMesh (one draw call). */
export function Skyline({ count, castShadow, palette }: { count: number; castShadow: boolean; palette: ScenePalette }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { skyline } = useCityMaterials();
  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    return g;
  }, []);

  const transforms = useMemo(() => {
    const rand = seededRandom(1337);
    const items: Array<{ x: number; z: number; w: number; d: number; h: number; rot: number; tint: number }> = [];
    let guard = 0;
    while (items.length < count && guard++ < count * 20) {
      const angle = rand() * Math.PI * 2;
      const radius = 74 + Math.pow(rand(), 0.8) * 100;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const w = 4 + rand() * 7;
      const d = 4 + rand() * 7;
      const nearFactor = 1 - (radius - 74) / 100;
      const h = 8 + rand() * 28 + nearFactor * rand() * 30 + (rand() < 0.08 ? 35 : 0);
      if (items.some((o) => Math.hypot(o.x - x, o.z - z) < (o.w + w) * 0.6)) continue;
      items.push({ x, z, w, d, h, rot: Math.round(rand() * 4) * (Math.PI / 4) * 0.5, tint: 0.55 + rand() * 0.45 });
    }
    return items;
  }, [count]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const color = new THREE.Color();
    transforms.forEach((t, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t.rot);
      m.compose(new THREE.Vector3(t.x, 0, t.z), q, new THREE.Vector3(t.w, t.h, t.d));
      mesh.setMatrixAt(i, m);
      const [r, g, b] = palette.skyline.tint;
      const lift = palette.skyline.lift;
      color.setRGB(lift + r * t.tint, lift + g * t.tint, lift + b * t.tint);
      mesh.setColorAt(i, color);
    });
    mesh.count = transforms.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [transforms, palette]);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  return <instancedMesh ref={ref} args={[geometry, skyline, Math.max(1, count)]} castShadow={castShadow} receiveShadow frustumCulled={false} />;
}
