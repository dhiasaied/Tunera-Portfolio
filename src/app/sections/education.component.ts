import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EDUCATION } from '../core/data/profile.data';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective, TiltDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective, TiltDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section" id="education">
      <div class="container">
        <app-section-header index="06" eyebrow="Education" icon="graduation" title="Trained in Tunisia, built for anywhere." />
        <div class="grid">
          @for (e of education; track e.degree; let i = $index) {
            <article class="card" [class.primary]="i === 0" reveal [revealDelay]="i * 100" tilt [maxTilt]="3">
              <div class="top">
                <span class="mono period"><app-icon name="calendar" [size]="14" /> {{ e.period }}</span>
                <span class="seal"><app-icon name="graduation" [size]="22" /></span>
              </div>
              <h3 class="serif">{{ e.degree }}</h3>
              <p class="school"><app-icon name="building" [size]="16" /> {{ e.school }}</p>
              <p class="desc">{{ e.description }}</p>
              <div class="skills">
                @for (s of e.skills; track s) { <span class="chip">{{ s }}</span> }
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .grid { display: grid; grid-template-columns: 1.25fr 1fr; gap: 20px; align-items: stretch; }
    .card { display: flex; flex-direction: column; gap: 14px; padding: clamp(26px, 3vw, 40px); border-radius: var(--radius); background: var(--surface); border: 1px solid var(--line); transition: transform .5s var(--ease); }
    .card.primary { background: var(--blue); color: var(--paper); border-color: var(--blue); --chip-bg: var(--blue-deep); --fg: var(--paper); }
    .card.primary .desc, .card.primary .period, .card.primary .school { color: #d3e0f0; }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .period { display: inline-flex; align-items: center; gap: 8px; color: var(--fg-muted); font-size: 11px; }
    .seal { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; border: 1px solid currentColor; opacity: .85; }
    h3 { font-size: clamp(30px, 3.2vw, 44px); line-height: 1.05; }
    .school { display: flex; align-items: center; gap: 8px; font-weight: 600; }
    .desc { color: var(--fg-muted); line-height: 1.7; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; padding-top: 12px; }
    @container (max-width: 820px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class EducationComponent {
  protected readonly education = EDUCATION;
}
