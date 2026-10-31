import { Code2, Gift, Map as MapIcon, Trophy, Building2, type LucideIcon } from 'lucide-react';
import type { DictKey } from '@/i18n';

export interface NavItem {
  to: string;
  labelKey: DictKey;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/map', labelKey: 'nav.map', icon: MapIcon },
  { to: '/world', labelKey: 'nav.world', icon: Building2 },
  { to: '/quests', labelKey: 'nav.quests', icon: Gift },
  { to: '/leaderboard', labelKey: 'nav.leaderboard', icon: Trophy },
  { to: '/lab', labelKey: 'nav.lab', icon: Code2 },
];
