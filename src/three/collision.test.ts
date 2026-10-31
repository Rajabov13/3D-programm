import { describe, expect, it } from 'vitest';
import { nearestWithin, resolveCollisions } from './collision';

describe('resolveCollisions', () => {
  const colliders = [{ x: 0, z: 0, r: 5 }];
  it('leaves free positions untouched', () => {
    expect(resolveCollisions(10, 0, 0.5, colliders, 50)).toEqual([10, 0]);
  });
  it('pushes the player out of a building', () => {
    const [x, z] = resolveCollisions(3, 0, 0.5, colliders, 50);
    expect(x).toBeCloseTo(5.5);
    expect(z).toBeCloseTo(0);
  });
  it('keeps the player inside the world boundary', () => {
    const [x, z] = resolveCollisions(100, 0, 0.5, [], 50);
    expect(Math.hypot(x, z)).toBeCloseTo(49.5);
  });
  it('handles a player exactly at a collider centre', () => {
    const [x, z] = resolveCollisions(0, 0, 0.5, colliders, 50);
    expect(Math.hypot(x, z)).toBeCloseTo(5.5);
  });
});

describe('nearestWithin', () => {
  it('finds the closest building within reach', () => {
    const colliders = [{ x: 0, z: 0, r: 5 }, { x: 20, z: 0, r: 5 }];
    expect(nearestWithin(8, 0, colliders, 4)).toBe(0);
    expect(nearestWithin(13, 0, colliders, 4)).toBe(1);
    expect(nearestWithin(10, 30, colliders, 4)).toBe(-1);
  });
});
