import { useEffect, useMemo } from 'react';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { seededRandom } from '@/lib/random';
import type { QualityPreset } from './quality';

export const FOG_COLOR = '#050913';

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, -1.0, 1.0);
    vec3 horizon = vec3(0.035, 0.05, 0.11);
    vec3 zenith = vec3(0.006, 0.012, 0.03);
    vec3 glow = vec3(0.16, 0.10, 0.32);
    vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.55, h));
    col += glow * pow(1.0 - abs(h), 10.0) * 0.55;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Sky() {
  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: skyVertex, fragmentShader: skyFragment, side: THREE.BackSide, depthWrite: false, fog: false }),
    [],
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

export function Lighting({ preset }: { preset: QualityPreset }) {
  const s = 70;
  return (
    <>
      <hemisphereLight args={['#6c9eff', '#070b14', 0.45]} />
      <ambientLight intensity={0.12} />
      <directionalLight
        position={[40, 70, 30]}
        intensity={1.15}
        color="#a9c8ff"
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
      <pointLight position={[0, 6, 0]} intensity={60} distance={40} color="#38d6ff" decay={2} />
      <pointLight position={[-18, 10, -18]} intensity={40} distance={45} color="#8b7cf6" decay={2} />
      {preset.environment && (
        // Procedural reflection environment rendered once — no HDR download.
        <Environment resolution={128} frames={1} background={false}>
          <color attach="background" args={['#04070e']} />
          <Lightformer form="rect" intensity={2.2} color="#5ce1ff" position={[0, 12, -30]} scale={[60, 6, 1]} />
          <Lightformer form="rect" intensity={1.6} color="#8b7cf6" position={[-30, 8, 10]} rotation-y={Math.PI / 2} scale={[40, 5, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#e0f2fe" position={[30, 20, 10]} rotation-y={-Math.PI / 2} scale={[30, 3, 1]} />
          <Lightformer form="ring" intensity={1.5} color="#38bdf8" position={[0, 40, 0]} rotation-x={Math.PI / 2} scale={20} />
        </Environment>
      )}
    </>
  );
}
