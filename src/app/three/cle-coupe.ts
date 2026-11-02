import * as THREE from 'three';

import { CLE_PAINTS } from './paints';

export { CLE_PAINTS } from './paints';
export type { PaintOption } from './paints';

export interface CleCoupe {
  group: THREE.Group;
  paint: THREE.MeshPhysicalMaterial;
  /** Front wheel pivots (steer around Y). */
  steer: THREE.Object3D[];
  /** Every wheel (spin around local Z). */
  wheels: THREE.Object3D[];
  brake: THREE.MeshBasicMaterial;
  setPaint(hex: string): void;
  dispose(): void;
}

const WHEEL_R = 0.35;
const TRACK = 0.84;
const WHEELBASE_F = 1.43;
const WHEELBASE_R = -1.43;

/**
 * Procedural Mercedes-Benz CLE Coupé: a long-bonnet, fastback two-door silhouette
 * with the model's full-width rear light band, built from extruded side profiles.
 * Units are metres; the car faces +X and sits on y = 0.
 */
export function buildCleCoupe(initialPaint = CLE_PAINTS[0].hex): CleCoupe {
  const group = new THREE.Group();
  group.name = 'CLE Coupé';
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x);

  const paint = track(new THREE.MeshPhysicalMaterial({
    color: initialPaint, metalness: 0.65, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08,
  }));
  const glass = track(new THREE.MeshPhysicalMaterial({ color: '#0d141d', metalness: 0.2, roughness: 0.05, clearcoat: 1 }));
  const trim = track(new THREE.MeshStandardMaterial({ color: '#0b0d10', metalness: 0.3, roughness: 0.6 }));
  const chrome = track(new THREE.MeshStandardMaterial({ color: '#d9dde2', metalness: 1, roughness: 0.18 }));
  const tyre = track(new THREE.MeshStandardMaterial({ color: '#111316', roughness: 0.92 }));
  const rim = track(new THREE.MeshStandardMaterial({ color: '#9aa2ad', metalness: 0.9, roughness: 0.3 }));
  const lightWhite = track(new THREE.MeshBasicMaterial({ color: '#f4f0e8' }));
  const brake = track(new THREE.MeshBasicMaterial({ color: '#8c0f15' }));

  // ---- lower body: side profile with wheel arches, extruded across the width
  const body = new THREE.Shape();
  body.moveTo(-2.38, 0.3);
  body.lineTo(-2.46, 0.55);
  body.lineTo(-2.43, 0.84);
  body.quadraticCurveTo(-2.37, 0.97, -2.12, 0.99);
  body.lineTo(-1.5, 1.0);
  body.lineTo(1.25, 0.97);
  body.quadraticCurveTo(2.02, 0.9, 2.34, 0.74);
  body.quadraticCurveTo(2.5, 0.63, 2.46, 0.42);
  body.lineTo(2.38, 0.27);
  body.lineTo(WHEELBASE_F + 0.47, 0.25);
  body.absarc(WHEELBASE_F, WHEEL_R, 0.47, 0, Math.PI, false);
  body.lineTo(WHEELBASE_R + 0.47, 0.25);
  body.absarc(WHEELBASE_R, WHEEL_R, 0.47, 0, Math.PI, false);
  body.lineTo(-2.38, 0.3);

  const bodyWidth = 1.72;
  const bodyGeo = track(new THREE.ExtrudeGeometry(body, {
    depth: bodyWidth, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1, bevelSegments: 5, curveSegments: 24,
  }));
  bodyGeo.translate(0, 0, -bodyWidth / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, paint);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // ---- greenhouse: fastback glass canopy
  const cabin = new THREE.Shape();
  cabin.moveTo(-1.62, 0.97);
  cabin.quadraticCurveTo(-0.95, 1.37, -0.25, 1.41);
  cabin.lineTo(0.2, 1.41);
  cabin.quadraticCurveTo(0.62, 1.38, 1.26, 0.97);
  cabin.lineTo(-1.62, 0.97);
  const cabinWidth = 1.36;
  const cabinGeo = track(new THREE.ExtrudeGeometry(cabin, {
    depth: cabinWidth, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.07, bevelSegments: 4, curveSegments: 20,
  }));
  cabinGeo.translate(0, 0, -cabinWidth / 2);
  const cabinMesh = new THREE.Mesh(cabinGeo, glass);
  cabinMesh.castShadow = true;
  group.add(cabinMesh);

  // body-coloured roof panel over the glass
  const roof = new THREE.Shape();
  roof.moveTo(-0.95, 1.37);
  roof.quadraticCurveTo(-0.6, 1.415, -0.25, 1.425);
  roof.lineTo(0.2, 1.425);
  roof.quadraticCurveTo(0.42, 1.42, 0.56, 1.39);
  roof.lineTo(0.5, 1.36);
  roof.lineTo(-0.9, 1.34);
  const roofWidth = 1.2;
  const roofGeo = track(new THREE.ExtrudeGeometry(roof, { depth: roofWidth, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }));
  roofGeo.translate(0, 0.01, -roofWidth / 2);
  group.add(new THREE.Mesh(roofGeo, paint));

  // ---- details
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => {
    const g = track(new THREE.BoxGeometry(w, h, d));
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    group.add(m);
    return m;
  };

  // diamond grille + three-pointed star badge
  box(0.06, 0.26, 0.86, trim, 2.53, 0.55, 0);
  box(0.065, 0.02, 0.8, chrome, 2.54, 0.6, 0);
  const badge = new THREE.Mesh(track(new THREE.TorusGeometry(0.075, 0.012, 8, 32)), chrome);
  badge.position.set(2.57, 0.6, 0);
  badge.rotation.y = Math.PI / 2;
  group.add(badge);
  for (let i = 0; i < 3; i++) {
    const arm = box(0.012, 0.07, 0.012, chrome, 2.57, 0.6, 0);
    arm.geometry.translate(0, 0.035, 0);
    arm.rotation.x = (i * Math.PI * 2) / 3;
  }

  // slim LED headlights
  for (const z of [-0.68, 0.68]) {
    const h = box(0.08, 0.06, 0.36, lightWhite, 2.42, 0.74, z);
    h.rotation.y = z > 0 ? -0.35 : 0.35;
  }
  // signature full-width rear light band
  box(0.05, 0.05, 1.7, brake, -2.5, 0.88, 0);
  box(0.04, 0.12, 1.86, trim, -2.5, 0.38, 0); // rear diffuser
  box(0.04, 0.1, 1.9, trim, 2.52, 0.33, 0); // front splitter
  // mirrors
  for (const z of [-0.98, 0.98]) box(0.2, 0.1, 0.16, paint, 0.98, 1.06, z);
  // side sill
  for (const z of [-0.93, 0.93]) box(2.0, 0.07, 0.04, trim, 0, 0.32, z);
  // door handles (flush)
  for (const z of [-0.95, 0.95]) box(0.18, 0.025, 0.02, chrome, -0.25, 0.92, z);

  // ---- wheels: 5 twin-spoke rims
  const tyreGeo = track(new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.25, 36));
  tyreGeo.rotateX(Math.PI / 2);
  const rimGeo = track(new THREE.CylinderGeometry(0.24, 0.24, 0.262, 32));
  rimGeo.rotateX(Math.PI / 2);
  const spokeGeo = track(new THREE.BoxGeometry(0.035, 0.21, 0.03));
  spokeGeo.translate(0, 0.105, 0);
  const hubGeo = track(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 16));
  hubGeo.rotateX(Math.PI / 2);

  const steer: THREE.Object3D[] = [];
  const wheels: THREE.Object3D[] = [];
  for (const x of [WHEELBASE_F, WHEELBASE_R]) {
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, WHEEL_R, side * TRACK);
      const wheel = new THREE.Group();
      const t = new THREE.Mesh(tyreGeo, tyre);
      t.castShadow = true;
      wheel.add(t);
      wheel.add(new THREE.Mesh(rimGeo, trim));
      for (let s = 0; s < 5; s++) {
        for (const off of [-0.04, 0.04]) {
          const spoke = new THREE.Mesh(spokeGeo, rim);
          spoke.rotation.z = (s * Math.PI * 2) / 5 + off;
          spoke.position.z = side * 0.135;
          wheel.add(spoke);
        }
      }
      const hub = new THREE.Mesh(hubGeo, chrome);
      wheel.add(hub);
      pivot.add(wheel);
      group.add(pivot);
      wheels.push(wheel);
      if (x > 0) steer.push(pivot);
    }
  }

  // contact shadow under the car (solid, translucent)
  const shadowMat = track(new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false }));
  const shadow = new THREE.Mesh(track(new THREE.PlaneGeometry(5.1, 2.1)), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  group.add(shadow);

  return {
    group,
    paint,
    steer,
    wheels,
    brake,
    setPaint: (hex: string) => paint.color.set(hex),
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

/** Shared studio-style environment map for believable paint reflections. */
export async function createEnvironment(renderer: THREE.WebGLRenderer): Promise<THREE.Texture> {
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();
  return env;
}
