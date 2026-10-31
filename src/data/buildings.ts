import type { BuildingId } from '@/types';

export type BuildingShape = 'stepped' | 'twisted' | 'lab' | 'twin' | 'spire' | 'hex' | 'hall' | 'dome';
export type BuildingKind = 'course' | 'missions' | 'achievements' | 'progress';

export interface BuildingDef {
  id: BuildingId;
  name: string;
  kind: BuildingKind;
  courseId?: string;
  route: string;
  description: string;
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
    name: 'Personal Progress Center',
    kind: 'progress',
    route: '/progress',
    description: 'Your personal command deck: levels, XP history, activity and course completion.',
    position: polar(0, 33),
    radius: 7.5,
    height: 16,
    shape: 'dome',
    accent: '#8b7cf6',
    symbol: '%',
  },
  {
    id: 'html-academy',
    name: 'HTML Academy',
    kind: 'course',
    courseId: 'html',
    route: '/courses/html',
    description: 'Where every journey begins. Learn the structure of the web.',
    position: polar(-45),
    radius: 6.2,
    height: 22,
    shape: 'stepped',
    accent: '#fb923c',
    symbol: '</>',
  },
  {
    id: 'css-studio',
    name: 'CSS Design Studio',
    kind: 'course',
    courseId: 'css',
    route: '/courses/css',
    description: 'A twisting tower of colour, spacing and layout.',
    position: polar(45),
    radius: 5.8,
    height: 24,
    shape: 'twisted',
    accent: '#38bdf8',
    symbol: '{ }',
  },
  {
    id: 'js-lab',
    name: 'JavaScript Laboratory',
    kind: 'course',
    courseId: 'javascript',
    route: '/courses/javascript',
    description: 'Experiments in logic, events and asynchronous code.',
    position: polar(-90),
    radius: 6,
    height: 20,
    shape: 'lab',
    accent: '#facc15',
    symbol: 'JS',
  },
  {
    id: 'python-center',
    name: 'Python Center',
    kind: 'course',
    courseId: 'python',
    route: '/courses/python',
    description: 'Twin towers of readable, powerful code.',
    position: polar(90),
    radius: 7,
    height: 21,
    shape: 'twin',
    accent: '#a3e635',
    symbol: 'py',
  },
  {
    id: 'react-tower',
    name: 'React Development Tower',
    kind: 'course',
    courseId: 'react',
    route: '/courses/react',
    description: 'The tallest spire in the city — compose interfaces from components.',
    position: polar(-135),
    radius: 5,
    height: 34,
    shape: 'spire',
    accent: '#22d3ee',
    symbol: 'JSX',
  },
  {
    id: 'mission-center',
    name: 'Mission Center',
    kind: 'missions',
    route: '/missions',
    description: 'Pick up objectives and claim XP rewards for real progress.',
    position: polar(135),
    radius: 7,
    height: 12,
    shape: 'hex',
    accent: '#f472b6',
    symbol: '!',
  },
  {
    id: 'achievement-hall',
    name: 'Achievement Hall',
    kind: 'achievements',
    route: '/achievements',
    description: 'Badges and trophies earned across Code World.',
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
