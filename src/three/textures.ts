import * as THREE from 'three';
import { seededRandom } from '@/lib/random';

/**
 * Procedural facade texture (lit/unlit windows) generated on a canvas —
 * no image downloads, ~64 KB of GPU memory.
 */
export function createWindowTexture(seed = 7, cols = 8, rows = 32): THREE.CanvasTexture {
  const w = 128;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const rand = seededRandom(seed);
  ctx.fillStyle = '#05080f';
  ctx.fillRect(0, 0, w, h);
  const cw = w / cols;
  const ch = h / rows;
  const lit = ['#a5e9ff', '#dff6ff', '#c4b5fd', '#7dd3fc'];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const on = rand() < 0.32;
      const color = on ? lit[Math.floor(rand() * lit.length)] : rand() < 0.5 ? '#0b1626' : '#0e1b2e';
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
