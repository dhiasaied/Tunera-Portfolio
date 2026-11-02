import { ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS, EXPERIENCE, IDENTITY, LANGUAGES, SKILL_GROUPS } from '../core/data/profile.data';
import { UiService } from '../core/services/ui.service';
import { IconComponent } from '../shared/icon.component';
import { MagneticDirective } from '../shared/motion.directives';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, IconComponent, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero khatam-bg" [class.go]="ui.introDone()" id="home">
      <div class="container grid">
        <div class="copy">
          <div class="meta mono line"><span>
            <app-icon name="map-pin" [size]="14" /> {{ id.city }}, {{ id.country }}
            <i class="sep"></i> {{ id.coordinates }}
          </span></div>

          <h1 class="name">
            <span class="line"><span>{{ id.firstName }}</span></span>
            <span class="line"><span class="last">{{ id.lastName }}<em>.</em></span></span>
          </h1>

          <p class="role line"><span>
            <strong>{{ id.headline }}</strong> {{ id.summary }}
          </span></p>

          <div class="ctas line"><span>
            <a class="btn accent" routerLink="/drive" magnetic>
              <app-icon name="car" [size]="18" /> Drive through Nabeul <app-icon name="arrow-right" [size]="18" />
            </a>
            <button class="btn ghost" (click)="ui.goTo('about')">Read the profile <app-icon name="arrow-down" [size]="18" /></button>
          </span></div>

          <dl class="stats">
            @for (s of stats; track s.label) {
              <div>
                <dt class="serif">{{ s.shown() }}</dt>
                <dd class="mono">{{ s.label }}</dd>
              </div>
            }
          </dl>
        </div>

        <figure class="portrait" #portrait>
          <span class="arch-back"></span>
          <div class="arch">
            <img [src]="id.photo" [alt]="'Portrait of ' + id.name" width="1024" height="1024" fetchpriority="high" />
          </div>
          <figcaption class="badge">
            <span class="pulse"></span>
            <span>{{ id.availability }}</span>
          </figcaption>
          <a class="seal" routerLink="/drive" aria-label="Drive through Nabeul">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <defs><path id="seal-path" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" /></defs>
              <text><textPath href="#seal-path">TUNÉRA · NABEUL · TUNISIA · DRIVE ·</textPath></text>
            </svg>
            <app-icon name="car" [size]="26" />
          </a>
        </figure>
      </div>

      <button class="scroll-cue mono" (click)="ui.goTo('about')">
        <span class="track"><span class="thumb"></span></span> Scroll
      </button>
    </section>

    <div class="marquee tone-dark" aria-hidden="true">
      <div class="lane">
        @for (rep of [0, 1]; track rep) {
          <div class="row">
            @for (t of marquee; track $index) {
              <span>{{ t }}</span><i></i>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .hero { position: relative; min-height: 100svh; display: flex; align-items: center; padding: calc(var(--nav-h) + 40px) 0 96px; overflow: hidden; background-color: var(--paper); }
    .grid { display: grid; grid-template-columns: 1.2fr .8fr; gap: clamp(32px, 5vw, 88px); align-items: center; }
    .meta { display: flex; color: #5b6577; margin-bottom: 28px; }
    .meta span { display: inline-flex; align-items: center; gap: 8px; }
    .sep { width: 24px; height: 1px; background: var(--line); display: inline-block; margin: 0 6px; }
    .name { font-family: var(--font-display); font-weight: 400; font-size: clamp(64px, 10.5vw, 168px); line-height: .9; letter-spacing: -.02em; margin: 0 0 32px; }
    .name .line { display: block; }
    .last { font-style: italic; }
    .last em { color: var(--terra); font-style: normal; }
    .role { font-size: clamp(17px, 1.5vw, 21px); line-height: 1.55; color: #3f4a5c; max-width: 600px; margin-bottom: 36px; }
    .role strong { color: var(--ink); font-weight: 600; }
    .ctas > span { display: flex; flex-wrap: wrap; gap: 12px; }

    .line { overflow: hidden; }
    .line > span { display: inline-block; transform: translateY(105%); transition: transform 1.1s var(--ease); }
    .go .line > span { transform: none; }
    .go .name .line:nth-child(2) > span { transition-delay: .08s; }
    .go .role > span { transition-delay: .18s; }
    .go .ctas > span { transition-delay: .26s; }

    .stats { display: flex; gap: clamp(24px, 4vw, 56px); margin: 56px 0 0; padding-top: 28px; border-top: 1px solid var(--line); }
    .stats div { margin: 0; }
    .stats dt { font-size: clamp(40px, 4.4vw, 60px); line-height: 1; }
    .stats dd { margin: 8px 0 0; color: #5b6577; font-size: 11px; }

    .portrait { position: relative; margin: 0; justify-self: end; width: min(100%, 460px); aspect-ratio: 4 / 5; opacity: 0; transform: translateY(40px); transition: opacity 1.2s var(--ease) .2s, transform 1.2s var(--ease) .2s; }
    .go .portrait { opacity: 1; transform: none; }
    .arch, .arch-back { position: absolute; inset: 0; border-radius: 999px 999px 18px 18px; }
    .arch-back { background: var(--terra); transform: translate(var(--px, 18px), var(--py, 18px)); transition: transform .6s var(--ease); }
    .arch { overflow: hidden; background: var(--paper-2); border: 6px solid var(--paper); }
    .arch img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; transform: scale(1.06) translate(var(--ix, 0), var(--iy, 0)); transition: transform .8s var(--ease); }
    .badge { position: absolute; left: -28px; bottom: 56px; display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 999px; background: var(--ink); color: var(--paper); font-size: 13px; font-weight: 600; }
    .pulse { width: 8px; height: 8px; border-radius: 50%; background: #6aa0e0; animation: pulse 2s infinite; }
    .seal { position: absolute; right: -36px; top: 22px; width: 120px; height: 120px; display: grid; place-items: center; border-radius: 50%; background: var(--paper); color: var(--ink); border: 1px solid var(--line); }
    .seal svg { position: absolute; inset: 0; animation: spin 18s linear infinite; }
    .seal text { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: .22em; fill: currentColor; }
    .seal:hover { background: var(--ink); color: var(--paper); }

    .scroll-cue { position: absolute; left: 50%; bottom: 28px; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; color: #5b6577; font-size: 11px; }
    .track { width: 1px; height: 40px; background: var(--line); position: relative; overflow: hidden; }
    .thumb { position: absolute; left: 0; top: 0; width: 1px; height: 14px; background: var(--ink); animation: drop 2s var(--ease-in-out) infinite; }

    .marquee { overflow: hidden; padding: 22px 0; border-block: 1px solid var(--line); }
    .lane { display: flex; width: max-content; animation: marquee 48s linear infinite; }
    .row { display: flex; align-items: center; }
    .row span { font-family: var(--font-display); font-size: clamp(28px, 3.6vw, 48px); padding: 0 28px; white-space: nowrap; }
    .row i { width: 10px; height: 10px; transform: rotate(45deg); background: var(--accent); display: inline-block; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 50% { opacity: .35; } }
    @keyframes drop { 0% { transform: translateY(-14px); } 100% { transform: translateY(40px); } }
    @keyframes marquee { to { transform: translateX(-50%); } }

    @media (max-width: 980px) {
      .grid { grid-template-columns: 1fr; }
      .portrait { justify-self: center; width: min(78vw, 400px); order: -1; margin-bottom: 24px; }
      .badge { left: -8px; }
      .seal { right: -8px; width: 96px; height: 96px; }
      .scroll-cue { display: none; }
    }
    @media (max-width: 520px) {
      .stats { gap: 20px; justify-content: space-between; }
      .ctas .btn { width: 100%; justify-content: center; }
    }
  `,
})
export class HeroComponent implements OnInit, OnDestroy {
  protected readonly ui = inject(UiService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  protected readonly id = IDENTITY;
  protected readonly marquee = Array.from(new Set(SKILL_GROUPS.flatMap((g) => g.items))).slice(0, 18);

  protected readonly stats = [
    { label: 'Professional roles', target: EXPERIENCE.length, shown: signal(0) },
    { label: 'Certifications', target: CERTIFICATIONS.length, shown: signal(0) },
    { label: 'Languages', target: LANGUAGES.length, shown: signal(0) },
  ];

  private off: () => void = () => {};

  constructor() {
    effect(() => {
      if (!this.ui.introDone()) return;
      const start = performance.now() + 400;
      const tick = (now: number) => {
        const t = Math.max(0, Math.min(1, (now - start) / 1400));
        const e = 1 - Math.pow(1 - t, 4);
        for (const s of this.stats) s.shown.set(Math.round(s.target * e));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  ngOnInit(): void {
    if (!matchMedia('(pointer: fine)').matches) return;
    const portrait = (this.host.nativeElement as HTMLElement).querySelector('.portrait') as HTMLElement | null;
    if (!portrait) return;
    const move = (e: PointerEvent) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      portrait.style.setProperty('--px', `${18 + x * 22}px`);
      portrait.style.setProperty('--py', `${18 + y * 22}px`);
      portrait.style.setProperty('--ix', `${-x * 10}px`);
      portrait.style.setProperty('--iy', `${-y * 10}px`);
    };
    this.zone.runOutsideAngular(() => addEventListener('pointermove', move, { passive: true }));
    this.off = () => removeEventListener('pointermove', move);
  }

  ngOnDestroy(): void {
    this.off();
  }
}
