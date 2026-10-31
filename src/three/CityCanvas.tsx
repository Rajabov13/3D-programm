import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import type { QualityPreset } from './quality';

/**
 * WebGL canvas with adaptive pixel ratio, tone mapping and context-loss handling.
 * Children render inside Suspense (fonts load lazily).
 */
export function CityCanvas({
  preset,
  fov = 60,
  className,
  onContextLost,
  children,
  eventSource,
  label,
}: {
  preset: QualityPreset;
  fov?: number;
  className?: string;
  onContextLost?: () => void;
  children: ReactNode;
  eventSource?: React.MutableRefObject<HTMLElement>;
  label: string;
}) {
  const maxDpr = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, preset.maxDpr);
  const [dpr, setDpr] = useState(maxDpr);
  const lostHandler = useRef(onContextLost);
  lostHandler.current = onContextLost;
  useEffect(() => setDpr(maxDpr), [maxDpr]);

  return (
    <Canvas
      className={className}
      aria-label={label}
      role="img"
      dpr={dpr}
      shadows={preset.shadows ? 'soft' : false}
      eventSource={eventSource}
      gl={{ antialias: preset.antialias, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov, near: 0.1, far: 900, position: [24, 46, 54] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        gl.domElement.addEventListener(
          'webglcontextlost',
          (event) => {
            event.preventDefault();
            lostHandler.current?.();
          },
          { once: true },
        );
      }}
    >
      <PerformanceMonitor
        flipflops={4}
        onDecline={() => setDpr((d) => Math.max(0.75, Math.round((d - 0.25) * 100) / 100))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, Math.round((d + 0.25) * 100) / 100))}
        onFallback={() => setDpr(0.75)}
      />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
