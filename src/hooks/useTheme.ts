import { useEffect, useState } from 'react';
import { useSettings } from '@/features/settings/settingsStore';

export type ResolvedTheme = 'light' | 'dark';

const query = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null);

/** The theme actually shown: the saved choice, or the device setting when “system” is chosen. */
export function useResolvedTheme(): ResolvedTheme {
  const preference = useSettings((s) => s.theme);
  const [systemDark, setSystemDark] = useState(() => query()?.matches ?? false);
  useEffect(() => {
    const mq = query();
    if (!mq) return;
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  if (preference === 'system') return systemDark ? 'dark' : 'light';
  return preference;
}

/** Keeps <html data-theme> (colour tokens) and the browser UI colour in sync with the theme. */
export function useThemeAttribute(): void {
  const theme = useResolvedTheme();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e1525' : '#f5f7fb');
  }, [theme]);
}
