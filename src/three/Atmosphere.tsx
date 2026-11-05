import { useEffect, useMemo } from 'react';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { seededRandom } from '@/lib/random';
import type { QualityPreset } from './quality';
import type { ScenePalette } from './scenePalette';

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  uniform vec3 horizon;
  uniform vec3 zenith;
  uniform vec3 glow;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, -1.0, 1.0);
    vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.55, h));
    col += glow * pow(1.0 - abs(h), 10.0) * 0.55;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Sky({ palette }: { palette: ScenePalette }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          horizon: { value: new THREE.Vector3(...palette.sky.horizon) },
          zenith: { value: new THREE.Vector3(...palette.sky.zenith) },
          glow: { value: new THREE.Vector3(...palette.sky.glow) },
        },
      }),
    [palette],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
}

export function Stars({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const rand = seededRandom(99);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(rand() * 0.92 + 0.08); // upper hemisphere
      const r = 360;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);
  const material = useMemo(
    () => new THREE.PointsMaterial({ color: '#cfe8ff', size: 1.3, sizeAttenuation: false, transparent: true, opacity: 0.75, fog: false, depthWrite: false }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return <points geometry={geometry} material={material} />;
}

export function Lighting({ preset, palette }: { preset: QualityPreset; palette: ScenePalette }) {
  const s = 70;
  const env = palette.environment.lights;
  return (
    <>
      <hemisphereLight args={[palette.hemisphere.sky, palette.hemisphere.ground, palette.hemisphere.intensity]} />
      <ambientLight intensity={palette.ambient} />
      <directionalLight
        position={[40, 70, 30]}
        intensity={palette.sun.intensity}
        color={palette.sun.color}
        castShadow={preset.shadows}
        shadow-mapSize={[preset.shadowMapSize, preset.shadowMapSize]}
        shadow-camera-left={-s}
        shadow-camera-right={s}
        shadow-camera-top={s}
        shadow-camera-bottom={-s}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      <pointLight position={[0, 6, 0]} intensity={60 * palette.neon} distance={40} color={palette.lights.primary} decay={2} />
      <pointLight position={[-18, 10, -18]} intensity={40 * palette.neon} distance={45} color={palette.lights.secondary} decay={2} />
      {preset.environment && (
        // Procedural reflection environment rendered once — no HDR download. Re-rendered when day ↔ night.
        <Environment key={palette.day ? 'day' : 'night'} resolution={128} frames={1} background={false}>
          <color attach="background" args={[palette.environment.background]} />
          <Lightformer form="rect" intensity={env[0][1]} color={env[0][0]} position={[0, 12, -30]} scale={[60, 6, 1]} />
          <Lightformer form="rect" intensity={env[1][1]} color={env[1][0]} position={[-30, 8, 10]} rotation-y={Math.PI / 2} scale={[40, 5, 1]} />
          <Lightformer form="rect" intensity={env[2][1]} color={env[2][0]} position={[30, 20, 10]} rotation-y={-Math.PI / 2} scale={[30, 3, 1]} />
          <Lightformer form="ring" intensity={env[3][1]} color={env[3][0]} position={[0, 40, 0]} rotation-x={Math.PI / 2} scale={20} />
        </Environment>
      )}
    </>
  );
}
