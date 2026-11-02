import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LANGUAGES } from '../core/data/profile.data';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

@Component({
  selector: 'app-languages',
  standalone: true,
  imports: [SectionHeaderComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section tone-blue" id="languages">
      <div class="container">
        <app-section-header index="09" eyebrow="Languages" icon="languages" title="Five languages, one Mediterranean voice." />
        <ul class="grid">
          @for (l of languages; track l.name; let i = $index) {
            <li class="card" reveal [revealDelay]="i * 70">
              <span class="native serif" [attr.dir]="l.name === 'Arabic' ? 'rtl' : null" [attr.lang]="langCode(l.name)">{{ l.native }}</span>
              <div class="foot">
                <strong>{{ l.name }}</strong>
                <span>{{ l.level }}</span>
                <div class="meter" role="meter" [attr.aria-valuenow]="l.score" aria-valuemin="0" aria-valuemax="5" [attr.aria-label]="l.name + ' proficiency'">
                  @for (s of steps; track s) { <i [class.on]="s <= l.score" [style.transition-delay.ms]="s * 90"></i> }
                </div>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
    .card { display: flex; flex-direction: column; justify-content: space-between; gap: 40px; min-height: 280px; padding: 26px; border-radius: var(--radius); background: var(--surface); transition: background-color .4s var(--ease), color .4s; }
    .card:hover { background: var(--paper); color: var(--ink); }
    .card:hover .foot span { color: #5b6577; }
    .card:hover .meter i { background: #c9d4e3; }
    .card:hover .meter i.on { background: var(--terra); }
    .native { font-size: clamp(40px, 4vw, 56px); line-height: 1; }
    .foot { display: grid; gap: 6px; }
    .foot strong { font-size: 18px; }
    .foot span { color: var(--fg-muted); font-size: 14px; line-height: 1.4; min-height: 2.8em; }
    .meter { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-top: 10px; }
    .meter i { height: 4px; border-radius: 2px; background: var(--line); transition: background-color .4s; }
    .meter i.on { background: var(--paper); }
    @container (max-width: 1080px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    @container (max-width: 680px) { .grid { grid-template-columns: repeat(2, 1fr); } .card { min-height: 220px; } }
    @container (max-width: 420px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class LanguagesComponent {
  protected readonly languages = LANGUAGES;
  protected readonly steps = [1, 2, 3, 4, 5];

  protected langCode(name: string): string {
    return ({ Arabic: 'ar', Spanish: 'es', French: 'fr', English: 'en', Portuguese: 'pt' } as Record<string, string>)[name] ?? 'en';
  }
}
