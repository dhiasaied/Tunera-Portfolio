import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ACTIVITY, IDENTITY } from '../core/data/profile.data';
import { ActivityItem } from '../core/models/profile.models';
import { IconComponent, IconName } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

type Filter = 'all' | ActivityItem['kind'];

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section" id="activity">
      <div class="container">
        <app-section-header index="04" eyebrow="Activity" icon="activity" title="Recently, on the record."
          lead="Posts and milestones from my professional feed always learning, always shipping." />

        <div class="bar" reveal>
          <div class="filters" role="tablist" aria-label="Filter activity">
            @for (f of filters; track f.id) {
              <button role="tab" [attr.aria-selected]="filter() === f.id" [class.on]="filter() === f.id" (click)="filter.set(f.id)">{{ f.label }}</button>
            }
          </div>
          <a class="btn ghost sm" [href]="linkedinActivity" target="_blank" rel="noopener">
            <app-icon name="linkedin" [size]="16" /> All activity <app-icon name="external" [size]="14" />
          </a>
        </div>

        <ol class="feed">
          @for (a of visible(); track a.title; let i = $index) {
            <li class="item" reveal [revealDelay]="i * 70">
              <span class="badge" [class.post]="a.kind === 'post'"><app-icon [name]="iconFor(a.kind)" [size]="18" /></span>
              <div class="body">
                <div class="row mono">
                  <span>{{ a.kind === 'post' ? 'Shared a post' : 'Certification earned' }}</span>
                  <span class="date">{{ a.date }}</span>
                </div>
                <h3>{{ a.title }}</h3>
                <p>{{ a.body }}</p>
                <div class="tags">
                  @for (t of a.tags; track t) { <span class="chip outline">{{ t }}</span> }
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
    .bar { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 28px; }
    .filters { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--surface-2); }
    .filters button { padding: 9px 16px; border-radius: 999px; font-size: 14px; font-weight: 600; color: var(--fg-muted); transition: background-color .3s, color .3s; }
    .filters button.on { background: var(--ink); color: var(--paper); }
    .feed { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .item { display: grid; grid-template-columns: 52px 1fr; gap: 20px; padding: 26px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--line); transition: border-color .3s, transform .4s var(--ease); }
    .item:hover { border-color: var(--fg); transform: translateX(6px); }
    .badge { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; background: var(--blue); color: var(--paper); }
    .badge.post { background: var(--terra); }
    .row { display: flex; justify-content: space-between; gap: 12px; font-size: 11px; color: var(--fg-muted); margin-bottom: 8px; }
    h3 { font-size: 19px; font-weight: 600; line-height: 1.35; }
    p { color: var(--fg-muted); margin-top: 8px; line-height: 1.65; font-size: 15px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
    @container (max-width: 560px) { .item { grid-template-columns: 1fr; padding: 22px; } .row { flex-direction: column; gap: 4px; } }
  `,
})
export class ActivityComponent {
  protected readonly linkedinActivity = IDENTITY.linkedinActivity;
  protected readonly filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'post', label: 'Posts' },
    { id: 'certification', label: 'Milestones' },
  ];
  protected readonly filter = signal<Filter>('all');
  protected readonly visible = computed(() => {
    const f = this.filter();
    return f === 'all' ? ACTIVITY : ACTIVITY.filter((a) => a.kind === f);
  });

  protected iconFor(kind: ActivityItem['kind']): IconName {
    return kind === 'post' ? 'message' : kind === 'certification' ? 'award' : 'flag';
  }
}
