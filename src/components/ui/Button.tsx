import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-ring disabled:pointer-events-none disabled:opacity-45 active:translate-y-px';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-cyan-300 to-sky-500 text-night-950 shadow-[0_0_0_1px_rgba(92,225,255,0.35),0_10px_30px_-10px_rgba(56,189,248,0.7)] hover:from-cyan-200 hover:to-sky-400',
  secondary: 'border border-white/10 bg-white/[0.06] text-slate-100 hover:border-white/20 hover:bg-white/[0.1]',
  outline: 'border border-cyan-300/30 bg-cyan-300/[0.04] text-cyan-100 hover:border-cyan-300/60 hover:bg-cyan-300/[0.1]',
  ghost: 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
  danger: 'border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
  icon: 'h-9 w-9 p-0',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
