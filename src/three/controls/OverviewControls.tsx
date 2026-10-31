import { useEffect, useRef, type ElementRef } from 'react';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { buildingById, WORLD_RADIUS } from '@/data/buildings';
import { useWorld } from '../worldStore';

// Between the Achievement Hall and Mission Center, looking across the plaza.
export const OVERVIEW_POSE: [number, number, number, number, number, number] = [24, 46, 54, 0, 4, -4];

/** Orbit/overview camera with smooth fly-to transitions between locations. */
export function OverviewControls({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<ElementRef<typeof CameraControls>>(null);
  const cameraNonce = useWorld((s) => s.cameraNonce);
  const firstRun = useRef(true);

  useEffect(() => {
    const controls = ref.current;
    if (!controls) return;
    controls.setBoundary(new THREE.Box3(new THREE.Vector3(-WORLD_RADIUS, 0, -WORLD_RADIUS), new THREE.Vector3(WORLD_RADIUS, 30, WORLD_RADIUS)));
    controls.boundaryFriction = 0.2;
  }, []);

  useEffect(() => {
    const controls = ref.current;
    if (!controls) return;
    const smooth = !reducedMotion && !firstRun.current;
    firstRun.current = false;
    const id = useWorld.getState().travelId;
    const b = buildingById(id ?? undefined);
    if (!b) {
      void controls.setLookAt(...OVERVIEW_POSE, smooth);
      return;
    }
    const [x, z] = b.position;
    const len = Math.hypot(x, z) || 1;
    const dist = b.radius + 20;
    void controls.setLookAt(x - (x / len) * dist, Math.max(10, b.height * 0.55), z - (z / len) * dist, x, b.height * 0.42, z, smooth);
  }, [cameraNonce, reducedMotion]);

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={8}
      maxDistance={95}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.12}
      smoothTime={reducedMotion ? 0 : 0.6}
      draggingSmoothTime={reducedMotion ? 0 : 0.12}
      dollySpeed={0.6}
    />
  );
}
