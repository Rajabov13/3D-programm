import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { useToasts } from './ui/toast';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info, warning: TriangleAlert };
const TONES = {
  success: 'text-emerald-300',
  error: 'text-rose-300',
  info: 'text-cyan-300',
  warning: 'text-amber-300',
};

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  const tr = useT();
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div key={t.id} role={t.tone === 'error' ? 'alert' : 'status'} className="glass-strong pointer-events-auto flex animate-rise-in gap-3 rounded-xl p-3.5">
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', TONES[t.tone])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] leading-snug text-slate-400">{t.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="focus-ring h-6 w-6 rounded-md text-slate-500 hover:text-white" aria-label={tr('common.dismiss')}>
              <X className="mx-auto h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
