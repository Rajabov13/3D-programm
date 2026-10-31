import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Single-series column chart (magnitude over time). One hue (validated against the
 * dark surface), ≤24px bars with 4px rounded data-ends on a single baseline, a 2px
 * surface gap, hairline gridlines, per-bar hover/focus tooltip and a table view.
 */
export function BarChart({
  data,
  label,
  valueLabel,
  formatDay = (d) => d.slice(5),
}: {
  data: Array<{ key: string; value: number }>;
  label: string;
  valueLabel: string;
  formatDay?: (day: string) => string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const id = useId();
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = Math.ceil(max / 5) * 5 || 5;
  const ticks = [0, niceMax / 2, niceMax];
  const height = 160;

  return (
    <figure aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="sr-only">
        {label}
      </figcaption>
      <div className="flex justify-end">
        <button type="button" onClick={() => setShowTable((v) => !v)} className="focus-ring rounded-md px-2 py-1 text-[11px] text-slate-400 hover:text-white" aria-pressed={showTable}>
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>
      {showTable ? (
        <table className="mt-2 w-full text-left text-sm">
          <caption className="sr-only">{label}</caption>
          <thead className="text-xs text-slate-500">
            <tr>
              <th scope="col" className="py-1.5 font-medium">Day</th>
              <th scope="col" className="py-1.5 text-right font-medium">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key} className="border-t border-white/[0.05]">
                <td className="py-1.5 text-slate-300">{d.key}</td>
                <td className="py-1.5 text-right text-slate-100">{d.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative mt-2 flex gap-2">
          <div className="flex flex-col justify-between text-right text-[10px] text-slate-500" style={{ height }} aria-hidden>
            {[...ticks].reverse().map((t) => (
              <span key={t} className="leading-none">
                {t}
              </span>
            ))}
          </div>
          <div className="relative flex-1">
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 h-px bg-white/[0.06]" style={{ bottom: (t / niceMax) * height }} aria-hidden />
            ))}
            <ul className="relative flex items-end gap-[2px]" style={{ height }} role="list" aria-label={label}>
              {data.map((d, i) => (
                <li key={d.key} className="relative flex h-full flex-1 items-end justify-center">
                  <button
                    type="button"
                    className="focus-ring group flex h-full w-full items-end justify-center"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${d.key}: ${d.value} ${valueLabel}`}
                  >
                    <span
                      className={cn('w-full max-w-[24px] rounded-t-[4px] transition-opacity', active !== null && active !== i && 'opacity-50')}
                      style={{ height: Math.max(d.value > 0 ? 2 : 0, (d.value / niceMax) * height), background: '#1993c4' }}
                    />
                  </button>
                  {active === i && (
                    <div className="glass-strong pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs">
                      <p className="text-slate-400">{d.key}</p>
                      <p className="font-semibold text-white">
                        {d.value.toLocaleString()} {valueLabel}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-1.5 flex justify-between text-[10px] text-slate-500" aria-hidden>
              <span>{data[0] && formatDay(data[0].key)}</span>
              <span>{data.length > 1 && formatDay(data[data.length - 1].key)}</span>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}
