import { CircleCheck, CircleDashed, CircleX } from 'lucide-react';
import type { CheckResult, CheckSpec } from '@shared/checks';
import { cn } from '@/lib/cn';

export function ChecksList({ checks, results }: { checks: CheckSpec[]; results?: CheckResult[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((check) => {
        const result = results?.find((r) => r.id === check.id);
        const status = result?.status;
        const Icon = status === 'pass' ? CircleCheck : status === 'fail' ? CircleX : CircleDashed;
        return (
          <li key={check.id} className="flex gap-2.5 text-[13px]">
            <Icon
              className={cn('mt-0.5 h-4 w-4 shrink-0', status === 'pass' ? 'text-emerald-300' : status === 'fail' ? 'text-rose-300' : 'text-slate-500')}
              aria-label={status === 'pass' ? 'Passed' : status === 'fail' ? 'Failed' : 'Not checked yet'}
            />
            <div className="min-w-0">
              <p className={cn(status === 'pass' ? 'text-slate-300' : 'text-slate-200')}>{check.label}</p>
              {result?.message && status !== 'pass' && <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-400">{result.message}</pre>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
