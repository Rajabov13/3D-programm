import { useRef, useState } from 'react';
import { touchInput } from '@/three/worldStore';

/** On-screen joystick for touch devices; writes to a non-reactive input channel read each frame. */
export function TouchJoystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pointer = useRef<number | null>(null);
  const R = 44;

  const update = (clientX: number, clientY: number) => {
    const rect = base.current!.getBoundingClientRect();
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > R) {
      dx = (dx / len) * R;
      dy = (dy / len) * R;
    }
    setKnob({ x: dx, y: dy });
    touchInput.moveX = dx / R;
    touchInput.moveY = -dy / R;
  };
  const reset = () => {
    pointer.current = null;
    setKnob({ x: 0, y: 0 });
    touchInput.moveX = 0;
    touchInput.moveY = 0;
  };

  return (
    <div
      ref={base}
      role="application"
      aria-label="Movement joystick"
      className="pointer-events-auto relative h-32 w-32 touch-none select-none rounded-full border border-white/15 bg-night-900/50 backdrop-blur"
      onPointerDown={(e) => {
        e.stopPropagation();
        pointer.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pointer.current === e.pointerId) update(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div className="absolute inset-6 rounded-full border border-white/10" />
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full border border-cyan-200/50 bg-cyan-300/30 shadow-glow"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
