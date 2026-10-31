import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from '@/lib/storage';
import { cn } from '@/lib/cn';

/** Two resizable panes with a pointer- and keyboard-accessible separator. */
export function SplitPane({
  first,
  second,
  direction = 'horizontal',
  initial = 0.5,
  min = 0.2,
  max = 0.8,
  storageKey,
  label,
  className,
}: {
  first: ReactNode;
  second: ReactNode;
  direction?: 'horizontal' | 'vertical';
  initial?: number;
  min?: number;
  max?: number;
  storageKey?: string;
  label: string;
  className?: string;
}) {
  const [ratio, setRatio] = useState(() => (storageKey ? readJSON<number>(`cw.split.${storageKey}`, initial) : initial));
  const [dragging, setDragging] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const horizontal = direction === 'horizontal';

  const clamp = useCallback((v: number) => Math.min(max, Math.max(min, v)), [min, max]);

  useEffect(() => {
    if (storageKey) writeJSON(`cw.split.${storageKey}`, ratio);
  }, [ratio, storageKey]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !container.current) return;
    const rect = container.current.getBoundingClientRect();
    const next = horizontal ? (e.clientX - rect.left) / rect.width : (e.clientY - rect.top) / rect.height;
    setRatio(clamp(next));
  };

  return (
    <div ref={container} className={cn('relative flex h-full w-full min-h-0 min-w-0', horizontal ? 'flex-row' : 'flex-col', className)}>
      <div className="min-h-0 min-w-0 overflow-hidden" style={{ flexBasis: `${ratio * 100}%`, flexGrow: 0, flexShrink: 0 }}>
        {first}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuemin={Math.round(min * 100)}
        aria-valuemax={Math.round(max * 100)}
        aria-valuenow={Math.round(ratio * 100)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={() => setRatio(initial)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 0.1 : 0.02;
          if ((horizontal && e.key === 'ArrowLeft') || (!horizontal && e.key === 'ArrowUp')) setRatio((r) => clamp(r - step));
          else if ((horizontal && e.key === 'ArrowRight') || (!horizontal && e.key === 'ArrowDown')) setRatio((r) => clamp(r + step));
          else if (e.key === 'Home') setRatio(min);
          else if (e.key === 'End') setRatio(max);
          else return;
          e.preventDefault();
        }}
        className={cn(
          'group relative z-10 flex shrink-0 items-center justify-center bg-white/[0.04] outline-none transition-colors hover:bg-cyan-300/30 focus-visible:bg-cyan-300/50',
          horizontal ? 'w-1.5 cursor-col-resize' : 'h-1.5 cursor-row-resize',
          dragging && 'bg-cyan-300/50',
        )}
      >
        <span className={cn('rounded-full bg-white/20 group-hover:bg-cyan-200', horizontal ? 'h-8 w-0.5' : 'h-0.5 w-8')} />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{second}</div>
      {/* Keeps pointer events flowing while dragging over iframes. */}
      {dragging && <div className={cn('fixed inset-0 z-50', horizontal ? 'cursor-col-resize' : 'cursor-row-resize')} onPointerMove={onPointerMove} onPointerUp={() => setDragging(false)} />}
    </div>
  );
}
