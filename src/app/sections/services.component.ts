import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SERVICES } from '../core/data/profile.data';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective, TiltDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective, TiltDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section" id="services">
      <div class="container">
        <app-section-header index="02" eyebrow="Services" icon="layers" title="What I build, end to end."
          lead="From the interface people touch to the API and database behind it delivered with agile discipline and security in mind." />
        <ul class="grid">
          @for (s of services; track s.title; let i = $index) {
            <li class="card" reveal [revealDelay]="(i % 3) * 90" tilt>
              <div class="top">
                <span class="icon"><app-icon [name]="s.icon" [size]="24" /></span>
                <span class="mono n">{{ (i + 1).toString().padStart(2, '0') }}</span>
              </div>
              <h3 class="serif">{{ s.title }}</h3>
              <p>{{ s.description }}</p>
              <div class="stack">
                @for (t of s.stack; track t) { <span class="chip">{{ t }}</span> }
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .card { position: relative; display: flex; flex-direction: column; gap: 16px; padding: 32px; min-height: 340px; border-radius: var(--radius);
      background: var(--surface); border: 1px solid var(--line); transition: transform .5s var(--ease), background-color .45s var(--ease), color .45s var(--ease), border-color .45s; }
    .card:hover { background: var(--ink); color: var(--paper); border-color: var(--ink); --chip-bg: var(--ink-3); --fg: var(--paper); }
    .card:hover p { color: #b6c1d1; }
    .card:hover .icon { background: var(--terra); color: var(--paper); }
    .top { display: flex; justify-content: space-between; align-items: start; margin-bottom: auto; }
    .icon { width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; background: var(--surface-2); color: var(--accent); transition: background-color .45s, color .45s; }
    .n { color: var(--fg-muted); }
    h3 { font-size: 32px; line-height: 1.05; margin-top: 28px; }
    p { color: var(--fg-muted); line-height: 1.65; font-size: 15px; transition: color .45s; }
    .stack { display: flex; flex-wrap: wrap; gap: 6px; }
    @container (max-width: 980px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @container (max-width: 600px) { .grid { grid-template-columns: 1fr; } .card { min-height: 0; padding: 26px; } }
  `,
})
export class ServicesComponent {
  protected readonly services = SERVICES;
}
