import { BookOpen, Code2, Flag, LayoutDashboard, Map as MapIcon, Trophy, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/world', label: 'World', icon: MapIcon },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/missions', label: 'Missions', icon: Flag },
  { to: '/playground', label: 'Playground', icon: Code2 },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];
