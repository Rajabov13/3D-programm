import * as THREE from 'three';
import { seededRandom } from '@/lib/random';
import type { ScenePalette } from './scenePalette';

/**
 * Procedural facade texture (lit/unlit windows) generated on a canvas —
 * no image downloads, ~64 KB of GPU memory.
 */
export function createWindowTexture(seed: number, cols: number, rows: number, scheme: ScenePalette['windows']): THREE.CanvasTexture {
  const w = 128;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const rand = seededRandom(seed);
  ctx.fillStyle = scheme.base;
  ctx.fillRect(0, 0, w, h);
  const cw = w / cols;
  const ch = h / rows;
  const lit = scheme.lit;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const on = rand() < scheme.litChance;
      const color = on ? lit[Math.floor(rand() * lit.length)] : scheme.off[Math.floor(rand() * scheme.off.length)];
      ctx.globalAlpha = on ? 0.55 + rand() * 0.45 : 1;
      ctx.fillStyle = color;
      ctx.fillRect(x * cw + 2, y * ch + 3, cw - 4, ch - 5);
    }
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
