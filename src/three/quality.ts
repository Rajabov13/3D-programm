import { useMemo } from 'react';
import { useSettings, type GraphicsQuality } from '@/features/settings/settingsStore';

export type QualityLevel = 'high' | 'medium' | 'low';

export interface QualityPreset {
  level: QualityLevel;
  maxDpr: number;
  antialias: boolean;
  shadows: boolean;
  shadowMapSize: number;
  skylineCount: number;
  symbolCount: number;
  starCount: number;
  droneCount: number;
  environment: boolean;
  physicalMaterials: boolean;
}

export const QUALITY_PRESETS: Record<QualityLevel, QualityPreset> = {
  high: { level: 'high', maxDpr: 2, antialias: true, shadows: true, shadowMapSize: 2048, skylineCount: 300, symbolCount: 20, starCount: 1400, droneCount: 8, environment: true, physicalMaterials: true },
  medium: { level: 'medium', maxDpr: 1.5, antialias: true, shadows: true, shadowMapSize: 1024, skylineCount: 200, symbolCount: 14, starCount: 900, droneCount: 5, environment: true, physicalMaterials: false },
  low: { level: 'low', maxDpr: 1, antialias: false, shadows: false, shadowMapSize: 512, skylineCount: 100, symbolCount: 6, starCount: 400, droneCount: 2, environment: false, physicalMaterials: false },
};

/** Heuristic starting point for "auto"; PerformanceMonitor then adapts the pixel ratio at runtime. */
export function detectQuality(): QualityLevel {
  if (typeof navigator === 'undefined') return 'medium';
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  if (coarse || cores <= 4 || memory <= 4) return 'low';
  if (cores >= 8 && memory >= 8) return 'high';
  return 'medium';
}

export function resolveQuality(setting: GraphicsQuality): QualityLevel | '2d' {
  if (setting === 'auto') return detectQuality();
  return setting;
}

export function useQuality(): { level: QualityLevel | '2d'; preset: QualityPreset } {
  const setting = useSettings((s) => s.graphicsQuality);
  return useMemo(() => {
    const level = resolveQuality(setting);
    return { level, preset: QUALITY_PRESETS[level === '2d' ? 'low' : level] };
  }, [setting]);
}
