import { ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CleCoupe } from '../three/cle-coupe';
import { CLE_PAINTS, PaintOption } from '../three/paints';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

const PAINTS = CLE_PAINTS;

/** Interactive 3D turntable of the Mercedes-Benz CLE Coupé. Three.js is loaded only when the section is near. */
@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section garage" id="garage">
      <div class="container">
        <app-section-header index="The drive" eyebrow="Mercedes-Benz CLE Coupé" icon="car"
          title="Grand-touring the Cap Bon coast."
          lead="Elegant, precise and quietly powerful the qualities I aim for in software are the ones I enjoy on the road. Spin it, pick a finish, then take it through Nabeul." />

        <div class="stage" reveal>
          <div class="viewport" #viewport (pointerdown)="dragStart($event)">
            <canvas #canvas aria-label="3D model of a Mercedes-Benz CLE Coupé. Drag to rotate."></canvas>
            @if (!ready()) {
              <div class="placeholder"><span class="mono">Preparing the garage</span></div>
            }
            <span class="hint mono"><app-icon name="rotate" [size]="14" /> Drag to rotate</span>
          </div>

          <aside class="spec">
            <span class="mono label">Finish</span>
            <strong class="serif paint">{{ paint().name }}</strong>
            <div class="swatches" role="radiogroup" aria-label="Paint finish">
              @for (p of paints; track p.id) {
                <button role="radio" [attr.aria-checked]="paint().id === p.id" [class.on]="paint().id === p.id"
                  [style.background]="p.hex" (click)="setPaint(p)" [attr.aria-label]="p.name"></button>
              }
            </div>
            <dl>
              @for (s of specs; track s.k) {
                <div><dt class="mono">{{ s.k }}</dt><dd>{{ s.v }}</dd></div>
              }
            </dl>
            <a class="btn accent" routerLink="/drive"><app-icon name="navigation" [size]="18" /> Take it for a drive</a>
          </aside>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .garage { background: var(--paper-2); }
    .stage { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
    .viewport { position: relative; aspect-ratio: 16 / 10; border-radius: var(--radius); background: var(--paper-3); overflow: hidden; cursor: grab; touch-action: pan-y; }
    .viewport:active { cursor: grabbing; }
    canvas { width: 100%; height: 100%; display: block; }
    .placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: #5b6577; }
    .hint { position: absolute; left: 18px; bottom: 16px; display: inline-flex; gap: 8px; align-items: center; color: #5b6577; font-size: 11px; }
    .spec { background: var(--ink); color: var(--paper); border-radius: var(--radius); padding: 28px; display: flex; flex-direction: column; gap: 14px; }
    .label { color: #9aa7ba; font-size: 11px; }
    .paint { font-size: 34px; line-height: 1; font-weight: 400; }
    .swatches { display: flex; gap: 10px; margin-bottom: 8px; }
    .swatches button { width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--ink); outline: 1px solid #3b4d68; transition: outline-color .3s, transform .3s var(--ease); }
    .swatches button:hover { transform: scale(1.1); }
    .swatches button.on { outline: 2px solid var(--terra); }
    dl { margin: 0 0 auto; display: grid; }
    dl div { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-top: 1px solid #2b3d57; }
    dt { color: #9aa7ba; font-size: 11px; }
    dd { margin: 0; font-weight: 600; text-align: right; font-size: 14px; }
    .btn { justify-content: center; }
    @container (max-width: 900px) { .stage { grid-template-columns: 1fr; } .viewport { aspect-ratio: 4 / 3; } }
  `,
})
export class GarageComponent implements OnInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');

  protected readonly paints = PAINTS;
  protected readonly paint = signal(PAINTS[0]);
  protected readonly ready = signal(false);
  protected readonly specs = [
    { k: 'Model', v: 'Mercedes-Benz CLE' },
    { k: 'Body', v: 'Two-door coupé' },
    { k: 'Seating', v: '4 seats' },
    { k: 'Transmission', v: '9G-TRONIC automatic' },
    { k: 'Home roads', v: 'Nabeul · Cap Bon' },
  ];

  private car?: CleCoupe;
  private yaw = -0.6;
  private velocity = 0.0035;
  private dragging = false;
  private lastX = 0;
  private cleanup: (() => void)[] = [];
  private observer?: IntersectionObserver;
  private visible = false;

  ngOnInit(): void {
    const host = this.viewport().nativeElement;
    this.observer = new IntersectionObserver(
      ([e]) => {
        this.visible = e.isIntersecting;
        if (e.isIntersecting && !this.car) this.zone.runOutsideAngular(() => this.init());
      },
      { rootMargin: '400px 0px' },
    );
    this.observer.observe(host);
  }

  private async init(): Promise<void> {
    const THREE = await import('three');
    const { buildCleCoupe, createEnvironment } = await import('../three/cle-coupe');
    const canvas = this.canvas().nativeElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    scene.environment = await createEnvironment(renderer);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(7.4, 2.6, 7.4);
    camera.lookAt(0, 0.6, 0);

    const sun = new THREE.DirectionalLight('#fff4e2', 2.2);
    sun.position.set(4, 8, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
    scene.add(sun, new THREE.HemisphereLight('#ffffff', '#c9bfae', 0.6));

    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 72), new THREE.MeshStandardMaterial({ color: '#d6cdbc', roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    const ring = new THREE.Mesh(new THREE.RingGeometry(4.15, 4.2, 96), new THREE.MeshBasicMaterial({ color: '#c0532b' }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(floor, ring);

    this.car = buildCleCoupe(this.paint().hex);
    scene.add(this.car.group);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 1.2 ? 38 : 30;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!this.visible || document.hidden) return;
      if (!this.dragging) {
        this.velocity += (0.0035 - this.velocity) * 0.02;
        this.yaw += this.velocity;
      }
      this.car!.group.rotation.y = this.yaw;
      renderer.render(scene, camera);
    };
    loop();
    this.zone.run(() => this.ready.set(true));

    this.cleanup.push(() => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      this.car?.dispose();
      scene.environment?.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      renderer.dispose();
    });
  }

  protected dragStart(e: PointerEvent): void {
    this.dragging = true;
    this.lastX = e.clientX;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - this.lastX;
      this.lastX = ev.clientX;
      this.velocity = dx * 0.008;
      this.yaw += this.velocity;
    };
    const up = () => {
      this.dragging = false;
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
    };
    this.zone.runOutsideAngular(() => {
      addEventListener('pointermove', move);
      addEventListener('pointerup', up);
    });
  }

  protected setPaint(p: PaintOption): void {
    this.paint.set(p);
    this.car?.setPaint(p.hex);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.cleanup.forEach((fn) => fn());
  }
}
