import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EXPERIENCE } from '../core/data/profile.data';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section tone-dark" id="experience">
      <div class="container">
        <app-section-header index="05" eyebrow="Experience" icon="briefcase" title="From the server room to the full stack."
          lead="A path that started in IT maintenance and networking and grew into full stack product development." />

        <ol class="timeline">
          @for (e of jobs; track e.period; let i = $index) {
            <li class="job" [class.open]="openIndex() === i" reveal [revealDelay]="i * 60">
              <button class="head" (click)="toggle(i)" [attr.aria-expanded]="openIndex() === i">
                <span class="period mono">{{ e.period }}</span>
                <span class="title">
                  <strong class="serif">{{ e.role }}</strong>
                  <span class="org"><app-icon name="building" [size]="15" /> {{ e.company }} <i></i> {{ e.location }}</span>
                </span>
                <span class="type chip">{{ e.type }}</span>
                <span class="toggle"><app-icon name="chevron-down" [size]="20" /></span>
              </button>
              <div class="detail">
                <div class="inner">
                  <ul>
                    @for (h of e.highlights; track $index) { <li>{{ h }}</li> }
                  </ul>
                  <div class="stack">
                    @for (t of e.stack; track t) { <span class="chip outline">{{ t }}</span> }
                  </div>
                </div>
              </div>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .timeline { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
    .job { border-bottom: 1px solid var(--line); }
    .head { width: 100%; display: grid; grid-template-columns: 200px 1fr auto 44px; gap: 24px; align-items: center; padding: 30px 0; text-align: left; }
    .period { color: var(--fg-muted); font-size: 12px; }
    .title { display: grid; gap: 6px; }
    .title strong { font-size: clamp(28px, 3vw, 40px); line-height: 1.05; font-weight: 400; transition: color .3s; }
    .head:hover strong, .open strong { color: var(--accent); }
    .org { display: flex; align-items: center; gap: 8px; color: var(--fg-muted); font-size: 14px; flex-wrap: wrap; }
    .org i { width: 4px; height: 4px; border-radius: 50%; background: var(--fg-muted); }
    .toggle { width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--line); display: grid; place-items: center; transition: transform .4s var(--ease), background-color .3s; }
    .open .toggle { transform: rotate(180deg); background: var(--accent); border-color: var(--accent); color: var(--ink); }
    .detail { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .55s var(--ease); }
    .open .detail { grid-template-rows: 1fr; }
    .inner { overflow: hidden; padding-left: 224px; }
    .inner ul { display: grid; gap: 12px; padding: 0 0 18px; }
    .inner li { position: relative; padding-left: 22px; color: #c5cfdc; line-height: 1.7; max-width: 760px; }
    .inner li::before { content: ''; position: absolute; left: 0; top: .72em; width: 10px; height: 1px; background: var(--accent); }
    .stack { display: flex; flex-wrap: wrap; gap: 6px; padding-bottom: 32px; }
    @container (max-width: 860px) {
      .head { grid-template-columns: 1fr 44px; gap: 10px 16px; }
      .period { grid-column: 1 / -1; }
      .type { display: none; }
      .inner { padding-left: 0; }
    }
  `,
})
export class ExperienceComponent {
  protected readonly jobs = EXPERIENCE;
  protected readonly openIndex = signal<number | null>(0);

  protected toggle(i: number): void {
    this.openIndex.update((cur) => (cur === i ? null : i));
  }
}
