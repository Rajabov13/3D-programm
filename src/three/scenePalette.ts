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
  lights: { primary: '#4ade80', secondary: '#fbbf24' },
  environment: { background: '#0a0a0a', lights: [['#ffd59a', 1.6], ['#4ade80', 1.0], ['#f5f5f4', 1.2], ['#fbbf24', 1.0]] },
  ground: { base: '#0c0c0c', line: '#3a3a3a', accent: '#4ade80', road: '#161616', dash: '#e5c76b' },
  windows: { base: '#0a0a0a', lit: ['#ffd27a', '#ffe7b0', '#fff4d6', '#f6c26b'], off: ['#151515', '#1b1b1b'], litChance: 0.34 },
  facade: { tint: '#e8e2d6', altTint: '#ddd6c8', emissive: 1.1 },
  skyline: { tint: [0.95, 0.85, 0.7], lift: 0, emissive: 0.55 },
  glass: '#1c2a24',
  metal: '#4a4a4a',
  dark: '#111111',
};

export const DAY: ScenePalette = {
  day: true,
  background: '#cfe0f0',
  sky: { horizon: [0.62, 0.76, 0.9], zenith: [0.12, 0.36, 0.78], glow: [0.18, 0.14, 0.06] },
  stars: false,
  hemisphere: { sky: '#eaf3ff', ground: '#a9b4c2', intensity: 1.1 },
  ambient: 0.45,
  sun: { color: '#fff3df', intensity: 2.4 },
  neon: 0.25,
  lights: { primary: '#2563eb', secondary: '#f59e0b' },
  environment: { background: '#d6e6f5', lights: [['#ffffff', 2.4], ['#cfe3ff', 1.6], ['#fff1d6', 1.8], ['#9cc7f2', 1.2]] },
  ground: { base: '#b9c4d0', line: '#8ea3b9', accent: '#2563eb', road: '#56606e', dash: '#f8fafc' },
  windows: { base: '#e3e9f0', lit: ['#8fb8de', '#a9cbea', '#6f9cc8'], off: ['#3c5571', '#4a6584', '#2f4660'], litChance: 0.3 },
  facade: { tint: '#ffffff', altTint: '#eef2ff', emissive: 0.04 },
  skyline: { tint: [0.78, 0.82, 0.9], lift: 0.12, emissive: 0.03 },
  glass: '#5d83ad',
  metal: '#a7b2c2',
  dark: '#606b7b',
};

export function useScenePalette(): ScenePalette {
  return useResolvedTheme() === 'light' ? DAY : NIGHT;
}
