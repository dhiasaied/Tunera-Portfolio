import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, NgZone, OnDestroy, computed, inject, signal, viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SECTIONS } from '../core/data/profile.data';
import { SectionId } from '../core/models/profile.models';
import { AboutComponent } from '../sections/about.component';
import { ActivityComponent } from '../sections/activity.component';
import { CertificationsComponent } from '../sections/certifications.component';
import { ContactComponent } from '../sections/contact.component';
import { EducationComponent } from '../sections/education.component';
import { ExperienceComponent } from '../sections/experience.component';
import { FeaturedComponent } from '../sections/featured.component';
import { LanguagesComponent } from '../sections/languages.component';
import { ServicesComponent } from '../sections/services.component';
import { SkillsComponent } from '../sections/skills.component';
import { IconComponent } from '../shared/icon.component';
import { CHECKPOINTS } from '../three/nabeul-world';
import type { Control, DriveEngine } from '../three/drive-engine';

@Component({
  selector: 'app-drive-page',
  standalone: true,
  imports: [
    RouterLink, IconComponent, AboutComponent, ServicesComponent, FeaturedComponent, ActivityComponent, ExperienceComponent,
    EducationComponent, CertificationsComponent, SkillsComponent, LanguagesComponent, ContactComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="drive">
      <canvas #canvas class="world" aria-label="Interactive 3D city of Nabeul. Drive the car to checkpoints to open portfolio sections."></canvas>

      @if (failed()) {
        <div class="overlay tone-dark">
          <div class="card">
            <h1 class="serif">3D isn’t available on this device.</h1>
            <p>Your browser could not start WebGL. The full portfolio is still one click away.</p>
            <a class="btn accent" routerLink="/">Read the profile <app-icon name="arrow-right" [size]="18" /></a>
          </div>
        </div>
      }

      <!-- top bar -->
      <header class="top">
        <a class="brand" routerLink="/" aria-label="Back to the profile">
          <app-icon name="arrow-left" [size]="18" />
          <span class="serif">TUNÉRA</span>
        </a>
        <div class="right">
          <div class="progress mono" aria-live="polite">
            <app-icon name="flag" [size]="14" />
            {{ visited().size }} / {{ total }} discovered
          </div>
          <button class="pill" (click)="listOpen.set(!listOpen())" [attr.aria-expanded]="listOpen()">
            <app-icon name="map" [size]="16" /> <span>Checkpoints</span>
          </button>
        </div>
      </header>

      @if (listOpen()) {
        <nav class="list tone-dark" aria-label="Checkpoints">
          @for (c of checkpoints; track c.id; let i = $index) {
            <button (click)="travel(c.id)" [class.done]="visited().has(c.id)">
              <span class="mono n">{{ (i + 1).toString().padStart(2, '0') }}</span>
              <span class="l">{{ label(c.id) }}</span>
              <app-icon [name]="visited().has(c.id) ? 'check' : 'navigation'" [size]="16" />
            </button>
          }
        </nav>
      }

      <!-- bottom HUD -->
      <canvas #minimap class="minimap" aria-hidden="true"></canvas>

      <div class="speed" aria-hidden="true">
        <span class="serif v">{{ speed() }}</span>
        <span class="mono u">km/h</span>
        <span class="mono car">CLE Coupé</span>
      </div>

      @if (near() && !panel()) {
        <button class="prompt" (click)="openPanel(near()!)">
          <kbd>Enter</kbd>
          <span>Open <strong>{{ label(near()!) }}</strong></span>
          <app-icon name="arrow-up-right" [size]="18" />
        </button>
      }

      @if (coarse() && started() && !panel()) {
        <div class="pad left">
          <button (pointerdown)="hold('left', true, $event)" (pointerup)="hold('left', false)" (pointerleave)="hold('left', false)" (pointercancel)="hold('left', false)" aria-label="Steer left"><app-icon name="arrow-left" [size]="26" /></button>
          <button (pointerdown)="hold('right', true, $event)" (pointerup)="hold('right', false)" (pointerleave)="hold('right', false)" (pointercancel)="hold('right', false)" aria-label="Steer right"><app-icon name="arrow-right" [size]="26" /></button>
        </div>
        <div class="pad right">
          <button (pointerdown)="hold('down', true, $event)" (pointerup)="hold('down', false)" (pointerleave)="hold('down', false)" (pointercancel)="hold('down', false)" aria-label="Brake and reverse"><app-icon name="arrow-down" [size]="26" /></button>
          <button class="gas" (pointerdown)="hold('up', true, $event)" (pointerup)="hold('up', false)" (pointerleave)="hold('up', false)" (pointercancel)="hold('up', false)" aria-label="Accelerate"><app-icon name="gauge" [size]="26" /></button>
        </div>
      }

      <!-- intro -->
      @if (!started() && !failed()) {
        <div class="intro">
          <div class="card tone-dark">
            <span class="mono eyebrow"><app-icon name="map-pin" [size]="14" /> Nabeul, Tunisia</span>
            <h1 class="serif">Drive through Nabeul.</h1>
            <p>Take the Mercedes-Benz CLE Coupé through the city past the monumental jar, the Great Mosque minaret, the ceramics souk and the corniche. Ten checkpoints, ten chapters of my story.</p>
            <ul class="keys">
              <li><span><kbd>W</kbd><kbd>↑</kbd></span> Accelerate</li>
              <li><span><kbd>S</kbd><kbd>↓</kbd></span> Brake / reverse</li>
              <li><span><kbd>A</kbd><kbd>D</kbd></span> Steer</li>
              <li><span><kbd>Shift</kbd></span> Boost</li>
              <li><span><kbd>Space</kbd></span> Handbrake</li>
              <li><span><kbd>Enter</kbd></span> Open checkpoint</li>
            </ul>
            <div class="row">
              <button class="btn accent" (click)="start()" [disabled]="!ready()">
                <app-icon name="car" [size]="18" /> {{ ready() ? 'Start driving' : 'Building the city…' }}
              </button>
              <a class="btn ghost" routerLink="/">Read the profile instead</a>
            </div>
          </div>
        </div>
      }

      <!-- section panel -->
      @if (panel(); as id) {
        <div class="scrim" (click)="closePanel()"></div>
        <aside class="panel" role="dialog" aria-modal="true" [attr.aria-label]="label(id)">
          <div class="panel-bar">
            <span class="mono"><app-icon name="flag" [size]="14" /> Checkpoint {{ indexOf(id) }} · {{ label(id) }}</span>
            <div class="panel-actions">
              <button class="pill" (click)="next()">Next stop <app-icon name="arrow-right" [size]="16" /></button>
              <button class="close" (click)="closePanel()" aria-label="Close and keep driving"><app-icon name="x" [size]="20" /></button>
            </div>
          </div>
          <div class="panel-body">
            @switch (id) {
              @case ('about') { <app-about /> }
              @case ('services') { <app-services /> }
              @case ('featured') { <app-featured /> }
              @case ('activity') { <app-activity /> }
              @case ('experience') { <app-experience /> }
              @case ('education') { <app-education /> }
              @case ('certifications') { <app-certifications /> }
              @case ('skills') { <app-skills /> }
              @case ('languages') { <app-languages /> }
              @case ('contact') { <app-contact /> }
            }
          </div>
        </aside>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .drive { position: fixed; inset: 0; background: #cfdfeb; overflow: hidden; color: var(--ink); user-select: none; }
    .world { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; }

    .top { position: absolute; inset: 16px 16px auto; display: flex; justify-content: space-between; align-items: center; gap: 12px; pointer-events: none; }
    .top > * { pointer-events: auto; }
    .brand { display: inline-flex; align-items: center; gap: 10px; height: 46px; padding: 0 18px; border-radius: 999px; background: var(--ink); color: var(--paper); }
    .brand .serif { font-size: 22px; letter-spacing: .06em; }
    .right { display: flex; gap: 8px; align-items: center; }
    .progress { display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 16px; border-radius: 999px; background: var(--paper); font-size: 11px; }
    .pill { display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 18px; border-radius: 999px; background: var(--paper); font-weight: 600; font-size: 14px; border: 1px solid var(--line); }
    .pill:hover { background: var(--ink); color: var(--paper); }

    .list { position: absolute; right: 16px; top: 72px; width: 280px; padding: 8px; border-radius: 18px; display: grid; gap: 2px; animation: drop .3s var(--ease); }
    .list button { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; text-align: left; }
    .list button:hover { background: var(--ink-3); }
    .list .n { color: var(--fg-muted); font-size: 11px; }
    .list .l { flex: 1; font-weight: 600; }
    .list .done app-icon { color: #6aa0e0; }

    .minimap { position: absolute; left: 16px; bottom: 16px; width: 168px; height: 168px; border-radius: 18px; border: 3px solid var(--paper); }
    .speed { position: absolute; right: 16px; bottom: 16px; display: grid; justify-items: end; padding: 14px 20px; border-radius: 18px; background: var(--ink); color: var(--paper); min-width: 150px; }
    .speed .v { font-size: 56px; line-height: .9; font-variant-numeric: tabular-nums; }
    .speed .u { font-size: 10px; color: #9aa7ba; }
    .speed .car { font-size: 10px; color: var(--terra); margin-top: 6px; }

    .prompt { position: absolute; left: 50%; bottom: 32px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 14px; height: 60px; padding: 0 12px 0 10px;
      border-radius: 999px; background: var(--terra); color: var(--paper); font-size: 16px; animation: rise .35s var(--ease); white-space: nowrap; }
    .prompt kbd { font-family: var(--font-mono); font-size: 11px; padding: 8px 10px; border-radius: 999px; background: var(--paper); color: var(--ink); }
    .prompt app-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--terra-deep); display: grid; place-items: center; }

    .pad { position: absolute; bottom: 200px; display: flex; gap: 12px; }
    .pad.left { left: 16px; } .pad.right { right: 16px; }
    .pad button { width: 72px; height: 72px; border-radius: 50%; background: rgba(15, 27, 45, .82); color: var(--paper); display: grid; place-items: center; touch-action: none; }
    .pad button:active { background: var(--terra); }
    .pad .gas { background: var(--terra); }

    .intro, .overlay { position: absolute; inset: 0; display: grid; place-items: center; padding: 16px; background: rgba(15, 27, 45, .35); }
    .intro .card, .overlay .card { width: min(620px, 100%); padding: clamp(28px, 4vw, 48px); border-radius: 24px; animation: rise .6s var(--ease); max-height: calc(100svh - 32px); overflow-y: auto; }
    .overlay .card { background: var(--ink); }
    .eyebrow { display: inline-flex; gap: 8px; align-items: center; color: var(--accent); }
    .card h1 { font-size: clamp(44px, 7vw, 72px); line-height: .95; margin: 16px 0; font-weight: 400; }
    .card p { color: var(--fg-muted); line-height: 1.7; }
    .keys { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 24px; margin: 28px 0; }
    .keys li { display: flex; align-items: center; gap: 12px; font-size: 14px; }
    .keys span { display: inline-flex; gap: 4px; min-width: 76px; }
    kbd { font-family: var(--font-mono); font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--line); }
    .row { display: flex; flex-wrap: wrap; gap: 10px; }
    .row .btn:disabled { opacity: .6; cursor: progress; }

    .scrim { position: absolute; inset: 0; background: rgba(15, 27, 45, .35); animation: fade .3s; }
    .panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(980px, 100%); background: var(--paper); display: flex; flex-direction: column; animation: slide .55s var(--ease); user-select: text; }
    .panel-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px 14px 24px; border-bottom: 1px solid var(--line); background: var(--paper); }
    .panel-bar .mono { display: inline-flex; gap: 8px; align-items: center; font-size: 11px; color: #5b6577; }
    .panel-actions { display: flex; gap: 8px; }
    .close { width: 46px; height: 46px; border-radius: 50%; background: var(--ink); color: var(--paper); display: grid; place-items: center; }
    .panel-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; }

    @keyframes rise { from { opacity: 0; transform: translate(var(--tx, 0), 16px); } }
    .prompt { --tx: -50%; }
    @keyframes drop { from { opacity: 0; transform: translateY(-8px); } }
    @keyframes fade { from { opacity: 0; } }
    @keyframes slide { from { transform: translateX(100%); } }

    @media (max-width: 720px) {
      .minimap { width: 112px; height: 112px; bottom: auto; top: 76px; }
      .speed { min-width: 0; padding: 10px 14px; bottom: auto; top: 76px; }
      .speed .v { font-size: 36px; }
      .progress span, .pill span { display: none; }
      .progress { font-size: 10px; }
      .pad { bottom: 24px; }
      .prompt { bottom: 112px; }
      .panel { top: 8svh; border-radius: 22px 22px 0 0; overflow: hidden; animation-name: slideUp; }
      .keys { grid-template-columns: 1fr; }
    }
    @keyframes slideUp { from { transform: translateY(100%); } }
  `,
})
export class DrivePage implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly minimap = viewChild.required<ElementRef<HTMLCanvasElement>>('minimap');

  protected readonly checkpoints = CHECKPOINTS;
  protected readonly total = CHECKPOINTS.length;
  protected readonly ready = signal(false);
  protected readonly started = signal(false);
  protected readonly failed = signal(false);
  protected readonly near = signal<SectionId | null>(null);
  protected readonly speed = signal(0);
  protected readonly panel = signal<SectionId | null>(null);
  protected readonly listOpen = signal(false);
  protected readonly visited = signal(new Set<SectionId>());
  protected readonly coarse = signal(typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches);
  protected readonly nextId = computed(() => CHECKPOINTS.find((c) => !this.visited().has(c.id) && c.id !== this.panel())?.id ?? null);

  private engine?: DriveEngine;
  private travelTimer?: ReturnType<typeof setTimeout>;

  async ngAfterViewInit(): Promise<void> {
    try {
      const { DriveEngine } = await import('../three/drive-engine');
      this.zone.runOutsideAngular(() => {
        this.engine = new DriveEngine(this.canvas().nativeElement, this.minimap().nativeElement, {
          onNear: (id) => this.zone.run(() => this.near.set(id)),
          onVisit: (id) => this.zone.run(() => this.visited.update((s) => new Set(s).add(id))),
          onSpeed: (kmh) => this.zone.run(() => this.speed.set(kmh)),
          onReady: () => this.zone.run(() => this.ready.set(true)),
        });
        this.engine.start();
      });
    } catch (err) {
      console.error(err);
      this.failed.set(true);
    }
  }

  protected start(): void {
    this.started.set(true);
    this.engine?.begin();
    this.canvas().nativeElement.focus();
  }

  protected label(id: SectionId): string {
    return SECTIONS.find((s) => s.id === id)?.label ?? id;
  }

  protected indexOf(id: SectionId): string {
    return String(CHECKPOINTS.findIndex((c) => c.id === id) + 1).padStart(2, '0');
  }

  protected openPanel(id: SectionId): void {
    this.panel.set(id);
    this.listOpen.set(false);
    this.engine?.setEnabled(false);
    this.engine?.markVisited(id);
  }

  protected closePanel(): void {
    this.panel.set(null);
    this.engine?.setEnabled(true);
  }

  protected travel(id: SectionId): void {
    if (!this.started()) this.start();
    this.listOpen.set(false);
    this.panel.set(null);
    this.engine?.setEnabled(true);
    this.engine?.travelTo(id);
    clearTimeout(this.travelTimer);
    this.travelTimer = setTimeout(() => this.openPanel(id), 1550);
  }

  protected next(): void {
    const id = this.nextId();
    if (id) this.travel(id);
    else this.closePanel();
  }

  protected hold(c: Control, on: boolean, e?: PointerEvent): void {
    if (e) (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this.engine?.setControl(c, on);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !this.panel()) {
      if (!this.started() && this.ready()) {
        this.start();
      } else if (this.near()) {
        e.preventDefault();
        this.openPanel(this.near()!);
      }
    } else if (e.key === 'Escape') {
      if (this.panel()) this.closePanel();
      else this.listOpen.set(false);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.travelTimer);
    this.engine?.dispose();
  }
}
