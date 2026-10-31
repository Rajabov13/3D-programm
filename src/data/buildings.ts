import type { DictKey } from '@/i18n';

export type BuildingId =
  | 'html-academy'
  | 'css-studio'
  | 'js-lab'
  | 'python-center'
  | 'react-tower'
  | 'mission-center'
  | 'achievement-hall'
  | 'progress-center';

export type BuildingShape = 'stepped' | 'twisted' | 'lab' | 'twin' | 'spire' | 'hex' | 'hall' | 'dome';
export type BuildingKind = 'zone' | 'missions' | 'achievements' | 'progress';

export interface BuildingDef {
  id: BuildingId;
  nameKey: DictKey;
  descKey: DictKey;
  kind: BuildingKind;
  zoneId?: string;
  route: string;
  /** World position on the ground plane (x, z). */
  position: [number, number];
  /** Collision radius on the ground plane. */
  radius: number;
  height: number;
  shape: BuildingShape;
  accent: string;
  symbol: string;
}

const RING = 31;

/** θ = 0 points north (−z). Buildings face the central plaza. */
function polar(deg: number, r = RING): [number, number] {
  const t = (deg * Math.PI) / 180;
  return [Math.round(Math.sin(t) * r * 100) / 100, Math.round(-Math.cos(t) * r * 100) / 100];
}

export const buildings: BuildingDef[] = [
  {
    id: 'progress-center',
    nameKey: 'b.progress',
    descKey: 'bd.progress',
    kind: 'progress',
    route: '/profile',
    position: polar(0, 33),
    radius: 7.5,
    height: 16,
    shape: 'dome',
    accent: '#8b7cf6',
    symbol: '%',
  },
  {
    id: 'html-academy',
    nameKey: 'b.html',
    descKey: 'bd.html',
    kind: 'zone',
    zoneId: 'html',
    route: '/zone/html',
    position: polar(-45),
    radius: 6.2,
    height: 22,
    shape: 'stepped',
    accent: '#fb923c',
    symbol: '</>',
  },
  {
    id: 'css-studio',
    nameKey: 'b.css',
    descKey: 'bd.css',
    kind: 'zone',
    zoneId: 'css',
    route: '/zone/css',
    position: polar(45),
    radius: 5.8,
    height: 24,
    shape: 'twisted',
    accent: '#38bdf8',
    symbol: '{ }',
  },
  {
    id: 'js-lab',
    nameKey: 'b.js',
    descKey: 'bd.js',
    kind: 'zone',
    zoneId: 'js',
    route: '/zone/js',
    position: polar(-90),
    radius: 6,
    height: 20,
    shape: 'lab',
    accent: '#facc15',
    symbol: 'JS',
  },
  {
    id: 'python-center',
    nameKey: 'b.python',
    descKey: 'bd.python',
    kind: 'zone',
    zoneId: 'python',
    route: '/zone/python',
    position: polar(90),
    radius: 7,
    height: 21,
    shape: 'twin',
    accent: '#a3e635',
    symbol: 'py',
  },
  {
    id: 'react-tower',
    nameKey: 'b.react',
    descKey: 'bd.react',
    kind: 'zone',
    zoneId: 'react',
    route: '/zone/react',
    position: polar(-135),
    radius: 5,
    height: 34,
    shape: 'spire',
    accent: '#22d3ee',
    symbol: 'JSX',
  },
  {
    id: 'mission-center',
    nameKey: 'b.missions',
    descKey: 'bd.missions',
    kind: 'missions',
    route: '/quests',
    position: polar(135),
    radius: 7,
    height: 12,
    shape: 'hex',
    accent: '#f472b6',
    symbol: '!',
  },
  {
    id: 'achievement-hall',
    nameKey: 'b.badges',
    descKey: 'bd.badges',
    kind: 'achievements',
    route: '/badges',
    position: polar(180, 36),
    radius: 7.5,
    height: 11,
    shape: 'hall',
    accent: '#fbbf24',
    symbol: '#1',
  },
];

export const buildingById = (id: string | undefined) => buildings.find((b) => b.id === id);

/** Y rotation that makes a building's front (+z) face the plaza centre. */
export function facingRotation([x, z]: [number, number]): number {
  return Math.atan2(-x, -z);
}

/** A walkable point in front of the building's entrance. */
export function entrancePoint(b: BuildingDef, extra = 3): [number, number] {
  const [x, z] = b.position;
  const len = Math.hypot(x, z) || 1;
  const d = b.radius + extra;
  return [x - (x / len) * d, z - (z / len) * d];
}

export const WORLD_RADIUS = 52;
export const PLAZA_RADIUS = 14;
export const SPAWN: { position: [number, number]; yaw: number } = { position: [0, 22], yaw: 0 };
