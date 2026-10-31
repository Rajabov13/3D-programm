import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Panel({ className, strong, ...rest }: HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return <div className={cn(strong ? 'glass-strong' : 'glass', 'rounded-2xl', className)} {...rest} />;
}

export function PanelHeader({
  title,
  eyebrow,
  action,
  className,
  as: Heading = 'h2',
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <Heading className="truncate text-base text-white">{title}</Heading>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl animate-rise-in">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
