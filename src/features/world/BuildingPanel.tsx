import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Navigation, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import type { Catalog } from '@/types';
import type { BuildingInfo } from './useBuildingStatuses';

export function BuildingPanel({
  info,
  level,
  catalog,
  onClose,
  onTravel,
  travelLabel,
}: {
  info: BuildingInfo;
  level: number;
  catalog?: Catalog;
  onClose: () => void;
  onTravel?: () => void;
  travelLabel?: string;
}) {
  const navigate = useNavigate();
  const { def, course, status } = info;
  const prereqNames = course?.prerequisites.map((id) => catalog?.courses.find((c) => c.id === id)?.title ?? id) ?? [];
  const enterLabel = status.locked ? 'Preview course' : def.kind === 'course' ? `Enter ${def.name}` : `Open ${def.name}`;

  return (
    <section
      aria-labelledby="building-panel-title"
      className="glass-strong pointer-events-auto w-full max-w-sm animate-rise-in rounded-2xl p-5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border font-mono text-sm font-semibold"
            style={{ borderColor: `${def.accent}55`, background: `${def.accent}14`, color: def.accent }}
            aria-hidden
          >
            {def.symbol}
          </span>
          <div>
            <h2 id="building-panel-title" className="text-base leading-tight">
              {def.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">{info.summary}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close panel">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">{course?.description ?? def.description}</p>

      {course && (
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-slate-400">
              <span>Course progress</span>
              <span>
                {info.completed}/{info.total} lessons
              </span>
            </div>
            <ProgressBar value={info.completed ?? 0} max={Math.max(1, info.total ?? 1)} label={`${course.title} progress`} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={status.locked ? 'amber' : 'green'}>
              {status.locked ? <Lock className="h-3 w-3" aria-hidden /> : null}
              {status.locked ? `Requires level ${course.requiredLevel} (you are ${level})` : 'Unlocked'}
            </Badge>
            <Badge>~{course.estimatedHours} h</Badge>
            {prereqNames.length > 0 && <Badge tone="violet">Recommended first: {prereqNames.join(', ')}</Badge>}
          </div>
        </div>
      )}

      {info.unavailable && <p className="mt-3 text-xs text-amber-200">This course hasn’t been published yet. An administrator can publish it from the admin area.</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => navigate(def.route)} disabled={info.unavailable} icon={<ArrowRight className="h-4 w-4" />}>
          {enterLabel}
        </Button>
        {onTravel && (
          <Button variant="secondary" onClick={onTravel} icon={<Navigation className="h-4 w-4" />}>
            {travelLabel ?? 'Travel here'}
          </Button>
        )}
      </div>
    </section>
  );
}
