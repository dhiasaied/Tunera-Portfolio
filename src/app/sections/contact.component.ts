import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IDENTITY } from '../core/data/profile.data';
import { UiService } from '../core/services/ui.service';
import { IconComponent } from '../shared/icon.component';
import { MagneticDirective, RevealDirective } from '../shared/motion.directives';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [IconComponent, MagneticDirective, RevealDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section tone-dark contact" id="contact">
      <div class="container">
        <span class="mono eyebrow" reveal><app-icon name="mail" [size]="14" /> Contact</span>
        <h2 class="serif" reveal [revealDelay]="80">Let’s build something <em>remarkable</em>.</h2>

        <div class="row" reveal [revealDelay]="160">
          <a class="mail serif" [href]="'mailto:' + id.email" magnetic [strength]="0.12">
            {{ id.email }} <app-icon name="arrow-up-right" [size]="32" [stroke]="1.2" />
          </a>
        </div>

        <div class="grid" reveal [revealDelay]="220">
          <div>
            <span class="mono k">Local time in Nabeul</span>
            <span class="v serif">{{ time() }}</span>
          </div>
          <div>
            <span class="mono k">Elsewhere</span>
            <span class="links">
              <a [href]="id.linkedin" target="_blank" rel="noopener"><app-icon name="linkedin" [size]="18" /> LinkedIn</a>
              <a [href]="id.github" target="_blank" rel="noopener"><app-icon name="github" [size]="18" /> GitHub</a>
            </span>
          </div>
          <div>
            <span class="mono k">Prefer the scenic route?</span>
            <a class="btn accent sm" routerLink="/drive"><app-icon name="car" [size]="16" /> Drive through Nabeul</a>
          </div>
        </div>
      </div>

      <footer class="container foot">
        <span class="brand serif">TUNÉRA</span>
        <span class="mono">© {{ year }} {{ id.name }} · Nabeul, Tunisia · Built with Angular</span>
        <button class="mono top" (click)="ui.goTo('home')">Back to top <app-icon name="arrow-right" [size]="14" /></button>
      </footer>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .contact { padding-bottom: 32px; }
    .eyebrow { display: inline-flex; align-items: center; gap: 10px; color: var(--accent); }
    h2 { font-size: clamp(52px, 10vw, 150px); line-height: .92; letter-spacing: -.02em; margin: 24px 0 48px; max-width: 1100px; }
    h2 em { color: var(--accent); }
    .mail { display: inline-flex; align-items: center; gap: 16px; font-size: clamp(26px, 4.4vw, 60px); border-bottom: 1px solid var(--line); padding-bottom: 12px; word-break: break-all; transition: color .3s, border-color .3s; }
    .mail:hover { color: var(--accent); border-color: var(--accent); }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin: clamp(56px, 8vw, 112px) 0; }
    .grid > div { display: grid; gap: 12px; align-content: start; justify-items: start; }
    .k { color: var(--fg-muted); font-size: 11px; }
    .v { font-size: 40px; line-height: 1; }
    .links { display: flex; gap: 20px; flex-wrap: wrap; }
    .links a { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; transition: color .3s; }
    .links a:hover { color: var(--accent); }
    .foot { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; padding-top: 28px; border-top: 1px solid var(--line); color: var(--fg-muted); }
    .foot .mono { font-size: 11px; }
    .brand { font-size: 28px; color: var(--fg); letter-spacing: .06em; }
    .top { display: inline-flex; align-items: center; gap: 8px; }
    @container (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class ContactComponent implements OnInit, OnDestroy {
  protected readonly ui = inject(UiService);
  protected readonly id = IDENTITY;
  protected readonly year = new Date().getFullYear();
  protected readonly time = signal('');
  private timer?: ReturnType<typeof setInterval>;
  private readonly fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Tunis' });

  ngOnInit(): void {
    const tick = () => this.time.set(`${this.fmt.format(new Date())} CET`);
    tick();
    this.timer = setInterval(tick, 15_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
