import type { ReactNode } from 'react';
import { CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/errors';
import { Button } from './Button';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-slate-400', className)}>
      <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-cyan-300/80 border-t-transparent" />
        </div>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  headingLevel: Heading = 'h2',
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Use 'h1' when the empty state is the whole page. */
  headingLevel?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center', className)}>
      {icon && <div className="mb-3 text-slate-500">{icon}</div>}
      <Heading className="text-base text-white">{title}</Heading>
      {description && <p className="mt-1.5 max-w-md text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, title = 'Something went wrong', onRetry, className }: { error?: unknown; title?: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] px-6 py-10 text-center', className)}>
      <CircleAlert className="mb-3 h-7 w-7 text-rose-300" aria-hidden />
      <h3 className="text-base text-white">{title}</h3>
      {error !== undefined && <p className="mt-1.5 max-w-lg text-sm text-rose-100/80">{errorMessage(error)}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry} icon={<RefreshCw className="h-3.5 w-3.5" />}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('relative overflow-hidden rounded-xl bg-white/[0.05]', className)} aria-hidden />;
}

export function InlineAlert({ tone = 'info', title, children, className, icon }: { tone?: 'info' | 'warning' | 'error' | 'success'; title?: string; children?: ReactNode; className?: string; icon?: ReactNode }) {
  const styles = {
    info: 'border-sky-300/20 bg-sky-400/[0.06] text-sky-100',
    warning: 'border-amber-300/25 bg-amber-400/[0.07] text-amber-100',
    error: 'border-rose-300/25 bg-rose-500/[0.08] text-rose-100',
    success: 'border-emerald-300/25 bg-emerald-400/[0.07] text-emerald-100',
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', styles, className)}>
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div className="min-w-0">
        {title && <p className="font-medium text-white">{title}</p>}
        {children && <div className={cn('leading-relaxed opacity-90', title && 'mt-0.5')}>{children}</div>}
      </div>
    </div>
  );
}
