import {
  Activity, Atom, Award, Braces, CircleCheck, Compass, Cpu, FileCode2, Flag, Flame, Gem, Orbit, Palette, Rocket,
  Snowflake, Sparkles, Star, Swords, Target, Terminal, Trophy, TrendingUp, Wind, Zap, Medal, Crown, type LucideIcon,
} from 'lucide-react';

/** Icons that content (achievements, avatars) may reference by name. */
export const ICONS: Record<string, LucideIcon> = {
  Activity, Atom, Award, Braces, CircleCheck, Compass, Cpu, FileCode2, Flag, Flame, Gem, Orbit, Palette, Rocket,
  Snowflake, Sparkles, Star, Swords, Target, Terminal, Trophy, TrendingUp, Wind, Zap, Medal, Crown,
};

export const ICON_NAMES = Object.keys(ICONS).sort();

export function NamedIcon({ name, className, size }: { name: string; className?: string; size?: number }) {
  const Icon = ICONS[name] ?? Award;
  return <Icon className={className} size={size} aria-hidden />;
}
