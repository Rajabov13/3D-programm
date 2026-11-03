import { Lock } from 'lucide-react';
import { buildings, PLAZA_RADIUS } from '@/data/buildings';
import { cn } from '@/lib/cn';
import type { BuildingId } from '@/data/buildings';
import type { BuildingInfo } from './useBuildingStatuses';
import { accentInk } from '@/lib/accent';

const EXTENT = 46;
const pct = (v: number) => ((v + EXTENT) / (EXTENT * 2)) * 100;

/** Lightweight 2D city map — fallback for devices without WebGL and for low-power mode. */
export function WorldMap2D({
  infos,
  selectedId,
  onSelect,
  className,
}: {
  infos: Record<BuildingId, BuildingInfo>;
  selectedId: BuildingId | null;
  onSelect: (id: BuildingId) => void;
  className?: string;
}) {
  return (
    <div className={cn('relative mx-auto aspect-square w-full max-w-[min(88vh,820px)]', className)}>
      <svg viewBox={`${-EXTENT} ${-EXTENT} ${EXTENT * 2} ${EXTENT * 2}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="map-glow">
            <stop offset="0" stopColor="#38d6ff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#38d6ff" stopOpacity="0" />
          </radialGradient>
          <pattern id="map-grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M4 0H0V4" fill="none" stroke="#2b6cb0" strokeOpacity="0.18" strokeWidth="0.08" />
          </pattern>
        </defs>
        <rect x={-EXTENT} y={-EXTENT} width={EXTENT * 2} height={EXTENT * 2} fill="url(#map-grid)" />
        <circle r={EXTENT} fill="url(#map-glow)" />
        <circle r="22" fill="none" stroke="#0f1a2b" strokeWidth="4.4" />
        <circle r="22" fill="none" stroke="#38d6ff" strokeOpacity="0.25" strokeWidth="0.15" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={Math.sin(a) * PLAZA_RADIUS}
              y1={-Math.cos(a) * PLAZA_RADIUS}
              x2={Math.sin(a) * 44}
              y2={-Math.cos(a) * 44}
              stroke="#0f1a2b"
              strokeWidth="3.8"
              strokeLinecap="round"
            />
          );
        })}
        <circle r={PLAZA_RADIUS} fill="#0a1424" stroke="#38d6ff" strokeOpacity="0.6" strokeWidth="0.25" />
        <circle r="3.4" fill="#0b1220" stroke="#5ce1ff" strokeWidth="0.3" />
        {buildings.map((b) => (
          <circle key={b.id} cx={b.position[0]} cy={b.position[1]} r={b.radius} fill={`${b.accent}1f`} stroke={b.accent} strokeOpacity="0.7" strokeWidth="0.3" />
        ))}
      </svg>
      {buildings.map((b) => {
        const info = infos[b.id];
        if (!info) return null;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b.id)}
            className={cn(
              'focus-ring absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-center transition-transform hover:scale-105',
              selectedId === b.id && 'bg-white/10',
            )}
            style={{ left: `${pct(b.position[0])}%`, top: `${pct(b.position[1])}%` }}
            aria-pressed={selectedId === b.id}
            aria-label={`${info.name}. ${info.summary}`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg border bg-night-900/90 font-mono text-[11px] font-semibold" style={{ borderColor: b.accent, color: accentInk(b.accent) }}>
              {info.status.locked ? <Lock className="h-4 w-4 text-amber-300" aria-hidden /> : b.symbol}
            </span>
            <span className="max-w-[110px] text-[11px] font-medium leading-tight text-slate-200 drop-shadow">{info.name}</span>
          </button>
        );
      })}
    </div>
  );
}
