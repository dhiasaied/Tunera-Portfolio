import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CERTIFICATIONS } from '../core/data/profile.data';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

const ISSUER_GROUPS = ['Microsoft', 'MathWorks', 'OpenClassrooms', 'Google'] as const;

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section tone-dark" id="certifications">
      <div class="container">
        <app-section-header index="07" eyebrow="Licenses & Certifications" icon="award" title="Continuous learning, documented."
          [lead]="certs.length + ' credentials across software development, artificial intelligence, networking and civic learning.'" />

        <div class="tools" reveal>
          <div class="filters">
            @for (g of groups; track g) {
              <button [class.on]="group() === g" (click)="group.set(g)">
                {{ g }} <span class="count">{{ countFor(g) }}</span>
              </button>
            }
          </div>
          <label class="search">
            <app-icon name="search" [size]="16" />
            <input type="search" placeholder="Search credentials" [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Search certifications" />
          </label>
        </div>

        @for (y of years(); track y.year) {
          <div class="year">
            <h3 class="serif">{{ y.year }}</h3>
            <ul>
              @for (c of y.items; track c.title) {
                <li class="cert">
                  <span class="icon"><app-icon name="award" [size]="18" /></span>
                  <span class="t">{{ c.title }}</span>
                  <span class="issuer">{{ c.issuer }}</span>
                  <span class="date mono">{{ c.date }}</span>
                </li>
              }
            </ul>
          </div>
        } @empty {
          <p class="empty">No credential matches your search.</p>
        }
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .tools { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }
    .filters { display: flex; flex-wrap: wrap; gap: 8px; }
    .filters button { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 999px; border: 1px solid var(--line); font-size: 14px; font-weight: 600; color: var(--fg-muted); transition: all .3s var(--ease); }
    .filters button:hover { color: var(--fg); border-color: var(--fg-muted); }
    .filters button.on { background: var(--paper); color: var(--ink); border-color: var(--paper); }
    .count { font-family: var(--font-mono); font-size: 11px; opacity: .7; }
    .search { display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--line); color: var(--fg-muted); min-width: 240px; }
    .search input { background: transparent; border: 0; outline: 0; color: var(--fg); font: inherit; width: 100%; }
    .year { display: grid; grid-template-columns: 140px 1fr; gap: 24px; padding: 28px 0; border-top: 1px solid var(--line); }
    .year h3 { font-size: 48px; line-height: 1; color: var(--accent); }
    ul { display: grid; gap: 4px; }
    .cert { display: grid; grid-template-columns: 36px 1fr auto 80px; gap: 16px; align-items: center; padding: 14px 16px; border-radius: 12px; transition: background-color .3s; }
    .cert:hover { background: var(--surface); }
    .icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: var(--surface-2); color: var(--accent); }
    .t { font-weight: 600; line-height: 1.35; }
    .issuer { color: var(--fg-muted); font-size: 14px; text-align: right; }
    .date { color: var(--fg-muted); font-size: 11px; text-align: right; }
    .empty { color: var(--fg-muted); padding: 40px 0; }
    @container (max-width: 820px) {
      .year { grid-template-columns: 1fr; gap: 12px; }
      .cert { grid-template-columns: 36px 1fr; }
      .issuer, .date { grid-column: 2; text-align: left; }
    }
  `,
})
export class CertificationsComponent {
  protected readonly certs = CERTIFICATIONS;
  protected readonly groups = ['All', ...ISSUER_GROUPS, 'Other'];
  protected readonly group = signal('All');
  protected readonly query = signal('');

  private matchesGroup(issuer: string, g: string): boolean {
    if (g === 'All') return true;
    if (g === 'Other') return !ISSUER_GROUPS.some((k) => issuer.includes(k));
    return issuer.includes(g);
  }

  protected countFor(g: string): number {
    return this.certs.filter((c) => this.matchesGroup(c.issuer, g)).length;
  }

  protected readonly years = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.certs.filter(
      (c) => this.matchesGroup(c.issuer, this.group()) && (!q || `${c.title} ${c.issuer}`.toLowerCase().includes(q)),
    );
    const years = [...new Set(list.map((c) => c.year))].sort((a, b) => b - a);
    return years.map((year) => ({ year, items: list.filter((c) => c.year === year) }));
  });
}
