import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { FEATURED } from '../core/data/profile.data';
import { FeaturedItem } from '../core/models/profile.models';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

/** Solid-color cover compositions one per project, no gradients. */
const COVERS = [
  { bg: 'var(--terra)', fg: 'var(--paper)', shape: 'arch' },
  { bg: 'var(--ink)', fg: 'var(--paper)', shape: 'frames' },
  { bg: 'var(--blue)', fg: 'var(--paper)', shape: 'pins' },
  { bg: 'var(--sand)', fg: 'var(--ink)', shape: 'grid' },
];

@Component({
  selector: 'app-featured',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section tone-dark" id="featured">
      <div class="container">
        <app-section-header index="03" eyebrow="Featured" icon="star" title="Selected work." lead="Products and platforms I designed and built open any card for the details." />
        <ul class="list">
          @for (f of items; track f.title; let i = $index) {
            <li reveal [revealDelay]="(i % 2) * 100">
              <button class="card" (click)="open.set(i)" [attr.aria-label]="'Open details for ' + f.title">
                <div class="cover" [style.background]="covers[i].bg" [style.color]="covers[i].fg">
                  <svg viewBox="0 0 400 240" aria-hidden="true">
                    @switch (covers[i].shape) {
                      @case ('arch') { <path d="M140 240V130a60 60 0 0 1 120 0v110" fill="none" stroke="currentColor" stroke-width="2"/><path d="M170 240v-96a30 30 0 0 1 60 0v96" fill="currentColor" opacity=".9"/> }
                      @case ('frames') { @for (k of [0,1,2]; track k) { <rect [attr.x]="90 + k * 40" [attr.y]="40 + k * 22" width="160" height="110" rx="8" fill="none" stroke="currentColor" stroke-width="2"/> } <path d="M210 120l30 18-30 18z" fill="currentColor"/> }
                      @case ('pins') { <path d="M60 180h280M100 60v150M300 40v170M200 30v190" stroke="currentColor" stroke-width="1" opacity=".5"/> @for (p of [[110,100],[210,150],[290,80]]; track $index) { <circle [attr.cx]="p[0]" [attr.cy]="p[1]" r="14" fill="currentColor"/> } }
                      @case ('grid') { @for (k of [0,1,2,3,4,5]; track k) { <rect [attr.x]="110 + (k % 3) * 62" [attr.y]="50 + (k > 2 ? 72 : 0)" width="52" height="60" rx="6" [attr.fill]="k === 1 ? 'var(--terra)' : 'none'" stroke="currentColor" stroke-width="2"/> } }
                    }
                  </svg>
                  <span class="kind mono">{{ f.kind }}</span>
                  <span class="go"><app-icon name="arrow-up-right" [size]="20" /></span>
                </div>
                <div class="info">
                  <h3 class="serif">{{ f.title }}</h3>
                  <p>{{ f.subtitle }}</p>
                  <div class="stack">
                    @for (t of f.stack; track t) { <span class="chip">{{ t }}</span> }
                  </div>
                </div>
              </button>
            </li>
          }
        </ul>
      </div>

      @if (current(); as f) {
        <div class="modal-backdrop" (click)="open.set(null)"></div>
        <article class="modal tone-dark" role="dialog" aria-modal="true" [attr.aria-label]="f.title">
          <button class="close" (click)="open.set(null)" aria-label="Close"><app-icon name="x" [size]="20" /></button>
          <span class="mono kind2">{{ f.kind }} {{ f.subtitle }}</span>
          <h3 class="serif">{{ f.title }}</h3>
          <p>{{ f.description }}</p>
          <ul class="hl">
            @for (h of f.highlights; track h) { <li><app-icon name="check" [size]="18" /> {{ h }}</li> }
          </ul>
          <div class="stack">
            @for (t of f.stack; track t) { <span class="chip">{{ t }}</span> }
          </div>
          <div class="nav">
            <button class="btn ghost sm" (click)="step(-1)"><app-icon name="arrow-left" [size]="16" /> Previous</button>
            <button class="btn sm" (click)="step(1)">Next <app-icon name="arrow-right" [size]="16" /></button>
          </div>
        </article>
      }
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .card { width: 100%; text-align: left; display: block; border-radius: var(--radius); overflow: hidden; background: var(--surface); border: 1px solid var(--line); transition: border-color .4s; }
    .card:hover { border-color: var(--accent); }
    .cover { position: relative; aspect-ratio: 16 / 9; overflow: hidden; }
    .cover svg { position: absolute; inset: 0; width: 100%; height: 100%; transition: transform 1s var(--ease); }
    .card:hover .cover svg { transform: scale(1.06); }
    .kind { position: absolute; left: 20px; top: 18px; font-size: 11px; }
    .go { position: absolute; right: 18px; top: 14px; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--paper); color: var(--ink); transform: scale(.85); transition: transform .4s var(--ease); }
    .card:hover .go { transform: scale(1) rotate(45deg); }
    .info { padding: 24px 26px 28px; display: grid; gap: 8px; }
    h3 { font-size: clamp(30px, 3vw, 40px); line-height: 1; }
    .info p { color: var(--fg-muted); }
    .stack { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }

    .modal-backdrop { position: fixed; inset: 0; z-index: 300; background: rgba(8, 14, 24, .7); animation: fade .3s var(--ease); }
    .modal { position: fixed; z-index: 301; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(640px, calc(100% - 32px)); max-height: calc(100svh - 48px); overflow-y: auto;
      padding: clamp(28px, 4vw, 44px); border-radius: 22px; border: 1px solid var(--line); background: var(--surface); animation: pop .4s var(--ease); }
    .modal h3 { font-size: clamp(40px, 5vw, 56px); margin: 10px 0 16px; }
    .modal p { color: var(--fg-muted); line-height: 1.7; }
    .kind2 { color: var(--accent); font-size: 11px; }
    .hl { display: grid; gap: 12px; margin: 24px 0; }
    .hl li { display: flex; gap: 12px; align-items: start; }
    .hl app-icon { color: var(--accent); margin-top: 2px; }
    .close { position: absolute; right: 16px; top: 16px; width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); display: grid; place-items: center; }
    .nav { display: flex; justify-content: space-between; margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--line); }
    .nav .btn:not(.ghost) { --btn-bg: var(--paper); --btn-fg: var(--ink); }
    @keyframes fade { from { opacity: 0; } }
    @keyframes pop { from { opacity: 0; transform: translate(-50%, -46%); } }
    @container (max-width: 760px) { .list { grid-template-columns: 1fr; } }
  `,
})
export class FeaturedComponent {
  protected readonly items = FEATURED;
  protected readonly covers = COVERS;
  protected readonly open = signal<number | null>(null);

  protected current(): FeaturedItem | null {
    const i = this.open();
    return i === null ? null : this.items[i];
  }

  protected step(d: number): void {
    const i = this.open();
    if (i !== null) this.open.set((i + d + this.items.length) % this.items.length);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.open() === null) return;
    if (e.key === 'Escape') this.open.set(null);
    if (e.key === 'ArrowRight') this.step(1);
    if (e.key === 'ArrowLeft') this.step(-1);
  }
}
