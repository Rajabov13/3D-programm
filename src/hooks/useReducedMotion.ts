import { useEffect } from 'react';
import { useSettings } from '@/features/settings/settingsStore';
import { useMediaQuery } from './useMediaQuery';

/** Combines the OS preference with the in-app motion setting. */
export function useReducedMotion(): boolean {
  const motion = useSettings((s) => s.motion);
  const system = useMediaQuery('(prefers-reduced-motion: reduce)');
  if (motion === 'reduce') return true;
  if (motion === 'full') return false;
  return system;
}

/** Mirrors the motion setting onto <html data-motion> so CSS can honour it. */
export function useMotionAttribute(): void {
  const motion = useSettings((s) => s.motion);
  useEffect(() => {
    document.documentElement.dataset.motion = motion;
  }, [motion]);
}
