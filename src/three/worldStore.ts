import { create } from 'zustand';
import type { BuildingId } from '@/data/buildings';

export type CameraMode = 'overview' | 'walk';

interface WorldState {
  mode: CameraMode;
  selectedId: BuildingId | null;
  hoveredId: BuildingId | null;
  /** Building whose entrance the walking player is standing near. */
  nearbyId: BuildingId | null;
  /** Building under the crosshair while pointer-locked. */
  targetedId: BuildingId | null;
  pointerLocked: boolean;
  /** Increments to ask the camera to fly/travel to `selectedId` (or reset when null). */
  cameraNonce: number;
  travelId: BuildingId | null;
  setMode: (mode: CameraMode) => void;
  select: (id: BuildingId | null, options?: { travel?: boolean }) => void;
  hover: (id: BuildingId | null) => void;
  setNearby: (id: BuildingId | null) => void;
  setTargeted: (id: BuildingId | null) => void;
  setPointerLocked: (locked: boolean) => void;
  resetView: () => void;
}

export const useWorld = create<WorldState>((set) => ({
  mode: 'overview',
  selectedId: null,
  hoveredId: null,
  nearbyId: null,
  targetedId: null,
  pointerLocked: false,
  cameraNonce: 0,
  travelId: null,
  setMode: (mode) => set({ mode, hoveredId: null, targetedId: null }),
  select: (id, options) =>
    set((s) => ({
      selectedId: id,
      travelId: options?.travel ? id : s.travelId,
      cameraNonce: options?.travel ? s.cameraNonce + 1 : s.cameraNonce,
    })),
  hover: (id) => set((s) => (s.hoveredId === id ? s : { hoveredId: id })),
  setNearby: (id) => set((s) => (s.nearbyId === id ? s : { nearbyId: id })),
  setTargeted: (id) => set((s) => (s.targetedId === id ? s : { targetedId: id })),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  resetView: () => set((s) => ({ selectedId: null, travelId: null, cameraNonce: s.cameraNonce + 1 })),
}));

/** Non-reactive input channel for the on-screen joystick (read every frame). */
export const touchInput = { moveX: 0, moveY: 0 };
