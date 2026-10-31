import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLAZA_RADIUS } from '@/data/buildings';

const vertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

// Single-draw-call ground: base, two grid scales, plaza rings, ring road and
// radial avenues to every building, with distance fog matching the scene.
const fragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uAccent;
  uniform vec3 uRoad;
  uniform float uTime;
  uniform float uPlaza;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3 vWorld;

  float gridLine(vec2 p, float size, float width) {
    vec2 q = p / size;
    vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    return 1.0 - min(min(g.x, g.y) / width, 1.0);
  }

  void main() {
    vec2 p = vWorld.xz;
    float r = length(p);
    vec3 col = uBase;

    float fine = gridLine(p, 2.0, 1.0) * 0.18;
    float coarse = gridLine(p, 10.0, 1.4) * 0.45;
    float gridFade = smoothstep(150.0, 30.0, r);
    col += uLine * (fine + coarse) * gridFade;

    // Plaza disc with concentric rings.
    float plaza = 1.0 - smoothstep(uPlaza - 0.2, uPlaza + 0.2, r);
    col = mix(col, uBase * 1.6 + vec3(0.01, 0.02, 0.035), plaza * 0.8);
    float ring1 = 1.0 - smoothstep(0.0, 0.12, abs(r - uPlaza));
    float ring2 = 1.0 - smoothstep(0.0, 0.07, abs(r - uPlaza * 0.62));
    float pulse = 0.6 + 0.4 * sin(uTime * 1.2 - r * 0.4);
    col += uAccent * (ring1 * 1.3 + ring2 * 0.7 * pulse);

    // Roads: ring road + 8 avenues (angles measured from north, every 45 deg).
    float ringRoad = 1.0 - smoothstep(2.2, 2.5, abs(r - 22.0));
    float a = atan(p.x, -p.y);
    float snapped = floor(a / 0.785398 + 0.5) * 0.785398;
    float dist = abs(r * sin(a - snapped));
    float avenue = (1.0 - smoothstep(1.8, 2.1, dist)) * step(uPlaza, r) * (1.0 - smoothstep(44.0, 48.0, r));
    float road = max(ringRoad, avenue);
    col = mix(col, uRoad, road * 0.92);
    float edge = (1.0 - smoothstep(0.0, 0.08, abs(dist - 1.95))) * avenue + (1.0 - smoothstep(0.0, 0.08, abs(abs(r - 22.0) - 2.35)));
    col += uAccent * edge * 0.55;
    float dash = (1.0 - smoothstep(0.03, 0.08, dist)) * step(0.5, fract(r / 3.0)) * avenue;
    col += vec3(0.55, 0.62, 0.7) * dash * 0.35;

    float fogFactor = smoothstep(uFogNear, uFogFar, length(vWorld - cameraPosition));
    gl_FragColor = vec4(mix(col, uFogColor, fogFactor), 1.0);
    #include <colorspace_fragment>
  }
`;

export function Ground({ fogColor, fogNear, fogFar, animate }: { fogColor: string; fogNear: number; fogFar: number; animate: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uBase: { value: new THREE.Color('#05090f') },
          uLine: { value: new THREE.Color('#2b6cb0') },
          uAccent: { value: new THREE.Color('#38d6ff') },
          uRoad: { value: new THREE.Color('#080c14') },
          uTime: { value: 0 },
          uPlaza: { value: PLAZA_RADIUS },
          uFogColor: { value: new THREE.Color(fogColor) },
          uFogNear: { value: fogNear },
          uFogFar: { value: fogFar },
        },
      }),
    [fogColor, fogNear, fogFar],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, dt) => {
    if (animate) material.uniforms.uTime.value += dt;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow material={material}>
      <planeGeometry args={[420, 420, 1, 1]} />
    </mesh>
  );
}

/** Invisible plane that receives shadows (the shader ground ignores lighting). */
export function ShadowCatcher() {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.01} receiveShadow>
      <planeGeometry args={[160, 160]} />
      <shadowMaterial transparent opacity={0.45} />
    </mesh>
  );
}
