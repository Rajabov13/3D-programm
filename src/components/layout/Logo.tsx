import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-8 w-8 text-white', className)} aria-hidden>
      <defs>
        <linearGradient id="cw-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'rgb(var(--c-primary))' }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--c-primary-hover))' }} />
        </linearGradient>
      </defs>
      <path d="M32 6 56 19.5v25L32 58 8 44.5v-25Z" fill="url(#cw-logo)" fillOpacity="0.1" stroke="url(#cw-logo)" strokeWidth="3" strokeLinejoin="round" />
      <path d="m26 25-7 7 7 7M38 25l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, to = '/' }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn('focus-ring group flex items-center gap-2.5 rounded-lg', className)} aria-label="3D Code World">
      <LogoMark className="transition-transform duration-300 group-hover:rotate-[30deg]" />
      <span className="hidden whitespace-nowrap text-[15px] font-semibold tracking-tight text-white sm:inline">
        3D Code <span className="text-gradient">World</span>
      </span>
    </Link>
  );
}
