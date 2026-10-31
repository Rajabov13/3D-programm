import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GraphicsQuality = 'auto' | 'high' | 'medium' | 'low' | '2d';
export type MotionPreference = 'system' | 'reduce' | 'full';

/** Device-local preferences (graphics/editor). Account preferences live in the backend. */
export interface DeviceSettings {
  graphicsQuality: GraphicsQuality;
  motion: MotionPreference;
  editorFontSize: number;
  editorWordWrap: boolean;
  editorMinimap: boolean;
  invertLookY: boolean;
  lookSensitivity: number;
  hasSeenWorldIntro: boolean;
  sound: boolean;
}

interface SettingsState extends DeviceSettings {
  update: (patch: Partial<DeviceSettings>) => void;
  reset: () => void;
}

const defaults: DeviceSettings = {
  graphicsQuality: 'auto',
  motion: 'system',
  editorFontSize: 14,
  editorWordWrap: true,
  editorMinimap: false,
  invertLookY: false,
  lookSensitivity: 1,
  hasSeenWorldIntro: false,
  sound: true,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      update: (patch) => set(patch),
      reset: () => set(defaults),
    }),
    { name: 'cw.settings.v1', version: 1 },
  ),
);
