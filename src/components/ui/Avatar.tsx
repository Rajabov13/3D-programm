import { avatarPreset } from '@/features/profile/avatars';
import { cn } from '@/lib/cn';
import { NamedIcon } from './Icon';

export function Avatar({ preset, size = 36, className, label }: { preset?: string; size?: number; className?: string; label?: string }) {
  const p = avatarPreset(preset);
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('inline-grid shrink-0 place-items-center rounded-full ring-1 ring-white/15', className)}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
    >
      <NamedIcon name={p.icon} size={Math.round(size * 0.48)} className="text-white/90 drop-shadow" />
    </span>
  );
}
