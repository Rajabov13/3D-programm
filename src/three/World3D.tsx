import { useRef } from 'react';
import * as THREE from 'three';
import type { BuildingId } from '@/types';
import type { BuildingStatus } from './buildings/Building';
import { CityCanvas } from './CityCanvas';
import { CityScene } from './CityScene';
import { OverviewControls } from './controls/OverviewControls';
import { WalkController } from './controls/WalkController';
import type { QualityPreset } from './quality';
import type { CameraMode } from './worldStore';

/** Interactive world canvas (lazy-loaded so three.js isn't in the initial bundle). */
export default function World3D({
  preset,
  reducedMotion,
  statusById,
  mode,
  sensitivity,
  invertY,
  onReady,
  onContextLost,
}: {
  preset: QualityPreset;
  reducedMotion: boolean;
  statusById: Partial<Record<BuildingId, BuildingStatus>>;
  statusKey: string;
  mode: CameraMode;
  sensitivity: number;
  invertY: boolean;
  onReady: () => void;
  onContextLost: () => void;
}) {
  const targets = useRef(new Map<BuildingId, THREE.Object3D>());
  return (
    <CityCanvas preset={preset} className="!absolute inset-0 touch-none" onContextLost={onContextLost} label="Interactive 3D map of Code World">
      {mode === 'overview' ? (
        <OverviewControls reducedMotion={reducedMotion} />
      ) : (
        <WalkController reducedMotion={reducedMotion} sensitivity={sensitivity} invertY={invertY} targets={targets} />
      )}
      <CityScene preset={preset} animate={!reducedMotion} interactive statusById={statusById} targets={targets} onReady={onReady} />
    </CityCanvas>
  );
}
