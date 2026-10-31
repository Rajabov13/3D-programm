import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/** Slow cinematic orbit for the landing page, gently following the pointer. */
export function HeroCamera({ animate }: { animate: boolean }) {
  const target = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const time = useRef(0.9);

  useEffect(() => {
    if (!animate) return;
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [animate]);

  useFrame(({ camera }, dt) => {
    if (animate) time.current += dt * 0.035;
    const s = smooth.current;
    s.x += (target.current.x - s.x) * Math.min(1, dt * 1.8);
    s.y += (target.current.y - s.y) * Math.min(1, dt * 1.8);
    const r = 60;
    const t = time.current;
    camera.position.set(Math.sin(t) * r + s.x * 5, 22 - s.y * 3, Math.cos(t) * r);
    camera.lookAt(s.x * 4, 9 - s.y * 2, 0);
  });
  return null;
}
