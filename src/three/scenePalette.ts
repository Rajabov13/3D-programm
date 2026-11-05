import { useResolvedTheme } from '@/hooks/useTheme';

type RGB = [number, number, number];

/** Colours of the 3D city. The light site theme shows the city by day, the dark theme by night. */
export interface ScenePalette {
  day: boolean;
  /** Clear colour and fog. */
  background: string;
  /** Sky dome gradient (linear RGB). */
  sky: { horizon: RGB; zenith: RGB; glow: RGB };
  stars: boolean;
  hemisphere: { sky: string; ground: string; intensity: number };
  ambient: number;
  sun: { color: string; intensity: number };
  /** Multiplier for the coloured plaza point lights. */
  neon: number;
  /** Accent light colours: plaza core, beams, floating code, drones. */
  lights: { primary: string; secondary: string };
  environment: { background: string; lights: [string, number][] };
  ground: { base: string; line: string; accent: string; road: string; dash: string };
  windows: { base: string; lit: string[]; off: string[]; litChance: number };
  facade: { tint: string; altTint: string; emissive: number };
  skyline: { tint: RGB; lift: number; emissive: number };
  glass: string;
  metal: string;
  dark: string;
}

export const NIGHT: ScenePalette = {
  day: false,
  background: '#050913',
  sky: { horizon: [0.03, 0.035, 0.05], zenith: [0.004, 0.005, 0.01], glow: [0.2, 0.11, 0.04] },
  stars: true,
  hemisphere: { sky: '#9aa6b8', ground: '#0b0b0b', intensity: 0.35 },
  ambient: 0.12,
  sun: { color: '#c8d2e0', intensity: 0.9 },
  neon: 0.8,
  lights: { primary: '#f5f5f4', secondary: '#fbbf24' },
  environment: { background: '#0a0a0a', lights: [['#ffd59a', 1.6], ['#d4d4d4', 1.0], ['#f5f5f4', 1.2], ['#fbbf24', 1.0]] },
  ground: { base: '#0c0c0c', line: '#3a3a3a', accent: '#d4d4d4', road: '#161616', dash: '#e5c76b' },
  windows: { base: '#0a0a0a', lit: ['#ffd27a', '#ffe7b0', '#fff4d6', '#f6c26b'], off: ['#151515', '#1b1b1b'], litChance: 0.34 },
  facade: { tint: '#e8e2d6', altTint: '#ddd6c8', emissive: 1.1 },
  skyline: { tint: [0.95, 0.85, 0.7], lift: 0, emissive: 0.55 },
  glass: '#24262a',
  metal: '#4a4a4a',
  dark: '#111111',
};

export const DAY: ScenePalette = {
  day: true,
  background: '#e3e4e5',
  sky: { horizon: [0.76, 0.77, 0.78], zenith: [0.5, 0.52, 0.55], glow: [0.12, 0.1, 0.07] },
  stars: false,
  hemisphere: { sky: '#f4f4f4', ground: '#b4b4b4', intensity: 1.1 },
  ambient: 0.45,
  sun: { color: '#fff6e8', intensity: 2.4 },
  neon: 0.25,
  lights: { primary: '#ffffff', secondary: '#f59e0b' },
  environment: { background: '#e6e6e6', lights: [['#ffffff', 2.4], ['#e5e5e5', 1.6], ['#fff1d6', 1.8], ['#d4d4d4', 1.2]] },
  ground: { base: '#c4c6c8', line: '#a3a5a8', accent: '#393b3d', road: '#5a5c5f', dash: '#f5f5f5' },
  windows: { base: '#e8e9ea', lit: ['#b9bcc0', '#cfd2d5', '#a5a9ae'], off: ['#45484d', '#55585d', '#393c41'], litChance: 0.3 },
  facade: { tint: '#ffffff', altTint: '#f3f3f3', emissive: 0.04 },
  skyline: { tint: [0.84, 0.84, 0.85], lift: 0.12, emissive: 0.03 },
  glass: '#6d7178',
  metal: '#b0b2b5',
  dark: '#66686c',
};

export function useScenePalette(): ScenePalette {
  return useResolvedTheme() === 'light' ? DAY : NIGHT;
}
