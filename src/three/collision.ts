/** Pure 2D (ground-plane) collision helpers for the walkable city. */
export interface Collider {
  x: number;
  z: number;
  r: number;
}

/** Pushes a circle of `radius` out of every collider and keeps it inside the world boundary. */
export function resolveCollisions(x: number, z: number, radius: number, colliders: readonly Collider[], worldRadius: number): [number, number] {
  let px = x;
  let pz = z;
  for (let iteration = 0; iteration < 3; iteration++) {
    let moved = false;
    for (const c of colliders) {
      const dx = px - c.x;
      const dz = pz - c.z;
      const min = c.r + radius;
      const distSq = dx * dx + dz * dz;
      if (distSq < min * min) {
        const d = Math.sqrt(distSq) || 1e-6;
        const nx = d > 1e-6 ? dx / d : 1;
        const nz = d > 1e-6 ? dz / d : 0;
        px = c.x + nx * min;
        pz = c.z + nz * min;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const limit = worldRadius - radius;
  const r = Math.hypot(px, pz);
  if (r > limit) {
    px = (px / r) * limit;
    pz = (pz / r) * limit;
  }
  return [px, pz];
}

/** Index of the nearest collider whose edge is within `reach`, or -1. */
export function nearestWithin(x: number, z: number, colliders: readonly Collider[], reach: number): number {
  let best = -1;
  let bestGap = Infinity;
  colliders.forEach((c, i) => {
    const gap = Math.hypot(x - c.x, z - c.z) - c.r;
    if (gap < reach && gap < bestGap) {
      best = i;
      bestGap = gap;
    }
  });
  return best;
}
