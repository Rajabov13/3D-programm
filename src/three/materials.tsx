import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { createWindowTexture } from './textures';
import type { QualityPreset } from './quality';
import type { ScenePalette } from './scenePalette';

export interface CityMaterials {
  facade: THREE.MeshStandardMaterial;
  facadeAlt: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  skyline: THREE.MeshStandardMaterial;
  textures: THREE.Texture[];
}

const MaterialsContext = createContext<CityMaterials | null>(null);

function makeFacade(texture: THREE.Texture, preset: QualityPreset, tint: string, emissive: number) {
  const params = {
    color: new THREE.Color(tint),
    map: texture,
    emissive: new THREE.Color('#ffffff'),
    emissiveMap: texture,
    emissiveIntensity: emissive,
    metalness: 0.55,
    roughness: 0.32,
    envMapIntensity: 0.9,
  };
  return preset.physicalMaterials ? new THREE.MeshPhysicalMaterial({ ...params, clearcoat: 0.6, clearcoatRoughness: 0.2 }) : new THREE.MeshStandardMaterial(params);
}

/** Shared materials for the whole city — created once per quality preset and disposed on change/unmount. */
export function CityMaterialsProvider({ preset, palette, children }: { preset: QualityPreset; palette: ScenePalette; children: ReactNode }) {
  const materials = useMemo<CityMaterials>(() => {
    const facadeTex = createWindowTexture(11, 8, 32, palette.windows);
    facadeTex.repeat.set(2, 2);
    const facadeAltTex = createWindowTexture(23, 6, 24, palette.windows);
    facadeAltTex.repeat.set(2, 1.5);
    const skylineTex = createWindowTexture(5, 6, 30, palette.windows);
    skylineTex.repeat.set(1, 1);
    const glassParams = { color: new THREE.Color(palette.glass), metalness: 0.95, roughness: 0.08, envMapIntensity: 1.4, transparent: true, opacity: 0.9 };
    const glass = preset.physicalMaterials
      ? new THREE.MeshPhysicalMaterial({ ...glassParams, clearcoat: 1, clearcoatRoughness: 0.05 })
      : new THREE.MeshStandardMaterial(glassParams);
    return {
      facade: makeFacade(facadeTex, preset, palette.facade.tint, palette.facade.emissive),
      facadeAlt: makeFacade(facadeAltTex, preset, palette.facade.altTint, palette.facade.emissive),
      glass,
      metal: new THREE.MeshStandardMaterial({ color: palette.metal, metalness: 0.7, roughness: 0.38, envMapIntensity: 1.1 }),
      dark: new THREE.MeshStandardMaterial({ color: palette.dark, metalness: 0.6, roughness: 0.55 }),
      skyline: new THREE.MeshStandardMaterial({
        color: palette.day ? '#ffffff' : '#7d8aa6',
        map: skylineTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveMap: skylineTex,
        emissiveIntensity: palette.skyline.emissive,
        metalness: 0.4,
        roughness: 0.5,
      }),
      textures: [facadeTex, facadeAltTex, skylineTex],
    };
  }, [preset, palette]);

  useEffect(
    () => () => {
      for (const value of Object.values(materials)) {
        if (value instanceof THREE.Material) value.dispose();
      }
      materials.textures.forEach((t) => t.dispose());
    },
    [materials],
  );

  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>;
}

export function useCityMaterials(): CityMaterials {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error('useCityMaterials must be used inside <CityMaterialsProvider>');
  return ctx;
}

/** Emissive accent material in a building's colour (memoized + disposed). */
export function useAccentMaterial(color: string, intensity = 1.4, opacity = 1) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).multiplyScalar(0.3),
        emissive: new THREE.Color(color),
        emissiveIntensity: intensity,
        transparent: opacity < 1,
        opacity,
      }),
    [color, intensity, opacity],
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/** Single-sided base material for sign text so signs never read mirrored from behind. */
export function useSignTextMaterial() {
  const material = useMemo(() => new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true, toneMapped: false }), []);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/** Dark translucent plate placed behind holographic text for legibility. */
export function useBackingMaterial() {
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#02060d', transparent: true, opacity: 0.72, depthWrite: false, side: THREE.FrontSide }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

export function useGlowMaterial(color: string, opacity = 0.35, side: THREE.Side = THREE.DoubleSide) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side,
      }),
    [color, opacity, side],
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}
