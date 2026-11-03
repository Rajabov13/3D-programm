/**
 * A world's accent colour used as text: blended towards the theme's ink colour so it stays
 * readable on white (light theme) and on slate (dark theme). `--ink-mix` is set per theme.
 */
export const accentInk = (accent: string) => `color-mix(in srgb, rgb(var(--c-white)) var(--ink-mix), ${accent})`;

/** Dark ink for icons and labels drawn on top of a solid accent fill (accents are bright in both themes). */
export const ON_ACCENT = 'text-[#0b1220]';
