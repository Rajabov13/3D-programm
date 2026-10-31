import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Settings, Shield, Trophy, User } from 'lucide-react';
import { useProfile } from '@/features/profile/ProfileProvider';
import { Avatar } from '@/components/ui/Avatar';

export function UserMenu() {
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = 'focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.07] hover:text-white';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="focus-ring flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5 hover:border-white/20"
      >
        <Avatar preset={profile.avatar} size={28} />
        <span className="hidden max-w-[120px] truncate text-[13px] font-medium text-slate-200 lg:inline">{profile.displayName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />
      </button>
      {open && (
        <div role="menu" className="glass-strong absolute right-0 top-full z-50 mt-2 w-56 animate-rise-in rounded-xl p-1.5">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-white">{profile.displayName}</p>
            <p className="text-xs text-slate-500">Demo profile (this browser)</p>
          </div>
          <div className="my-1 h-px bg-white/[0.06]" />
          <Link role="menuitem" to="/profile" className={item} onClick={() => setOpen(false)}>
            <User className="h-4 w-4" aria-hidden /> Profile
          </Link>
          <Link role="menuitem" to="/achievements" className={item} onClick={() => setOpen(false)}>
            <Trophy className="h-4 w-4" aria-hidden /> Achievements
          </Link>
          <Link role="menuitem" to="/settings" className={item} onClick={() => setOpen(false)}>
            <Settings className="h-4 w-4" aria-hidden /> Settings
          </Link>
          <Link role="menuitem" to="/admin" className={item} onClick={() => setOpen(false)}>
            <Shield className="h-4 w-4" aria-hidden /> Administration
          </Link>
        </div>
      )}
    </div>
  );
}
