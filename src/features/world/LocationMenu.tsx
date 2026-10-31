import { Lock } from 'lucide-react';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import type { BuildingId } from '@/data/buildings';
import type { BuildingInfo } from './useBuildingStatuses';

/** Menu-based navigation: every location is reachable without using the 3D controls. */
export function LocationMenu({
  infos,
  order,
  selectedId,
  onSelect,
  className,
}: {
  infos: Record<BuildingId, BuildingInfo>;
  order: BuildingId[];
  selectedId: BuildingId | null;
  onSelect: (id: BuildingId) => void;
  className?: string;
}) {
  const t = useT();
  return (
    <nav aria-label={t('world.places')} className={className}>
      <ol className="space-y-1">
        {order.map((id, index) => {
          const info = infos[id];
          if (!info) return null;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={selectedId === id ? 'location' : undefined}
                className={cn(
                  'focus-ring group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                  selectedId === id ? 'bg-white/[0.1]' : 'hover:bg-white/[0.06]',
                )}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: info.def.accent, boxShadow: `0 0 10px ${info.def.accent}` }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-slate-100">{info.name}</span>
                  <span className="block truncate text-[11px] text-slate-500">{info.summary}</span>
                </span>
                {info.status.locked && <Lock className="h-3.5 w-3.5 shrink-0 text-amber-300/80" aria-label={t('common.locked')} />}
                <kbd className="kbd hidden opacity-60 group-hover:opacity-100 md:inline-flex">{index + 1}</kbd>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
