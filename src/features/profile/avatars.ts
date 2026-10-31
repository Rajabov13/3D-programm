export interface AvatarPreset {
  id: string;
  label: string;
  from: string;
  to: string;
  icon: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'nebula', label: 'Nebula', from: '#8b7cf6', to: '#5ce1ff', icon: 'Sparkles' },
  { id: 'circuit', label: 'Circuit', from: '#0ea5e9', to: '#1e3a8a', icon: 'Cpu' },
  { id: 'aurora', label: 'Aurora', from: '#34d399', to: '#0ea5e9', icon: 'Wind' },
  { id: 'ember', label: 'Ember', from: '#fb923c', to: '#db2777', icon: 'Flame' },
  { id: 'quasar', label: 'Quasar', from: '#6366f1', to: '#a855f7', icon: 'Orbit' },
  { id: 'glacier', label: 'Glacier', from: '#bae6fd', to: '#3b82f6', icon: 'Snowflake' },
  { id: 'pulse', label: 'Pulse', from: '#f472b6', to: '#7c3aed', icon: 'Activity' },
  { id: 'terminal', label: 'Terminal', from: '#a3e635', to: '#059669', icon: 'Terminal' },
];

export const avatarPreset = (id: string | undefined): AvatarPreset =>
  AVATAR_PRESETS.find((a) => a.id === id) ?? AVATAR_PRESETS[0];
