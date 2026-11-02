import * as THREE from 'three';
import type { SectionId } from '../core/models/profile.models';

/* --------------------------------------------------------------------------
   Nabeul, procedurally: a gridded modern city around the monumental jar,
   limewashed buildings with Tunisian-blue openings, glass offices, a Great
   Mosque minaret, a ceramics souk, a palm-lined corniche and the Gulf of
   Hammamet. Everything uses solid colours and instancing for performance.
   -------------------------------------------------------------------------- */

export const ROADS = [-80, -40, 0, 40, 80];
export const ROAD_W = 12;
export const CITY_EDGE = 86;
export const BEACH_Z = [86, 102] as const;
export const ISLAND_R = 9;

export interface Checkpoint {
  id: SectionId;
  label: string;
  x: number;
  z: number;
}

export const CHECKPOINTS: Checkpoint[] = [
  { id: 'about', label: 'About', x: 0, z: 44 },
  { id: 'services', label: 'Services', x: 40, z: 20 },
  { id: 'featured', label: 'Featured', x: 60, z: -40 },
  { id: 'activity', label: 'Activity', x: 20, z: -80 },
  { id: 'experience', label: 'Experience', x: -20, z: -40 },
  { id: 'education', label: 'Education', x: -80, z: -60 },
  { id: 'certifications', label: 'Certifications', x: -60, z: 0 },
  { id: 'skills', label: 'Skills', x: -40, z: 60 },
  { id: 'languages', label: 'Languages', x: -60, z: 80 },
  { id: 'contact', label: 'Contact', x: 60, z: 80 },
];

export interface Box2 { minX: number; maxX: number; minZ: number; maxZ: number }

export interface CheckpointVisual {
  cp: Checkpoint;
  ring: THREE.Mesh;
  beacon: THREE.Mesh;
  gem: THREE.Mesh;
  label: THREE.Sprite;
  material: THREE.MeshBasicMaterial;
}

export interface NabeulWorld {
  scene: THREE.Scene;
  colliders: Box2[];
  checkpoints: CheckpointVisual[];
  update(time: number): void;
  markVisited(id: SectionId): void;
  dispose(): void;
}

const COLORS = {
  sky: '#cfdfeb',
  ground: '#e6dfd0',
  asphalt: '#3a4049',
  lane: '#f4f0e8',
  kerb: '#cfc6b4',
  lime: ['#f4f1ea', '#efe9dd', '#f7f4ee', '#e9e2d3', '#f1ece2'],
  stone: '#e4d7bd',
  blue: '#1d5ba6',
  blueDeep: '#173f72',
  terra: '#c0532b',
  glass: '#3d5f80',
  slab: '#eef1f4',
  grass: '#6f8f5a',
  trunk: '#7a5c3a',
  frond: '#4b7552',
  sand: '#e6d3a8',
  sea: '#2a6aa8',
  tile: '#4f7a5e',
};

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Collects transforms for one geometry/material pair, then emits a single InstancedMesh. */
class Batch {
  private readonly matrices: THREE.Matrix4[] = [];
  private readonly colors: THREE.Color[] = [];
  private readonly m = new THREE.Matrix4();
  private readonly q = new THREE.Quaternion();
  private readonly e = new THREE.Euler();

  constructor(
    private readonly geometry: THREE.BufferGeometry,
    private readonly material: THREE.Material,
    private readonly shadows: { cast?: boolean; receive?: boolean } = {},
  ) {}

  add(x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, ry = 0, color?: THREE.ColorRepresentation, rx = 0, rz = 0): void {
    this.e.set(rx, ry, rz);
    this.q.setFromEuler(this.e);
    this.m.compose(new THREE.Vector3(x, y, z), this.q, new THREE.Vector3(sx, sy, sz));
    this.matrices.push(this.m.clone());
    this.colors.push(new THREE.Color(color ?? '#ffffff'));
  }

  addMatrix(matrix: THREE.Matrix4, color: THREE.ColorRepresentation): void {
    this.matrices.push(matrix);
    this.colors.push(new THREE.Color(color));
  }

  build(): THREE.InstancedMesh | null {
    if (!this.matrices.length) return null;
    const mesh = new THREE.InstancedMesh(this.geometry, this.material, this.matrices.length);
    this.matrices.forEach((mx, i) => {
      mesh.setMatrixAt(i, mx);
      mesh.setColorAt(i, this.colors[i]);
    });
    mesh.castShadow = !!this.shadows.cast;
    mesh.receiveShadow = !!this.shadows.receive;
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }
}

function labelTexture(lines: { text: string; font: string; color: string }[], opts: { bg: string; w: number; h: number; badge?: string }) {
  const scale = 2;
  const c = document.createElement('canvas');
  c.width = opts.w * scale;
  c.height = opts.h * scale;
  const g = c.getContext('2d')!;
  g.scale(scale, scale);
  g.fillStyle = opts.bg;
  const r = opts.h / 2;
  g.beginPath();
  g.roundRect(0, 0, opts.w, opts.h, r);
  g.fill();
  let x = 22;
  if (opts.badge) {
    g.fillStyle = COLORS.terra;
    g.beginPath();
    g.arc(r, r, r - 10, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#f4f0e8';
    g.font = '600 22px Manrope, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(opts.badge, r, r + 1);
    x = r * 2 + 8;
  }
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  const step = opts.h / (lines.length + 1);
  lines.forEach((l, i) => {
    g.fillStyle = l.color;
    g.font = l.font;
    g.fillText(l.text, x, step * (i + 1) + 1);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function buildNabeul(): NabeulWorld {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.sky);
  scene.fog = new THREE.Fog(COLORS.sky, 120, 330);

  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);
  const colliders: Box2[] = [];
  const r = rng(1984);

  // ---- shared geometry & materials
  const unitBox = own(new THREE.BoxGeometry(1, 1, 1));
  unitBox.translate(0, 0.5, 0); // pivot at base
  const centerBox = own(new THREE.BoxGeometry(1, 1, 1));
  const lambert = own(new THREE.MeshLambertMaterial({ color: '#ffffff' }));
  const glassMat = own(new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.35, roughness: 0.18 }));
  const basic = own(new THREE.MeshBasicMaterial({ color: '#ffffff' }));

  const bodies = new Batch(unitBox, lambert, { cast: true, receive: true });
  const glass = new Batch(unitBox, glassMat, { cast: true, receive: true });
  const details = new Batch(centerBox, lambert, { cast: false, receive: false });
  const windows = new Batch(centerBox, lambert);
  const flats = new Batch(unitBox, lambert, { receive: true });
  const lines = new Batch(centerBox, basic);

  // ---- ground, roads, sea
  const ground = new THREE.Mesh(own(new THREE.PlaneGeometry(600, 600)), own(new THREE.MeshLambertMaterial({ color: COLORS.ground })));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadLen = CITY_EDGE * 2 + ROAD_W;
  for (const p of ROADS) {
    flats.add(p, 0.0, 0, ROAD_W, 0.04, roadLen, 0, COLORS.asphalt);
    flats.add(0, 0.0, p, roadLen, 0.045, ROAD_W, 0, COLORS.asphalt);
    // dashed centre lines
    for (let t = -CITY_EDGE; t <= CITY_EDGE; t += 6) {
      if (ROADS.some((q) => Math.abs(q - t) < ROAD_W / 2 + 1)) continue;
      lines.add(p, 0.07, t, 0.22, 0.02, 2.6, 0, COLORS.lane);
      lines.add(t, 0.07, p, 2.6, 0.02, 0.22, 0, COLORS.lane);
    }
  }
  // zebra crossings at every intersection approach
  for (const a of ROADS) {
    for (const b of ROADS) {
      if (a === 0 && b === 0) continue;
      for (let k = -4; k <= 4; k++) {
        for (const s of [-1, 1]) {
          lines.add(a + k * 1.2, 0.071, b + s * (ROAD_W / 2 + 1.6), 0.6, 0.02, 2.6, 0, COLORS.lane);
          lines.add(a + s * (ROAD_W / 2 + 1.6), 0.071, b + k * 1.2, 2.6, 0.02, 0.6, 0, COLORS.lane);
        }
      }
    }
  }

  // roundabout ring road + island
  const ringRoad = new THREE.Mesh(own(new THREE.CircleGeometry(20, 64)), own(new THREE.MeshLambertMaterial({ color: COLORS.asphalt })));
  ringRoad.rotation.x = -Math.PI / 2;
  ringRoad.position.y = 0.05;
  ringRoad.receiveShadow = true;
  scene.add(ringRoad);
  const island = new THREE.Mesh(own(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R, 0.35, 64)), own(new THREE.MeshLambertMaterial({ color: COLORS.grass })));
  island.position.y = 0.17;
  island.receiveShadow = true;
  const kerbRing = new THREE.Mesh(own(new THREE.TorusGeometry(ISLAND_R, 0.3, 8, 64)), own(new THREE.MeshLambertMaterial({ color: '#f4f0e8' })));
  kerbRing.rotation.x = Math.PI / 2;
  kerbRing.position.y = 0.3;
  scene.add(island, kerbRing);

  // the monumental jar Nabeul's ceramics emblem
  const jarProfile = [
    [0, 0], [1.3, 0], [1.9, 0.5], [2.9, 1.9], [3.35, 3.6], [3.15, 5.3], [2.35, 6.7], [1.45, 7.6], [1.25, 8.3], [1.65, 8.65], [1.65, 9.0], [1.2, 9.0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const jarGeo = own(new THREE.LatheGeometry(jarProfile, 48));
  const jar = new THREE.Mesh(jarGeo, own(new THREE.MeshStandardMaterial({ color: COLORS.terra, roughness: 0.7 })));
  jar.position.y = 2.1;
  jar.castShadow = true;
  scene.add(jar);
  const pedestal = new THREE.Mesh(own(new THREE.CylinderGeometry(3.6, 4.2, 1.8, 8)), own(new THREE.MeshLambertMaterial({ color: '#f4f0e8' })));
  pedestal.position.y = 1.2;
  pedestal.castShadow = true;
  scene.add(pedestal);
  const bandMat = own(new THREE.MeshLambertMaterial({ color: COLORS.blue }));
  for (const [y, rad] of [[3.6, 3.33], [5.0, 3.22], [6.4, 2.55]] as const) {
    const band = new THREE.Mesh(own(new THREE.TorusGeometry(rad, 0.12, 6, 64)), bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 2.1 + y;
    scene.add(band);
  }
  colliders.push({ minX: -ISLAND_R, maxX: ISLAND_R, minZ: -ISLAND_R, maxZ: ISLAND_R }); // treated as circle in physics

  // ---- building helpers
  const facadeWindows = (x: number, z: number, w: number, d: number, h: number, floorH: number, startY: number, color: string, shutters: boolean) => {
    const floors = Math.floor((h - startY) / floorH);
    for (let f = 0; f < floors; f++) {
      const y = startY + f * floorH + floorH * 0.5;
      for (const [len, axis] of [[w, 'x'], [d, 'z']] as const) {
        const cols = Math.max(1, Math.floor(len / 3.2));
        const step = len / cols;
        for (let c = 0; c < cols; c++) {
          const off = -len / 2 + step * (c + 0.5);
          for (const side of [-1, 1]) {
            if (axis === 'x') {
              const zz = z + side * (d / 2 + 0.05);
              windows.add(x + off, y, zz, 1.3, 1.7, 0.12, 0, color);
              if (shutters) {
                windows.add(x + off - 1.0, y, zz, 0.35, 1.7, 0.16, 0, COLORS.blueDeep);
                windows.add(x + off + 1.0, y, zz, 0.35, 1.7, 0.16, 0, COLORS.blueDeep);
              }
            } else {
              const xx = x + side * (w / 2 + 0.05);
              windows.add(xx, y, z + off, 0.12, 1.7, 1.3, 0, color);
            }
          }
        }
      }
    }
  };

  const limewash = (x: number, z: number, w: number, d: number, h: number) => {
    bodies.add(x, 0, z, w, h, d, 0, COLORS.lime[Math.floor(r() * COLORS.lime.length)]);
    details.add(x, h + 0.3, z, w + 0.4, 0.6, d + 0.4, 0, '#ddd5c5'); // parapet
    facadeWindows(x, z, w, d, h, 3.2, 3.6, COLORS.blue, r() > 0.45);
    // ground floor: shopfront band + awning or a studded Tunisian door
    if (r() > 0.4) {
      details.add(x, 1.5, z + d / 2 + 0.06, w * 0.8, 2.6, 0.1, 0, '#1b2a40');
      details.add(x, 3.0, z + d / 2 + 0.9, w * 0.8, 0.12, 1.8, 0, r() > 0.5 ? COLORS.terra : COLORS.blue);
    } else {
      details.add(x, 1.3, z + d / 2 + 0.06, 1.6, 2.6, 0.12, 0, COLORS.blue);
      details.add(x, 2.75, z + d / 2 + 0.06, 1.9, 0.3, 0.14, 0, '#f4f0e8');
    }
    // rooftop: water tank or small dome-like stair house
    if (r() > 0.5) details.add(x + w * 0.2, h + 1.2, z - d * 0.2, 2.2, 1.6, 2.2, 0, '#e9e2d3');
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  };

  const tower = (x: number, z: number, w: number, d: number, h: number) => {
    glass.add(x, 0, z, w, h, d, 0, COLORS.glass);
    for (let y = 4; y < h; y += 3.6) details.add(x, y, z, w + 0.3, 0.35, d + 0.3, 0, COLORS.slab);
    details.add(x, h + 0.4, z, w * 0.6, 0.8, d * 0.6, 0, '#cfd6de');
    details.add(x, 1.6, z, w + 0.6, 3.2, d + 0.6, 0, '#e9e5dc'); // podium
    colliders.push({ minX: x - w / 2 - 0.3, maxX: x + w / 2 + 0.3, minZ: z - d / 2 - 0.3, maxZ: z + d / 2 + 0.3 });
  };

  const hotel = (x: number, z: number, w: number, d: number, h: number) => {
    bodies.add(x, 0, z, w, h, d, 0, '#f7f4ee');
    for (let y = 3.2; y < h - 1; y += 3.2) details.add(x, y, z + d / 2 + 0.8, w * 0.92, 0.18, 1.6, 0, '#e2dbcd');
    facadeWindows(x, z, w, d, h, 3.2, 3.2, '#2a5f9c', false);
    details.add(x, h + 0.4, z, w + 0.4, 0.8, d + 0.4, 0, COLORS.blue);
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 + 1.6 });
  };

  const palmTrunk = own(new THREE.CylinderGeometry(0.22, 0.32, 1, 6));
  palmTrunk.translate(0, 0.5, 0);
  const frond = own(new THREE.ConeGeometry(0.7, 4.2, 4));
  frond.translate(0, 2.1, 0);
  const trunks = new Batch(palmTrunk, lambert, { cast: true });
  const fronds = new Batch(frond, lambert, { cast: true });
  const palm = (x: number, z: number, h = 7 + r() * 3) => {
    trunks.add(x, 0, z, 1, h, 1, 0, COLORS.trunk);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + r();
      // tilt each frond outward, then spin it around the trunk
      fronds.addMatrix(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, h - 0.2, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, 1.15 + r() * 0.3, 'YXZ')),
          new THREE.Vector3(1, 1, 0.35),
        ),
        COLORS.frond,
      );
    }
  };

  const lampPole = own(new THREE.CylinderGeometry(0.08, 0.1, 1, 6));
  lampPole.translate(0, 0.5, 0);
  const lamps = new Batch(lampPole, lambert);
  const lamp = (x: number, z: number) => {
    lamps.add(x, 0, z, 1, 6.5, 1, 0, '#5b6577');
    details.add(x, 6.5, z, 1.2, 0.18, 0.4, 0, '#5b6577');
  };

  // ---- city blocks
  const centers = [-60, -20, 20, 60];
  for (const bx of centers) {
    for (const bz of centers) {
      const key = `${bx},${bz}`;
      // sidewalk slab per block
      flats.add(bx, 0, bz, 40 - ROAD_W, 0.12, 40 - ROAD_W, 0, '#ddd5c6');

      if (key === '-60,-20') {
        // Great Mosque: prayer hall, courtyard wall, square Maghrebi minaret
        bodies.add(bx + 2, 0, bz, 20, 6, 18, 0, COLORS.stone);
        for (let i = -3; i <= 3; i++) details.add(bx + 2 + i * 2.8, 2.2, bz + 9.06, 1.4, 3.2, 0.12, 0, '#9c8a67');
        for (let i = -4; i <= 4; i++) details.add(bx + 2 + i * 2.3, 6.4, bz + 9, 0.8, 0.8, 0.5, 0, COLORS.stone);
        bodies.add(bx - 9, 0, bz - 6, 4.6, 24, 4.6, 0, COLORS.stone);
        details.add(bx - 9, 24.3, bz - 6, 5.4, 0.6, 5.4, 0, '#c9b896');
        bodies.add(bx - 9, 24.6, bz - 6, 2.8, 3.6, 2.8, 0, COLORS.stone);
        for (const y of [9, 14, 19]) for (const s of [-1, 1]) details.add(bx - 9, y, bz - 6 + s * 2.35, 0.9, 1.8, 0.1, 0, COLORS.blueDeep);
        const dome = new THREE.Mesh(own(new THREE.SphereGeometry(4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)), own(new THREE.MeshLambertMaterial({ color: '#f4f0e8' })));
        dome.position.set(bx + 2, 6, bz);
        dome.castShadow = true;
        scene.add(dome);
        const cap = new THREE.Mesh(own(new THREE.ConeGeometry(1.9, 1.8, 4)), own(new THREE.MeshLambertMaterial({ color: COLORS.tile })));
        cap.position.set(bx - 9, 29.1, bz - 6);
        cap.rotation.y = Math.PI / 4;
        scene.add(cap);
        colliders.push({ minX: bx - 8, maxX: bx + 12, minZ: bz - 9, maxZ: bz + 9 }, { minX: bx - 11.3, maxX: bx - 6.7, minZ: bz - 8.3, maxZ: bz - 3.7 });
        continue;
      }

      if (key === '-20,20') {
        // ceramics souk: arcaded hall with pottery displayed out front
        bodies.add(bx, 0, bz - 4, 24, 5.5, 12, 0, '#efe6d5');
        for (let i = -4; i <= 4; i++) {
          details.add(bx + i * 2.6, 2, bz + 2.06, 1.6, 3.4, 0.12, 0, '#1b2a40');
        }
        details.add(bx, 5.2, bz + 2.6, 25, 0.25, 1.4, 0, COLORS.terra);
        colliders.push({ minX: bx - 12, maxX: bx + 12, minZ: bz - 10, maxZ: bz + 2 });
        const potGeo = own(new THREE.LatheGeometry(jarProfile.map((v) => v.clone().multiplyScalar(0.14)), 16));
        const pots = new Batch(potGeo, own(new THREE.MeshLambertMaterial({ color: '#ffffff' })), { cast: true });
        for (let i = 0; i < 26; i++) {
          const s = 0.7 + r() * 0.9;
          pots.add(bx - 11 + (i % 13) * 1.8 + r() * 0.4, 0.12, bz + 4 + Math.floor(i / 13) * 1.6, s, s, s, 0, [COLORS.terra, '#d9a066', COLORS.blue, '#f4f0e8'][i % 4]);
        }
        const mesh = pots.build();
        if (mesh) scene.add(mesh);
        for (const px of [-11, 11]) palm(bx + px, bz + 10);
        continue;
      }

      if (key === '20,20') {
        // civic plaza with fountain and palms
        flats.add(bx, 0.12, bz, 26, 0.06, 26, 0, '#efe9dd');
        const basin = new THREE.Mesh(own(new THREE.CylinderGeometry(4, 4.3, 0.8, 40)), own(new THREE.MeshLambertMaterial({ color: '#f4f0e8' })));
        basin.position.set(bx, 0.5, bz);
        const water = new THREE.Mesh(own(new THREE.CircleGeometry(3.6, 40)), own(new THREE.MeshLambertMaterial({ color: COLORS.sea })));
        water.rotation.x = -Math.PI / 2;
        water.position.set(bx, 0.92, bz);
        scene.add(basin, water);
        colliders.push({ minX: bx - 4, maxX: bx + 4, minZ: bz - 4, maxZ: bz + 4 });
        for (const [px, pz] of [[-10, -10], [10, -10], [-10, 10], [10, 10], [0, -11], [0, 11], [-11, 0], [11, 0]]) palm(bx + px, bz + pz);
        continue;
      }

      if (bz === -60 && bx > 0) {
        // business district
        tower(bx - 5, bz - 4, 10, 10, 34 + r() * 14);
        tower(bx + 7, bz + 5, 8, 10, 22 + r() * 10);
        continue;
      }
      if (bz === 60) {
        // seafront hotels & residences facing the Gulf
        hotel(bx - 6, bz + 2, 12, 12, 19 + Math.round(r() * 3) * 3.2);
        limewash(bx + 8, bz - 6, 9, 9, 3.2 * (3 + Math.floor(r() * 2)) + 0.6);
        palm(bx + 9, bz + 11);
        continue;
      }
      if (key === '60,-20' || key === '-20,-60') {
        tower(bx, bz, 12, 12, 26 + r() * 10);
        limewash(bx - 9, bz + 9, 7, 7, 10.2);
        continue;
      }

      // residential / mixed-use block: four limewashed buildings around a courtyard
      for (const [ox, oz] of [[-7, -7], [7, -7], [-7, 7], [7, 7]]) {
        const w = 9 + r() * 3;
        const d = 9 + r() * 3;
        const floors = 2 + Math.floor(r() * 5);
        limewash(bx + ox, bz + oz, w, d, floors * 3.2 + 0.6);
      }
    }
  }

  // outer ring of city to frame the horizon (north, east, west)
  for (let t = -120; t <= 120; t += 16) {
    for (const [x, z] of [[t, -104], [-104, t], [104, t]] as const) {
      if (z > 70) continue;
      const h = 8 + r() * 22;
      if (r() > 0.75) tower(x, z, 10, 10, h + 14);
      else limewash(x, z, 12, 12, Math.round(h / 3.2) * 3.2 + 0.6);
    }
  }

  // corniche: kerb, palms, lamps, beach, sea, jetty, boats
  flats.add(0, 0, 90, 260, 0.14, 8, 0, '#e9e2d3');
  for (let x = -110; x <= 110; x += 14) {
    palm(x, 90.5);
    lamp(x + 7, 87.5);
  }
  flats.add(0, 0, 103, 260, 0.06, 18, 0, COLORS.sand);
  const sea = new THREE.Mesh(own(new THREE.PlaneGeometry(900, 400)), own(new THREE.MeshLambertMaterial({ color: COLORS.sea })));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(0, 0.03, 312);
  scene.add(sea);
  bodies.add(40, 0, 130, 5, 0.6, 36, 0, '#d9d1c2');
  const hull = own(new THREE.BoxGeometry(2.4, 1.2, 7));
  const boatMat = own(new THREE.MeshLambertMaterial({ color: '#f4f0e8' }));
  for (const [bx, bz, ry] of [[34, 128, 0.2], [47, 138, -0.15], [-30, 150, 0.6]]) {
    const b = new THREE.Mesh(hull, boatMat);
    b.position.set(bx, 0.5, bz);
    b.rotation.y = ry;
    const stripe = new THREE.Mesh(hull, bandMat);
    stripe.scale.set(1.02, 0.2, 1.01);
    stripe.position.y = -0.15;
    b.add(stripe);
    scene.add(b);
  }
  // swimmers' buoys line
  for (let x = -100; x <= 100; x += 8) lines.add(x, 0.2, 118, 0.6, 0.4, 0.6, 0, '#f4f0e8');

  // street lamps along avenues
  for (const p of ROADS) {
    for (let t = -70; t <= 70; t += 20) {
      if (Math.abs(t) < 22 && Math.abs(p) < 1) continue;
      lamp(p + ROAD_W / 2 + 1, t + 10);
    }
  }
  // palms along the central avenue
  for (let z = 26; z <= 76; z += 10) {
    palm(-ROAD_W / 2 - 1.6, z);
    palm(ROAD_W / 2 + 1.6, z);
  }

  for (const b of [bodies, glass, details, windows, flats, lines, trunks, fronds, lamps]) {
    const mesh = b.build();
    if (mesh) scene.add(mesh);
  }

  // welcome sign
  const signTex = own(labelTexture(
    [
      { text: 'NABEUL', font: '400 64px "Instrument Serif", serif', color: '#0f1b2d' },
      { text: 'نابل  ·  TUNISIA', font: '500 22px Manrope, sans-serif', color: '#c0532b' },
    ],
    { bg: '#f4f0e8', w: 420, h: 150 },
  ));
  const sign = new THREE.Mesh(own(new THREE.PlaneGeometry(12, 4.3)), own(new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })));
  sign.position.set(-13, 4.6, 74);
  sign.rotation.y = Math.PI / 6;
  scene.add(sign);
  bodies.add(-13, 0, 74, 0.4, 2.5, 0.4, 0, '#5b6577');

  // ---- checkpoints
  const ringGeo = own(new THREE.RingGeometry(4.2, 5, 48));
  const discGeo = own(new THREE.CircleGeometry(4.2, 48));
  const beaconGeo = own(new THREE.CylinderGeometry(0.16, 0.16, 7, 8));
  const gemGeo = own(new THREE.OctahedronGeometry(0.9));
  const discMat = own(new THREE.MeshBasicMaterial({ color: COLORS.terra, transparent: true, opacity: 0.16, depthWrite: false }));
  const checkpoints: CheckpointVisual[] = CHECKPOINTS.map((cp, i) => {
    const material = own(new THREE.MeshBasicMaterial({ color: COLORS.terra }));
    const ring = new THREE.Mesh(ringGeo, material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(cp.x, 0.09, cp.z);
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(cp.x, 0.08, cp.z);
    const beacon = new THREE.Mesh(beaconGeo, material);
    beacon.position.set(cp.x + 5.6, 3.5, cp.z);
    const gem = new THREE.Mesh(gemGeo, material);
    gem.position.set(cp.x + 5.6, 7.8, cp.z);
    const tex = own(labelTexture(
      [{ text: cp.label, font: '600 30px Manrope, sans-serif', color: '#f4f0e8' }],
      { bg: '#0f1b2d', w: 360, h: 72, badge: String(i + 1).padStart(2, '0') },
    ));
    const label = new THREE.Sprite(own(new THREE.SpriteMaterial({ map: tex, depthWrite: false })));
    label.scale.set(9, 1.8, 1);
    label.position.set(cp.x, 10.4, cp.z);
    scene.add(ring, disc, beacon, gem, label);
    return { cp, ring, beacon, gem, label, material };
  });

  return {
    scene,
    colliders,
    checkpoints,
    update(time: number) {
      for (const [i, c] of checkpoints.entries()) {
        const s = 1 + Math.sin(time * 2.2 + i) * 0.05;
        c.ring.scale.set(s, s, 1);
        c.gem.rotation.y = time * 1.4 + i;
        c.gem.position.y = 7.8 + Math.sin(time * 1.8 + i) * 0.35;
        c.label.position.y = 10.4 + Math.sin(time * 1.5 + i) * 0.25;
      }
    },
    markVisited(id: SectionId) {
      const c = checkpoints.find((v) => v.cp.id === id);
      c?.material.color.set(COLORS.blue);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
      scene.traverse((o) => {
        if (o instanceof THREE.InstancedMesh) o.dispose();
      });
    },
  };
}
