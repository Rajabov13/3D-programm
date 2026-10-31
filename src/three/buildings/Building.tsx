import { useEffect, useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Lock } from 'lucide-react';
import { facingRotation, type BuildingDef, type BuildingId } from '@/data/buildings';
import { useT } from '@/i18n';
import { HoloSign } from '../HoloSign';
import { useGlowMaterial } from '../materials';
import { SHAPES } from './shapes';

export interface BuildingStatus {
  locked: boolean;
  requiredLevel?: number;
  progressLabel?: string;
}

export function Building({
  def,
  status,
  hovered,
  selected,
  interactive,
  animate,
  shadows,
  onHover,
  onSelect,
  registerTarget,
}: {
  def: BuildingDef;
  status: BuildingStatus;
  hovered: boolean;
  selected: boolean;
  interactive: boolean;
  animate: boolean;
  shadows: boolean;
  onHover?: (id: BuildingId | null) => void;
  onSelect?: (id: BuildingId) => void;
  registerTarget?: (id: BuildingId, object: THREE.Object3D | null) => void;
}) {
  const t = useT();
  const name = t(def.nameKey);
  const group = useRef<THREE.Group>(null);
  const Shape = SHAPES[def.shape];
  const highlight = hovered || selected;
  const ringMaterial = useGlowMaterial(status.locked ? '#94a3b8' : def.accent, highlight ? 0.85 : 0.28);

  useEffect(() => {
    registerTarget?.(def.id, group.current);
    return () => registerTarget?.(def.id, null);
  }, [def.id, registerTarget]);

  const handlers = interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover?.(def.id);
        },
        onPointerOut: () => onHover?.(null),
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          // Ignore camera drags, and clicks while pointer-locked (the crosshair handles those).
          if (e.delta > 6 || document.pointerLockElement) return;
          onSelect?.(def.id);
        },
      }
    : {};

  return (
    <group ref={group} position={[def.position[0], 0, def.position[1]]} rotation-y={facingRotation(def.position)} {...handlers} userData={{ buildingId: def.id }}>
      <Shape accent={status.locked ? '#64748b' : def.accent} highlight={highlight} animate={animate} shadows={shadows} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.04} material={ringMaterial}>
        <ringGeometry args={[def.radius + 0.6, def.radius + 0.85, 64]} />
      </mesh>
      <HoloSign
        title={name}
        symbol={def.symbol}
        color={def.accent}
        y={Math.min(def.height * 0.36, 7.5) + 1.2}
        z={def.radius + 1.4}
        width={Math.max(8.4, name.length * 0.33 + 3)}
        locked={status.locked}
        lockLabel={status.requiredLevel ? t('common.unlocksAt', { n: status.requiredLevel }) : t('common.locked')}
        highlight={highlight}
        animate={animate}
      />
      {interactive && hovered && (
        <Html position={[0, def.height + 3, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div className="glass-strong whitespace-nowrap rounded-xl px-3 py-2 text-center">
            <p className="text-[13px] font-semibold text-white">{name}</p>
            <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-slate-400">
              {status.locked ? (
                <>
                  <Lock className="h-3 w-3 text-amber-300" aria-hidden /> {t('common.unlocksAt', { n: status.requiredLevel ?? 1 })}
                </>
              ) : (
                (status.progressLabel ?? t(def.descKey))
              )}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
