import * as THREE from 'three';
import type { SectionId } from '../core/models/profile.models';
import { buildCleCoupe, CleCoupe, createEnvironment } from './cle-coupe';
import { BEACH_Z, CHECKPOINTS, CITY_EDGE, ISLAND_R, NabeulWorld, ROADS, ROAD_W, buildNabeul } from './nabeul-world';

export type Control = 'up' | 'down' | 'left' | 'right' | 'boost' | 'brake';

export interface DriveCallbacks {
  onNear(id: SectionId | null): void;
  onVisit(id: SectionId): void;
  onSpeed(kmh: number): void;
  onReady(): void;
}

const MAX_SPEED = 26;
const BOOST_SPEED = 36;
const CAR_RADIUS = 1.9;
const NEAR_RADIUS = 7;
const START = { x: 0, z: 74, heading: Math.PI / 2 };

const KEYMAP: Record<string, Control> = {
  KeyW: 'up', ArrowUp: 'up', KeyZ: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left', KeyQ: 'left',
  KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'boost', ShiftRight: 'boost',
  Space: 'brake',
};

/**
 * Owns the WebGL renderer, the Nabeul world and the CLE's arcade driving model.
 * Runs entirely outside Angular; reports only meaningful state changes back.
 */
export class DriveEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera = new THREE.PerspectiveCamera(55, 1, 0.5, 700);
  private readonly sun = new THREE.DirectionalLight('#fff3df', 2.4);
  private readonly world: NabeulWorld;
  private readonly car: CleCoupe;
  private readonly input: Record<Control, boolean> = { up: false, down: false, left: false, right: false, boost: false, brake: false };
  private readonly clock = new THREE.Clock();
  private readonly camPos = new THREE.Vector3();
  private readonly camLook = new THREE.Vector3();
  private readonly tmp = new THREE.Vector3();

  private x = START.x;
  private z = START.z;
  private heading = START.heading;
  private speed = 0;
  private steer = 0;
  private time = 0;
  private raf = 0;
  private frame = 0;
  private near: SectionId | null = null;
  private lastKmh = -1;
  private enabled = false;
  private intro = true;
  private travel: { fromX: number; fromZ: number; toX: number; toZ: number; heading: number; t: number } | null = null;
  private resizeObserver: ResizeObserver;
  private readonly visited = new Set<SectionId>();
  private readonly onKeyDown = (e: KeyboardEvent) => this.key(e, true);
  private readonly onKeyUp = (e: KeyboardEvent) => this.key(e, false);
  private readonly onBlur = () => (Object.keys(this.input) as Control[]).forEach((k) => (this.input[k] = false));

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly minimap: HTMLCanvasElement | null,
    private readonly cb: DriveCallbacks,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.world = buildNabeul();
    const scene = this.world.scene;

    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 200 });
    this.sun.shadow.bias = -0.0004;
    scene.add(this.sun, this.sun.target, new THREE.HemisphereLight('#ffffff', '#cbbf9f', 0.85));

    this.car = buildCleCoupe();
    scene.add(this.car.group);
    createEnvironment(this.renderer).then((env) => {
      this.car.paint.envMap = env;
      this.car.paint.envMapIntensity = 1.1;
      this.car.paint.needsUpdate = true;
    });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.placeCar();
    this.camPos.set(70, 60, 140);
    this.camLook.set(0, 0, 20);

    addEventListener('keydown', this.onKeyDown);
    addEventListener('keyup', this.onKeyUp);
    addEventListener('blur', this.onBlur);
  }

  start(): void {
    this.clock.start();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 1 / 30);
      if (document.hidden) return;
      this.tick(dt);
    };
    loop();
    this.cb.onReady();
  }

  /** Leaves the cinematic intro orbit and hands control to the driver. */
  begin(): void {
    this.intro = false;
    this.enabled = true;
  }

  setEnabled(on: boolean): void {
    this.enabled = on && !this.intro;
    if (!on) this.onBlur();
  }

  setControl(c: Control, on: boolean): void {
    this.input[c] = on;
  }

  /** Smoothly relocates the car next to a checkpoint (fast travel). */
  travelTo(id: SectionId): void {
    const cp = CHECKPOINTS.find((c) => c.id === id);
    if (!cp) return;
    const onVertical = ROADS.includes(cp.x);
    const heading = onVertical ? Math.PI / 2 : 0;
    const back = 6;
    const toX = onVertical ? cp.x : cp.x - back;
    const toZ = onVertical ? cp.z + back : cp.z;
    this.travel = { fromX: this.x, fromZ: this.z, toX, toZ, heading, t: 0 };
    this.speed = 0;
  }

  markVisited(id: SectionId): void {
    if (this.visited.has(id)) return;
    this.visited.add(id);
    this.world.markVisited(id);
    this.cb.onVisit(id);
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    removeEventListener('keydown', this.onKeyDown);
    removeEventListener('keyup', this.onKeyUp);
    removeEventListener('blur', this.onBlur);
    this.resizeObserver.disconnect();
    this.car.paint.envMap?.dispose();
    this.car.dispose();
    this.world.dispose();
    this.renderer.dispose();
  }

  // ------------------------------------------------------------------ internals

  private key(e: KeyboardEvent, down: boolean): void {
    const c = KEYMAP[e.code];
    if (!c) return;
    if (this.enabled && (e.code.startsWith('Arrow') || e.code === 'Space')) e.preventDefault();
    this.input[c] = down && this.enabled;
  }

  private resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 0.8 ? 68 : 55;
    this.camera.updateProjectionMatrix();
  }

  private tick(dt: number): void {
    this.time += dt;
    this.world.update(this.time);

    if (this.travel) this.stepTravel(dt);
    else if (this.enabled) this.stepPhysics(dt);
    else this.speed *= 1 - Math.min(1, dt * 3);

    this.placeCar(dt);
    this.updateCamera(dt);
    this.updateNear();

    this.sun.position.set(this.x + 40, 70, this.z + 25);
    this.sun.target.position.set(this.x, 0, this.z);

    const kmh = Math.round(Math.abs(this.speed) * 3.6);
    if (kmh !== this.lastKmh && this.frame % 4 === 0) {
      this.lastKmh = kmh;
      this.cb.onSpeed(kmh);
    }
    if (this.minimap && this.frame % 2 === 0) this.drawMinimap();
    this.frame++;

    this.renderer.render(this.world.scene, this.camera);
  }

  private stepPhysics(dt: number): void {
    const i = this.input;
    const max = i.boost ? BOOST_SPEED : MAX_SPEED;
    if (i.up) this.speed += (this.speed < 0 ? 42 : i.boost ? 20 : 15) * dt;
    if (i.down) this.speed -= (this.speed > 0 ? 34 : 10) * dt;
    if (!i.up && !i.down) this.speed -= Math.sign(this.speed) * Math.min(Math.abs(this.speed), (3 + Math.abs(this.speed) * 0.35) * dt);
    if (i.brake) this.speed *= 1 - Math.min(1, dt * 3.5);
    this.speed = THREE.MathUtils.clamp(this.speed, -9, max);
    if (this.speed > max) this.speed -= 20 * dt;

    const target = (i.left ? 1 : 0) - (i.right ? 1 : 0);
    this.steer += (target - this.steer) * Math.min(1, dt * 7);
    const grip = THREE.MathUtils.clamp(Math.abs(this.speed) / 7, 0, 1) * (1 - 0.4 * Math.min(1, Math.abs(this.speed) / BOOST_SPEED));
    this.heading += this.steer * 1.85 * grip * Math.sign(this.speed) * dt;

    const nx = this.x + Math.cos(this.heading) * this.speed * dt;
    const nz = this.z - Math.sin(this.heading) * this.speed * dt;
    const [rx, rz, hit] = this.collide(nx, nz);
    if (hit) this.speed *= 0.55;
    this.x = rx;
    this.z = rz;
  }

  private collide(x: number, z: number): [number, number, boolean] {
    let hit = false;
    x = THREE.MathUtils.clamp(x, -CITY_EDGE - 6, CITY_EDGE + 6);
    z = THREE.MathUtils.clamp(z, -CITY_EDGE - 6, BEACH_Z[1] - 4);
    // roundabout island (circle)
    const d = Math.hypot(x, z);
    const minD = ISLAND_R + CAR_RADIUS;
    if (d < minD) {
      const k = minD / (d || 1);
      x *= k;
      z *= k;
      hit = true;
    }
    for (let n = 1; n < this.world.colliders.length; n++) {
      const b = this.world.colliders[n];
      const cx = THREE.MathUtils.clamp(x, b.minX, b.maxX);
      const cz = THREE.MathUtils.clamp(z, b.minZ, b.maxZ);
      const dx = x - cx;
      const dz = z - cz;
      const dist = Math.hypot(dx, dz);
      if (dist >= CAR_RADIUS) continue;
      hit = true;
      if (dist > 1e-4) {
        x = cx + (dx / dist) * CAR_RADIUS;
        z = cz + (dz / dist) * CAR_RADIUS;
      } else {
        // centre inside the box: push out along the shallowest axis
        const pushes = [b.minX - CAR_RADIUS - x, b.maxX + CAR_RADIUS - x, b.minZ - CAR_RADIUS - z, b.maxZ + CAR_RADIUS - z];
        const idx = pushes.map(Math.abs).reduce((best, v, j, arr) => (v < arr[best] ? j : best), 0);
        if (idx < 2) x += pushes[idx];
        else z += pushes[idx];
      }
    }
    return [x, z, hit];
  }

  private stepTravel(dt: number): void {
    const t = this.travel!;
    t.t = Math.min(1, t.t + dt / 1.4);
    const e = t.t < 0.5 ? 4 * t.t ** 3 : 1 - (-2 * t.t + 2) ** 3 / 2;
    this.x = THREE.MathUtils.lerp(t.fromX, t.toX, e);
    this.z = THREE.MathUtils.lerp(t.fromZ, t.toZ, e);
    let dh = t.heading - this.heading;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    this.heading += dh * Math.min(1, dt * 6);
    if (t.t >= 1) {
      this.heading = t.heading;
      this.travel = null;
    }
  }

  private placeCar(dt = 0): void {
    const g = this.car.group;
    g.position.set(this.x, 0, this.z);
    g.rotation.y = this.heading;
    // subtle body roll & pitch for weight
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, this.input.down && this.speed > 0 ? -0.015 : 0, 0.1);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, this.steer * Math.min(1, Math.abs(this.speed) / 20) * 0.03, 0.1);
    for (const w of this.car.wheels) w.rotation.z -= (this.speed * dt) / 0.35;
    for (const s of this.car.steer) s.rotation.y = this.steer * 0.45;
    this.car.brake.color.set(this.input.down || this.input.brake ? '#ff2a2a' : '#8c0f15');
  }

  private updateCamera(dt: number): void {
    const fx = Math.cos(this.heading);
    const fz = -Math.sin(this.heading);
    if (this.intro) {
      const a = this.time * 0.12;
      this.tmp.set(Math.cos(a) * 95, 55, 30 + Math.sin(a) * 95);
      this.camPos.lerp(this.tmp, Math.min(1, dt * 1.2));
      this.camLook.lerp(this.tmp.set(0, 4, 10), Math.min(1, dt * 2));
    } else {
      // pull the chase camera in (and up) rather than letting it sink into a building
      let back = 11 + Math.abs(this.speed) * 0.12;
      let lift = 0;
      while (back > 3 && this.insideBuilding(this.x - fx * back, this.z - fz * back)) {
        back -= 1;
        lift += 0.6;
      }
      this.tmp.set(this.x - fx * back, 4.6 + lift + Math.abs(this.speed) * 0.03, this.z - fz * back);
      this.camPos.lerp(this.tmp, 1 - Math.exp(-dt * 4));
      this.tmp.set(this.x + fx * 5, 1.4, this.z + fz * 5);
      this.camLook.lerp(this.tmp, 1 - Math.exp(-dt * 8));
    }
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  private insideBuilding(x: number, z: number): boolean {
    const pad = 1.2;
    for (let n = 1; n < this.world.colliders.length; n++) {
      const b = this.world.colliders[n];
      if (x > b.minX - pad && x < b.maxX + pad && z > b.minZ - pad && z < b.maxZ + pad) return true;
    }
    return false;
  }

  private updateNear(): void {
    let found: SectionId | null = null;
    for (const cp of CHECKPOINTS) {
      if (Math.hypot(cp.x - this.x, cp.z - this.z) < NEAR_RADIUS) {
        found = cp.id;
        break;
      }
    }
    if (found !== this.near) {
      this.near = found;
      this.cb.onNear(found);
    }
  }

  private drawMinimap(): void {
    const c = this.minimap!;
    const size = c.clientWidth;
    if (!size) return;
    const dpr = Math.min(devicePixelRatio, 2);
    if (c.width !== size * dpr) {
      c.width = size * dpr;
      c.height = size * dpr;
    }
    const g = c.getContext('2d')!;
    const range = 120;
    const s = (size * dpr) / (range * 2);
    const px = (x: number) => (x + range) * s;
    const pz = (z: number) => (z + range - 10) * s;
    g.fillStyle = '#0f1b2d';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#1d5ba6';
    g.fillRect(0, pz(BEACH_Z[1]), c.width, c.height);
    g.fillStyle = '#e6d3a8';
    g.fillRect(0, pz(BEACH_Z[0]), c.width, (BEACH_Z[1] - BEACH_Z[0]) * s);
    g.strokeStyle = '#3b4d68';
    g.lineWidth = ROAD_W * s * 0.55;
    g.lineCap = 'round';
    for (const p of ROADS) {
      g.beginPath();
      g.moveTo(px(p), pz(-CITY_EDGE));
      g.lineTo(px(p), pz(CITY_EDGE));
      g.moveTo(px(-CITY_EDGE), pz(p));
      g.lineTo(px(CITY_EDGE), pz(p));
      g.stroke();
    }
    g.fillStyle = '#c0532b';
    g.beginPath();
    g.arc(px(0), pz(0), ISLAND_R * s, 0, Math.PI * 2);
    g.fill();
    for (const cp of CHECKPOINTS) {
      g.fillStyle = this.visited.has(cp.id) ? '#6aa0e0' : cp.id === this.near ? '#f4f0e8' : '#e0774d';
      g.beginPath();
      g.arc(px(cp.x), pz(cp.z), 4.2 * dpr, 0, Math.PI * 2);
      g.fill();
    }
    // car arrow
    g.save();
    g.translate(px(this.x), pz(this.z));
    g.rotate(-this.heading + Math.PI / 2);
    g.fillStyle = '#f4f0e8';
    g.beginPath();
    g.moveTo(0, -8 * dpr);
    g.lineTo(5.5 * dpr, 6 * dpr);
    g.lineTo(0, 3 * dpr);
    g.lineTo(-5.5 * dpr, 6 * dpr);
    g.closePath();
    g.fill();
    g.restore();
  }
}
