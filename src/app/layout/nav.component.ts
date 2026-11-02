import { ChangeDetectionStrategy, Component, HostListener, NgZone, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SECTIONS } from '../core/data/profile.data';
import { UiService } from '../core/services/ui.service';
import { IconComponent } from '../shared/icon.component';
import { MagneticDirective } from '../shared/motion.directives';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, IconComponent, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="nav" [class.hidden]="hidden()" [class.solid]="solid()" aria-label="Primary">
      <div class="inner">
        <button class="brand" (click)="ui.goTo('home')" aria-label="TUNÉRA back to top">
          <span class="word">TUNÉRA</span>
          <span class="dot"></span>
        </button>

        <ul class="links">
          @for (s of links; track s.id) {
            <li>
              <button [class.active]="ui.activeSection() === s.id" (click)="ui.goTo(s.id)">{{ shortLabel(s.label) }}</button>
            </li>
          }
        </ul>

        <div class="actions">
          <button class="kbd" (click)="ui.togglePalette(true)" aria-label="Open command palette">
            <app-icon name="search" [size]="16" />
            <span>Ctrl K</span>
          </button>
          <a class="btn sm accent drive" routerLink="/drive" magnetic>
            <app-icon name="car" [size]="18" />
            <span>Drive Nabeul</span>
          </a>
          <button class="burger" (click)="ui.toggleMenu()" [attr.aria-expanded]="ui.menuOpen()" aria-label="Menu">
            <app-icon [name]="ui.menuOpen() ? 'x' : 'menu'" [size]="22" />
          </button>
        </div>
      </div>
      <span class="progress" [style.transform]="'scaleX(' + progress() + ')'"></span>
    </nav>

    <div class="menu tone-dark" [class.open]="ui.menuOpen()" [attr.aria-hidden]="!ui.menuOpen()">
      <ul>
        @for (s of sections; track s.id; let i = $index) {
          <li [style.transition-delay.ms]="ui.menuOpen() ? 60 + i * 35 : 0">
            <button (click)="ui.goTo(s.id)" [attr.tabindex]="ui.menuOpen() ? 0 : -1">
              <span class="n mono">{{ (i + 1).toString().padStart(2, '0') }}</span>
              <span class="serif">{{ s.label }}</span>
            </button>
          </li>
        }
      </ul>
      <a class="btn accent" routerLink="/drive" (click)="ui.toggleMenu(false)" [attr.tabindex]="ui.menuOpen() ? 0 : -1">
        <app-icon name="car" [size]="18" /> Drive through Nabeul
      </a>
    </div>
  `,
  styles: `
    .nav { position: fixed; inset: 0 0 auto; z-index: 100; height: var(--nav-h); transition: transform .5s var(--ease), background-color .4s var(--ease), border-color .4s; border-bottom: 1px solid transparent; }
    .nav.solid { background: var(--paper); border-color: var(--line); }
    .nav.hidden { transform: translateY(-100%); }
    .inner { height: 100%; max-width: 1480px; margin: 0 auto; padding: 0 var(--gutter); display: flex; align-items: center; gap: 24px; }
    .brand { display: flex; align-items: baseline; gap: 4px; }
    .word { font-family: var(--font-display); font-size: 28px; letter-spacing: .06em; }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--terra); }
    .links { display: flex; gap: 2px; margin: 0 auto; }
    .links button { padding: 8px 12px; border-radius: 999px; font-size: 14px; font-weight: 500; color: #4a5568; transition: color .25s, background-color .25s; }
    .links button:hover { color: var(--ink); }
    .links button.active { color: var(--ink); background: var(--paper-2); }
    .actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .kbd { display: inline-flex; align-items: center; gap: 8px; height: 42px; padding: 0 14px; border: 1px solid var(--line); border-radius: 999px; font-family: var(--font-mono); font-size: 12px; color: #4a5568; transition: border-color .25s; }
    .kbd:hover { border-color: var(--ink); }
    .burger { display: none; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); align-items: center; justify-content: center; }
    .progress { position: absolute; left: 0; bottom: -1px; height: 2px; width: 100%; background: var(--terra); transform-origin: left; }

    .menu { position: fixed; inset: 0; z-index: 90; padding: calc(var(--nav-h) + 24px) var(--gutter) 32px; display: flex; flex-direction: column; justify-content: space-between; gap: 24px;
      clip-path: inset(0 0 100% 0); transition: clip-path .7s var(--ease-in-out); overflow-y: auto; }
    .menu.open { clip-path: inset(0 0 0 0); }
    .menu li { opacity: 0; transform: translateY(16px); transition: opacity .5s var(--ease), transform .5s var(--ease); }
    .menu.open li { opacity: 1; transform: none; }
    .menu li button { display: flex; align-items: baseline; gap: 16px; padding: 6px 0; text-align: left; }
    .menu .serif { font-size: clamp(30px, 7vw, 52px); line-height: 1.1; }
    .menu .n { color: var(--fg-muted); }
    .menu .btn { align-self: flex-start; }

    @media (max-width: 1240px) {
      .links { display: none; }
      .burger { display: inline-flex; }
    }
    @media (max-width: 640px) {
      .kbd, .drive { display: none; }
    }
  `,
})
export class NavComponent implements OnInit {
  protected readonly ui = inject(UiService);
  private readonly zone = inject(NgZone);
  protected readonly sections = SECTIONS;
  protected readonly links = SECTIONS.filter((s) => s.id !== 'contact');
  protected readonly hidden = signal(false);
  protected readonly solid = signal(false);
  protected readonly progress = signal(0);
  private lastY = 0;
  private ticking = false;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      addEventListener(
        'scroll',
        () => {
          if (this.ticking) return;
          this.ticking = true;
          requestAnimationFrame(() => {
            this.ticking = false;
            const y = scrollY;
            const max = document.documentElement.scrollHeight - innerHeight;
            const hide = y > 400 && y > this.lastY && !this.ui.menuOpen();
            const solid = y > 24;
            const progress = max > 0 ? y / max : 0;
            this.lastY = y;
            this.zone.run(() => {
              this.hidden.set(hide);
              this.solid.set(solid);
              this.progress.set(progress);
            });
          });
        },
        { passive: true },
      );
    });
  }

  protected shortLabel(label: string): string {
    return label === 'Licenses & Certifications' ? 'Certifications' : label;
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    if (this.ui.menuOpen()) this.ui.toggleMenu(false);
  }
}
