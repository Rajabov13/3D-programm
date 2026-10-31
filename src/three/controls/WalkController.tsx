import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildingById, buildings, entrancePoint, SPAWN, WORLD_RADIUS } from '@/data/buildings';
import type { BuildingId } from '@/data/buildings';
import { nearestWithin, resolveCollisions, type Collider } from '../collision';
import { PLAZA_CORE_RADIUS } from '../PlazaCore';
import { touchInput, useWorld } from '../worldStore';

const EYE_HEIGHT = 1.75;
const PLAYER_RADIUS = 0.6;
const WALK_SPEED = 7;
const RUN_SPEED = 14;
const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight']);

/** Remembers where the walker stood when switching back to overview. */
const lastPose = { x: SPAWN.position[0], z: SPAWN.position[1], yaw: SPAWN.yaw, pitch: -0.08 };

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
}

function lerpAngle(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Travel {
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
  fromYaw: number;
  toYaw: number;
  t: number;
  duration: number;
}

export function WalkController({
  reducedMotion,
  sensitivity,
  invertY,
  targets,
}: {
  reducedMotion: boolean;
  sensitivity: number;
  invertY: boolean;
  targets: React.MutableRefObject<Map<BuildingId, THREE.Object3D>>;
}) {
  const { camera, gl } = useThree();
  const position = useRef(new THREE.Vector3(lastPose.x, EYE_HEIGHT, lastPose.z));
  const yaw = useRef(lastPose.yaw);
  const pitch = useRef(lastPose.pitch);
  const velocity = useRef(new THREE.Vector2());
  const keys = useRef(new Set<string>());
  const travel = useRef<Travel | null>(null);
  const frame = useRef(0);
  const raycaster = useMemo(() => new THREE.Raycaster(undefined, undefined, 0.1, 90), []);
  const center = useMemo(() => new THREE.Vector2(0, 0), []);
  const cameraNonce = useWorld((s) => s.cameraNonce);

  const colliders = useMemo<Array<Collider & { id?: BuildingId }>>(
    () => [...buildings.map((b) => ({ id: b.id, x: b.position[0], z: b.position[1], r: b.radius })), { x: 0, z: 0, r: PLAZA_CORE_RADIUS + 0.3 }],
    [],
  );
  const buildingColliders = useMemo(() => colliders.filter((c) => c.id), [colliders]);

  // Keyboard movement.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (MOVE_KEYS.has(e.code)) {
        keys.current.add(e.code);
        if (e.code.startsWith('Arrow')) e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, []);

  // Mouse look: pointer-lock, or click-and-drag (mouse/touch) when not locked.
  useEffect(() => {
    const el = gl.domElement;
    const setLocked = useWorld.getState().setPointerLocked;
    const clampPitch = () => {
      pitch.current = Math.max(-1.3, Math.min(1.3, pitch.current));
    };
    const onLockChange = () => setLocked(document.pointerLockElement === el);
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== el || travel.current) return;
      yaw.current -= e.movementX * 0.0022 * sensitivity;
      pitch.current -= e.movementY * 0.0022 * sensitivity * (invertY ? -1 : 1);
      clampPitch();
    };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let activePointer = -1;
    const onDown = (e: PointerEvent) => {
      if (document.pointerLockElement === el) return;
      dragging = true;
      activePointer = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointer || travel.current) return;
      const factor = (e.pointerType === 'touch' ? 0.006 : 0.004) * sensitivity;
      yaw.current += (e.clientX - lastX) * factor;
      pitch.current += (e.clientY - lastY) * factor * (invertY ? -1 : 1);
      clampPitch();
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId === activePointer) dragging = false;
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      if (document.pointerLockElement === el) document.exitPointerLock();
      setLocked(false);
    };
  }, [gl, sensitivity, invertY]);

  // Travel requests (location menu, keyboard shortcuts).
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const id = useWorld.getState().travelId;
    const b = buildingById(id ?? undefined);
    let toX = SPAWN.position[0];
    let toZ = SPAWN.position[1];
    let toYaw = SPAWN.yaw;
    if (b) {
      [toX, toZ] = entrancePoint(b, 4.5);
      toYaw = Math.atan2(-(b.position[0] - toX), -(b.position[1] - toZ));
    }
    travel.current = {
      fromX: position.current.x,
      fromZ: position.current.z,
      toX,
      toZ,
      fromYaw: yaw.current,
      toYaw,
      t: 0,
      duration: reducedMotion ? 0.0001 : Math.min(2.2, 0.6 + Math.hypot(toX - position.current.x, toZ - position.current.z) / 30),
    };
  }, [cameraNonce, reducedMotion]);

  useEffect(
    () => () => {
      lastPose.x = position.current.x;
      lastPose.z = position.current.z;
      lastPose.yaw = yaw.current;
      lastPose.pitch = pitch.current;
    },
    [],
  );

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const pos = position.current;
    const tr = travel.current;
    if (tr) {
      tr.t = Math.min(1, tr.t + dt / tr.duration);
      const k = easeInOut(tr.t);
      pos.x = tr.fromX + (tr.toX - tr.fromX) * k;
      pos.z = tr.fromZ + (tr.toZ - tr.fromZ) * k;
      yaw.current = lerpAngle(tr.fromYaw, tr.toYaw, k);
      pitch.current *= 1 - k * 0.2;
      velocity.current.set(0, 0);
      if (tr.t >= 1) travel.current = null;
    } else {
      const k = keys.current;
      let forward = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) + touchInput.moveY;
      let strafe = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0) + touchInput.moveX;
      const mag = Math.hypot(forward, strafe);
      if (mag > 1) {
        forward /= mag;
        strafe /= mag;
      }
      const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? RUN_SPEED : WALK_SPEED;
      const sin = Math.sin(yaw.current);
      const cos = Math.cos(yaw.current);
      const tx = (-sin * forward + cos * strafe) * speed;
      const tz = (-cos * forward - sin * strafe) * speed;
      const blend = Math.min(1, dt * 10);
      velocity.current.x += (tx - velocity.current.x) * blend;
      velocity.current.y += (tz - velocity.current.y) * blend;
      const [nx, nz] = resolveCollisions(pos.x + velocity.current.x * dt, pos.z + velocity.current.y * dt, PLAYER_RADIUS, colliders, WORLD_RADIUS);
      pos.x = nx;
      pos.z = nz;
    }

    const moving = velocity.current.lengthSq() > 0.5;
    const bob = reducedMotion || !moving ? 0 : Math.sin(performance.now() * 0.011) * 0.045;
    camera.position.set(pos.x, EYE_HEIGHT + bob, pos.z);
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');

    frame.current++;
    if (frame.current % 6 === 0) {
      const store = useWorld.getState();
      const idx = nearestWithin(pos.x, pos.z, buildingColliders, 5);
      store.setNearby(idx >= 0 ? (buildingColliders[idx].id ?? null) : null);
      if (store.pointerLocked) {
        raycaster.setFromCamera(center, camera);
        const hits = raycaster.intersectObjects(Array.from(targets.current.values()), true);
        let found: BuildingId | null = null;
        for (const hit of hits) {
          let obj: THREE.Object3D | null = hit.object;
          while (obj && !obj.userData.buildingId) obj = obj.parent;
          if (obj) {
            found = obj.userData.buildingId as BuildingId;
            break;
          }
        }
        store.setTargeted(found);
      } else if (store.targetedId) store.setTargeted(null);
    }
  });

  return null;
}
