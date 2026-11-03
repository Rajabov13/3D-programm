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
  sky: { horizon: [0.035, 0.05, 0.11], zenith: [0.006, 0.012, 0.03], glow: [0.16, 0.1, 0.32] },
  stars: true,
  hemisphere: { sky: '#6c9eff', ground: '#070b14', intensity: 0.45 },
  ambient: 0.12,
  sun: { color: '#a9c8ff', intensity: 1.15 },
  neon: 1,
  environment: { background: '#04070e', lights: [['#5ce1ff', 2.2], ['#8b7cf6', 1.6], ['#e0f2fe', 1.2], ['#38bdf8', 1.5]] },
  ground: { base: '#05090f', line: '#2b6cb0', accent: '#38d6ff', road: '#080c14', dash: '#8c9eb3' },
  windows: { base: '#05080f', lit: ['#a5e9ff', '#dff6ff', '#c4b5fd', '#7dd3fc'], off: ['#0b1626', '#0e1b2e'], litChance: 0.32 },
  facade: { tint: '#c9d6ea', altTint: '#b9c5f0', emissive: 1.25 },
  skyline: { tint: [0.7, 0.8, 1], lift: 0, emissive: 0.6 },
  glass: '#14243c',
  metal: '#46536b',
  dark: '#0b1220',
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
