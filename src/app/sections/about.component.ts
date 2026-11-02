import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EDUCATION, IDENTITY } from '../core/data/profile.data';
import { UiService } from '../core/services/ui.service';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section" id="about">
      <div class="container">
        <app-section-header index="01" eyebrow="About" icon="user" title="Code that is clean, secure and built to last." />

        <div class="grid">
          <aside class="card facts" reveal>
            <div class="photo">
              <img [src]="id.photo" [alt]="id.name" loading="lazy" width="1024" height="1024" />
            </div>
            <dl>
              @for (f of facts; track f.k) {
                <div>
                  <dt class="mono"><app-icon [name]="f.icon" [size]="14" /> {{ f.k }}</dt>
                  <dd>{{ f.v }}</dd>
                </div>
              }
            </dl>
          </aside>

          <div class="text">
            @for (p of id.about; track $index) {
              <p reveal [revealDelay]="$index * 80" [class.lead]="$first">{{ p }}</p>
            }
            <div class="links" reveal [revealDelay]="240">
              <a class="btn" [href]="'mailto:' + id.email"><app-icon name="mail" [size]="18" /> Get in touch</a>
              <a class="btn ghost" [href]="id.linkedin" target="_blank" rel="noopener"><app-icon name="linkedin" [size]="18" /> LinkedIn</a>
              <button class="btn ghost" (click)="ui.goTo('experience')">Experience <app-icon name="arrow-right" [size]="18" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .grid { display: grid; grid-template-columns: 360px 1fr; gap: clamp(32px, 6vw, 96px); align-items: start; }
    .facts { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px; position: sticky; top: calc(var(--nav-h) + 24px); }
    .photo { aspect-ratio: 1; border-radius: 999px 999px 10px 10px; overflow: hidden; background: var(--paper-2); }
    .photo img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 25%; }
    dl { margin: 18px 6px 6px; display: grid; gap: 14px; }
    dl div { display: grid; gap: 4px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
    dl div:last-child { border: 0; padding-bottom: 0; }
    dt { display: flex; align-items: center; gap: 8px; color: var(--fg-muted); font-size: 11px; }
    dd { margin: 0; font-weight: 600; }
    .text p { font-size: clamp(16px, 1.25vw, 18px); line-height: 1.75; color: var(--fg-muted); margin-bottom: 24px; max-width: 720px; }
    .text p.lead { font-size: clamp(20px, 1.9vw, 26px); line-height: 1.5; color: var(--fg); }
    .links { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 40px; }
    @container (max-width: 860px) {
      .grid { grid-template-columns: 1fr; }
      .facts { position: static; display: grid; grid-template-columns: 160px 1fr; gap: 20px; align-items: center; }
      dl { margin: 0; }
    }
    @container (max-width: 520px) {
      .facts { grid-template-columns: 1fr; }
      .photo { max-width: 200px; }
    }
  `,
})
export class AboutComponent {
  protected readonly ui = inject(UiService);
  protected readonly id = IDENTITY;
  protected readonly facts = [
    { k: 'Based in', v: `${IDENTITY.city}, ${IDENTITY.country}`, icon: 'map-pin' as const },
    { k: 'Role', v: IDENTITY.headline, icon: 'code' as const },
    { k: 'Work mode', v: IDENTITY.availability, icon: 'globe' as const },
    { k: 'Education', v: `${EDUCATION[0].school} Web Development`, icon: 'graduation' as const },
  ];
}
