import { ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

interface Block { x: number; w: number; h: number; windows: { x: number; y: number; w: number; h: number }[]; door?: number; roof?: boolean }

/** Deterministic PRNG so the skyline is identical on every render. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GROUND = 470;
const KEEP_CLEAR = [[340, 440], [770, 880], [1120, 1220]]; // minaret, jar monument, glass tower

function buildRow(seed: number, minH: number, maxH: number, windows: boolean): Block[] {
  const r = rng(seed);
  const out: Block[] = [];
  let x = -20;
  while (x < 1620) {
    const w = 46 + Math.round(r() * 70);
    const h = minH + Math.round(r() * (maxH - minH));
    const clear = windows && KEEP_CLEAR.some(([a, b]) => x + w > a && x < b);
    if (!clear) {
      const wins: Block['windows'] = [];
      if (windows) {
        const cols = Math.max(1, Math.floor((w - 14) / 16));
        const rows = Math.max(1, Math.floor((h - 40) / 24));
        const gx = (w - cols * 16) / 2 + 4;
        for (let row = 0; row < rows; row++) {
          for (let c = 0; c < cols; c++) {
            if (r() > 0.18) wins.push({ x: x + gx + c * 16, y: GROUND - h + 14 + row * 24, w: 8, h: 12 });
          }
        }
      }
      out.push({ x, w, h, windows: wins, door: windows && r() > 0.5 ? x + w / 2 : undefined, roof: r() > 0.5 });
    }
    x += w + (windows ? 6 + Math.round(r() * 10) : 2);
  }
  return out;
}

@Component({
  selector: 'app-nabeul',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section tone-dark nabeul" id="nabeul">
      <div class="container">
        <app-section-header index="Home base" eyebrow="Nabeul, Tunisia" icon="map-pin"
          title="A modern Mediterranean city with a craftsman’s soul."
          lead="Capital of the Cap Bon governorate on the Gulf of Hammamet, Nabeul is a contemporary coastal city of avenues, a seafront corniche and a renowned ceramics tradition. It is where I live, work and build." />
      </div>

      <div class="scene" reveal>
        <svg viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustrated skyline of Nabeul with the Jar monument, a minaret, modern buildings, palm-lined corniche, the sea and a Mercedes-Benz CLE Coupé">
          <circle cx="1360" cy="150" r="64" class="sun" />

          <g class="layer far">
            @for (b of far; track $index) {
              <rect [attr.x]="b.x" [attr.y]="GROUND - b.h - 40" [attr.width]="b.w" [attr.height]="b.h + 40" />
            }
          </g>

          <g class="layer mid">
            @for (b of mid; track $index) {
              <rect class="wall" [attr.x]="b.x" [attr.y]="GROUND - b.h" [attr.width]="b.w" [attr.height]="b.h" />
              @if (b.roof) { <rect class="parapet" [attr.x]="b.x - 3" [attr.y]="GROUND - b.h - 6" [attr.width]="b.w + 6" height="6" /> }
              @for (w of b.windows; track $index) {
                <rect class="win" [attr.x]="w.x" [attr.y]="w.y" [attr.width]="w.w" [attr.height]="w.h" />
              }
              @if (b.door) {
                <path class="door" [attr.d]="'M' + (b.door - 9) + ' ' + GROUND + 'v-22a9 9 0 0 1 18 0v22z'" />
              }
            }

            <!-- Great Mosque minaret: square Maghrebi tower -->
            <g class="minaret">
              <rect x="300" y="380" width="170" height="90" class="stone" />
              <path d="M330 380a55 40 0 0 1 110 0z" class="stone" />
              <rect x="365" y="190" width="46" height="280" class="stone" />
              <rect x="361" y="186" width="54" height="8" class="stone-dark" />
              <rect x="374" y="150" width="28" height="40" class="stone" />
              <path d="M374 150a14 14 0 0 1 28 0z" class="tile" />
              <rect x="386" y="126" width="3" height="14" class="stone-dark" />
              @for (y of [220, 270, 320]; track y) {
                <path [attr.d]="'M381 ' + (y + 22) + 'v-14a7 7 0 0 1 14 0v14z'" class="win" />
              }
            </g>

            <!-- Place de la Jarre: Nabeul's monumental pottery jar -->
            <g class="jar">
              <rect x="780" y="440" width="90" height="30" class="plinth" />
              <rect x="792" y="428" width="66" height="14" class="plinth" />
              <path d="M802 428c-26-30-30-78-4-118 6-10 8-18 6-26h42c-2 8 0 16 6 26 26 40 22 88-4 118z" class="clay" />
              <rect x="800" y="276" width="50" height="10" rx="3" class="clay-dark" />
              <path d="M806 330h38M799 352h52M800 378h50" class="band" />
              <path d="M808 300c-22-4-26 22-6 30M842 300c22-4 26 22 6 30" class="handle" />
            </g>

            <!-- Contemporary glass tower -->
            <g class="tower">
              <rect x="1130" y="170" width="84" height="300" class="glass" />
              @for (y of floors; track y) {
                <rect x="1130" [attr.y]="y" width="84" height="3" class="slab" />
              }
              <rect x="1168" y="140" width="8" height="30" class="slab" />
            </g>
          </g>

          <!-- Corniche: palms, lamps, road, sea -->
          <g class="layer front">
            <rect x="0" y="470" width="1600" height="16" class="kerb" />
            @for (p of palms; track p) {
              <g [attr.transform]="'translate(' + p + ' 470)'">
                <path d="M-3 0c2-40 6-80 2-118h5c3 38 0 78-1 118z" class="trunk" />
                <path d="M2-118c-24-14-48-8-62 8 20-6 40-4 62-8zM2-118c22-16 48-12 62 4-20-4-40-2-62-4zM2-118c-12-22-34-30-52-24 18 4 34 12 52 24zM2-118c10-24 32-34 52-28-18 4-34 14-52 28zM2-118c-4-20 2-38 14-48-6 14-10 30-14 48z" class="frond" />
              </g>
            }
            @for (l of lamps; track l) {
              <g [attr.transform]="'translate(' + l + ' 470)'">
                <rect x="-1.5" y="-70" width="3" height="70" class="lamp" />
                <rect x="-10" y="-72" width="14" height="4" class="lamp" />
              </g>
            }
            <rect x="0" y="486" width="1600" height="48" class="road" />
            <path class="lane" d="M0 510h1600" />
            <g class="car">
              <g transform="translate(0 532)">
                <path class="body" d="M-83 -10L-86 -19L-85 -30Q-83 -34.5 -74 -35L-54 -35Q-31 -49 -7 -50L9 -50Q23 -48.5 45.5 -34Q72 -31 82.6 -26Q87.5 -22 86 -15L83 -10L67 -9A16.5 16.5 0 0 0 34 -9L-33 -9A16.5 16.5 0 0 0 -66 -9Z" />
                <path class="glass-car" d="M-50 -36Q-30 -46.5 -7 -47.5L8 -47.5Q21 -46.5 40 -36Z" />
                <rect x="-87" y="-31" width="5" height="3" class="tail" />
                <rect x="79" y="-27" width="6" height="3" class="head" />
                <circle cx="50.5" cy="-10" r="12.5" class="tyre" /><circle cx="50.5" cy="-10" r="7.5" class="rim" />
                <circle cx="-49.5" cy="-10" r="12.5" class="tyre" /><circle cx="-49.5" cy="-10" r="7.5" class="rim" />
              </g>
            </g>
            <rect x="0" y="534" width="1600" height="14" class="beach" />
            <rect x="0" y="548" width="1600" height="60" class="sea" />
            @for (w of waves; track $index) {
              <rect [attr.x]="w.x" [attr.y]="w.y" [attr.width]="w.w" height="2" class="wave" />
            }
          </g>
        </svg>
      </div>

      <div class="container">
        <ul class="facts">
          @for (f of facts; track f.title; let i = $index) {
            <li reveal [revealDelay]="i * 80">
              <app-icon [name]="f.icon" [size]="20" />
              <strong class="serif">{{ f.title }}</strong>
              <span>{{ f.text }}</span>
            </li>
          }
        </ul>
        <a class="btn accent" routerLink="/drive" reveal>
          <app-icon name="navigation" [size]="18" /> Explore the city behind the wheel <app-icon name="arrow-right" [size]="18" />
        </a>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .nabeul { overflow: hidden; }
    .scene { width: 100%; height: clamp(320px, 46vw, 620px); margin: 8px 0 clamp(40px, 6vw, 80px); }
    svg { width: 100%; height: 100%; display: block; }
    .layer { transform: translateX(calc(var(--p, 0) * var(--depth, 0px))); transition: transform .1s linear; }
    .far { --depth: -30px; } .mid { --depth: -70px; } .front { --depth: 0px; }
    .sun { fill: var(--terra); }
    .far rect { fill: #1b2b42; }
    .wall { fill: #ece6da; } .parapet { fill: #d9d1c2; }
    .win { fill: var(--blue); } .door { fill: var(--blue-deep); }
    .stone { fill: #e3d6bd; } .stone-dark { fill: #c9b896; } .tile { fill: #4f7a5e; }
    .plinth { fill: #f4f0e8; } .clay { fill: var(--terra); } .clay-dark { fill: var(--terra-deep); }
    .band { stroke: var(--blue); stroke-width: 6; fill: none; }
    .handle { stroke: var(--terra-deep); stroke-width: 6; fill: none; }
    .glass { fill: #2f5577; } .slab { fill: #c9d6e4; }
    .kerb { fill: #d9d1c2; } .trunk { fill: #6b5235; } .frond { fill: #3f6a4c; } .lamp { fill: #9aa7ba; }
    .road { fill: #263548; } .lane { stroke: #f4f0e8; stroke-width: 2; stroke-dasharray: 26 22; }
    .beach { fill: var(--sand); } .sea { fill: var(--blue); } .wave { fill: #4d86c6; }
    .car { animation: drive 16s linear infinite; }
    .car .body { fill: #b9bec4; } .glass-car { fill: #0f1b2d; } .tyre { fill: #0b1220; } .rim { fill: #8d96a3; }
    .tail { fill: #c4161c; } .head { fill: #f4f0e8; }
    @keyframes drive { from { transform: translateX(-120px); } to { transform: translateX(1720px); } }

    .facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; margin-bottom: 40px; }
    .facts li { background: var(--bg); padding: 28px 24px; display: grid; gap: 10px; align-content: start; color: var(--accent); }
    .facts strong { font-size: 30px; line-height: 1.05; color: var(--fg); }
    .facts span { color: var(--fg-muted); font-size: 14px; line-height: 1.6; }
    @container (max-width: 900px) { .facts { grid-template-columns: repeat(2, 1fr); } }
    @container (max-width: 520px) { .facts { grid-template-columns: 1fr; } .btn { width: 100%; justify-content: center; white-space: normal; height: auto; padding: 16px 20px; } }
  `,
})
export class NabeulComponent implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  protected readonly GROUND = GROUND;
  protected readonly far = buildRow(7, 120, 260, false);
  protected readonly mid = buildRow(21, 90, 230, true);
  protected readonly floors = Array.from({ length: 14 }, (_, i) => 180 + i * 21);
  protected readonly palms = [90, 300, 520, 700, 960, 1060, 1290, 1480];
  protected readonly lamps = [200, 420, 620, 900, 1250, 1400];
  protected readonly waves = Array.from({ length: 26 }, (_, i) => ({ x: (i * 173) % 1600, y: 560 + ((i * 37) % 40), w: 40 + ((i * 29) % 60) }));
  protected readonly facts = [
    { icon: 'building' as const, title: 'Cap Bon', text: 'Nabeul is the capital of the Cap Bon governorate in north-eastern Tunisia.' },
    { icon: 'waves' as const, title: 'Gulf of Hammamet', text: 'A Mediterranean seafront city with a corniche, beaches and a marina-side lifestyle.' },
    { icon: 'star' as const, title: 'Ceramics', text: 'Renowned for pottery craftsmanship, celebrated by the monumental jar at the city centre.' },
    { icon: 'briefcase' as const, title: 'Hammamet', text: 'The neighbouring city where most of my professional experience took place.' },
  ];
  private off: () => void = () => {};

  ngOnInit(): void {
    const el = this.host.nativeElement as HTMLElement;
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
      el.style.setProperty('--p', p.toFixed(3));
    };
    this.zone.runOutsideAngular(() => addEventListener('scroll', update, { passive: true }));
    update();
    this.off = () => removeEventListener('scroll', update);
  }

  ngOnDestroy(): void {
    this.off();
  }
}
