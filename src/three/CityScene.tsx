import { useCallback, useEffect, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { buildings } from '@/data/buildings';
import type { BuildingId } from '@/data/buildings';
import { FOG_COLOR, Lighting, Sky, Stars } from './Atmosphere';
import { Building, type BuildingStatus } from './buildings/Building';
import { Drones } from './Drones';
import { FloatingSymbols } from './FloatingSymbols';
import { Ground, ShadowCatcher } from './Ground';
import { CityMaterialsProvider } from './materials';
import { PlazaCore } from './PlazaCore';
import type { QualityPreset } from './quality';
import { Skyline } from './Skyline';
import { useWorld } from './worldStore';

export interface CitySceneProps {
  preset: QualityPreset;
  animate: boolean;
  interactive: boolean;
  statusById?: Partial<Record<BuildingId, BuildingStatus>>;
  targets?: MutableRefObject<Map<BuildingId, THREE.Object3D>>;
  onReady?: () => void;
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

export function CityScene({ preset, animate, interactive, statusById, targets, onReady }: CitySceneProps) {
  const hoveredId = useWorld((s) => s.hoveredId);
  const selectedId = useWorld((s) => s.selectedId);
  const targetedId = useWorld((s) => s.targetedId);
  const hover = useWorld((s) => s.hover);
  const select = useWorld((s) => s.select);
  const mode = useWorld((s) => s.mode);

  useEffect(() => {
    if (!interactive) return;
    document.body.style.cursor = hoveredId ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hoveredId, interactive]);

  const registerTarget = useCallback(
    (id: BuildingId, object: THREE.Object3D | null) => {
      if (!targets) return;
      if (object) targets.current.set(id, object);
      else targets.current.delete(id);
    },
    [targets],
  );

  const onSelect = useCallback((id: BuildingId) => select(id, { travel: mode === 'overview' }), [select, mode]);
  const fogNear = 70;
  const fogFar = 260;

  return (
    <CityMaterialsProvider preset={preset}>
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, fogNear, fogFar]} />
      <Sky />
      <Stars count={preset.starCount} />
      <Lighting preset={preset} />
      <Ground fogColor={FOG_COLOR} fogNear={fogNear} fogFar={fogFar} animate={animate} />
      {preset.shadows && <ShadowCatcher />}
      <Skyline count={preset.skylineCount} castShadow={false} />
      <PlazaCore animate={animate} shadows={preset.shadows} />
      {buildings.map((def) => (
        <Building
          key={def.id}
          def={def}
          status={statusById?.[def.id] ?? { locked: false }}
          hovered={hoveredId === def.id || targetedId === def.id}
          selected={selectedId === def.id}
          interactive={interactive}
          animate={animate}
          shadows={preset.shadows}
          onHover={interactive ? hover : undefined}
          onSelect={interactive ? onSelect : undefined}
          registerTarget={targets ? registerTarget : undefined}
        />
      ))}
      <FloatingSymbols count={preset.symbolCount} animate={animate} />
      <Drones count={preset.droneCount} animate={animate} />
      <Ready onReady={onReady} />
    </CityMaterialsProvider>
  );
}
