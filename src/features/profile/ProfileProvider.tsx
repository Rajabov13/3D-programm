import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AppError } from '@/lib/errors';
import { readJSON, writeJSON } from '@/lib/storage';

/**
 * Local learner profile for the demo version. There are no accounts: the profile,
 * like all progress, is stored in this browser only.
 */
export interface Profile {
  displayName: string;
  avatar: string;
  showOnLeaderboard: boolean;
}

export type ProfilePatch = Partial<Profile>;

interface ProfileContextValue {
  profile: Profile;
  updateProfile(patch: ProfilePatch): Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const PROFILE_KEY = 'cw.demo.profile.v1';
const defaultProfile: Profile = { displayName: 'Kodchi', avatar: 'ember', showOnLeaderboard: true };

export function readProfile(): Profile {
  return { ...defaultProfile, ...readJSON<Partial<Profile>>(PROFILE_KEY, {}) };
}

export const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N} _.-]{2,32}$/u;

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 32) return 'Display name must be 2–32 characters.';
  if (!DISPLAY_NAME_PATTERN.test(trimmed)) return 'Use letters, numbers, spaces, dots, dashes or underscores only.';
  return null;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(readProfile);

  const updateProfile = useCallback(async (patch: ProfilePatch) => {
    if (patch.displayName !== undefined) {
      const invalid = validateDisplayName(patch.displayName);
      if (invalid) throw new AppError('VALIDATION', invalid);
    }
    const next = { ...readProfile(), ...patch };
    if (patch.displayName !== undefined) next.displayName = patch.displayName.trim();
    writeJSON(PROFILE_KEY, next);
    setProfile(next);
  }, []);

  const value = useMemo(() => ({ profile, updateProfile }), [profile, updateProfile]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
