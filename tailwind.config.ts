import type { Config } from 'tailwindcss';
import defaults from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

/**
 * Theme-aware colours. Every palette class (text-slate-400, bg-white/5, border-cyan-300/40 …)
 * reads a CSS variable, so one set of class names serves both themes:
 *  - dark: the normal Tailwind values;
 *  - light: each scale is mirrored (50↔950, 100↔900, 200↔800, 300↔700, 400↔600) and
 *    white ↔ ink, so “light text on dark” becomes “dark text on light” automatically.
 * Any element can force a theme for its subtree with data-theme="dark" / "light"
 * (the 3D city and the hero stay dark: they sit on a night scene).
 * The brand colour is blue: the `cyan` scale used across the UI is mapped to Tailwind's blue.
 */
const PALETTES = ['slate', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'] as const;
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const SOURCE: Record<(typeof PALETTES)[number], string> = Object.fromEntries(PALETTES.map((p) => [p, p === 'cyan' ? 'blue' : p])) as never;

const rgb = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const palette = (name: string) => (defaults as unknown as Record<string, Record<number, string>>)[name];
const ref = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** Page and surface colours (the old “night” scale) and semantic tokens, per theme. */
const SURFACES = {
  dark: { 'night-950': '#0e1525', 'night-900': '#121b2e', 'night-850': '#162034', 'night-800': '#1a2539', 'night-700': '#233149', 'night-600': '#2e3d58', code: '#0b1220', primary: '#2563eb', 'primary-hover': '#3b82f6', 'on-primary': '#ffffff', white: '#ffffff', black: '#000000' },
  light: { 'night-950': '#f5f7fb', 'night-900': '#ffffff', 'night-850': '#ffffff', 'night-800': '#ffffff', 'night-700': '#eef2f7', 'night-600': '#e2e8f0', code: '#f8fafc', primary: '#2563eb', 'primary-hover': '#1d4ed8', 'on-primary': '#ffffff', white: '#0f172a', black: '#ffffff' },
} as const;

const TWEAKS = {
  dark: { 'slate-500': '#8391a7' },
  light: { 'slate-500': '#56657b', 'amber-300': '#9a4a0a' },
} as const;

function themeVars(theme: 'dark' | 'light'): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const p of PALETTES) {
    const src = palette(SOURCE[p]);
    for (let i = 0; i < SHADES.length; i++) {
      const shade = theme === 'dark' ? SHADES[i] : SHADES[SHADES.length - 1 - i];
      vars[`--c-${p}-${SHADES[i]}`] = rgb(src[shade]);
    }
  }
  for (const [k, v] of Object.entries(SURFACES[theme])) vars[`--c-${k}`] = rgb(v);
  // Readability tweaks (WCAG AA 4.5:1 for small text): muted grey and amber text.
  for (const [k, v] of Object.entries(TWEAKS[theme])) vars[`--c-${k}`] = rgb(v);
  return vars;
}

type ColorTree = { [key: string]: string | ColorTree };
const colors: ColorTree = {
  transparent: 'transparent',
  current: 'currentColor',
  inherit: 'inherit',
  white: ref('white'),
  black: ref('black'),
  code: ref('code'),
  primary: { DEFAULT: ref('primary'), hover: ref('primary-hover'), fg: ref('on-primary') },
  night: Object.fromEntries([950, 900, 850, 800, 700, 600].map((s) => [s, ref(`night-${s}`)])),
};
for (const p of PALETTES) colors[p] = Object.fromEntries(SHADES.map((s) => [s, ref(`${p}-${s}`)]));

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors,
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glass: 'var(--shadow-card)',
        card: 'var(--shadow-card)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'star-pop': {
          '0%': { transform: 'scale(0) rotate(-40deg)', opacity: '0' },
          '70%': { transform: 'scale(1.35) rotate(8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out both',
        'rise-in': 'rise-in 400ms cubic-bezier(.2,.8,.2,1) both',
        'star-pop': 'star-pop 500ms cubic-bezier(.2,.8,.2,1) both',
        shake: 'shake 400ms ease-in-out',
        'pop-in': 'pop-in 250ms cubic-bezier(.2,.8,.2,1) both',
        float: 'float 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root, [data-theme="dark"]': { ...themeVars('dark'), '--shadow-card': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.55)', '--ink-mix': '18%', colorScheme: 'dark' },
        '[data-theme="light"]': { ...themeVars('light'), '--shadow-card': '0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -12px rgba(15,23,42,0.14)', '--ink-mix': '42%', colorScheme: 'light' },
      });
    }),
  ],
} satisfies Config;
