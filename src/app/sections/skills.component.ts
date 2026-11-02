import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SKILL_GROUPS, SOFT_SKILLS } from '../core/data/profile.data';
import { IconComponent } from '../shared/icon.component';
import { RevealDirective } from '../shared/motion.directives';
import { SectionHeaderComponent } from '../shared/section-header.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [SectionHeaderComponent, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section" id="skills">
      <div class="container">
        <app-section-header index="08" eyebrow="Skills" icon="code" title="The toolkit."
          lead="Languages, frameworks and practices I use to take products from idea to production." />

        <div class="layout">
          <div class="tabs" role="tablist" aria-label="Skill categories" reveal>
            @for (g of groups; track g.id) {
              <button role="tab" [attr.aria-selected]="active() === g.id" [class.on]="active() === g.id" (click)="active.set(g.id)">
                <app-icon [name]="g.icon" [size]="18" />
                <span>{{ g.label }}</span>
                <span class="mono n">{{ g.items.length }}</span>
              </button>
            }
          </div>

          <div class="panel" role="tabpanel" reveal [revealDelay]="100">
            <div class="panel-head">
              <app-icon [name]="current().icon" [size]="22" />
              <h3 class="serif">{{ current().label }}</h3>
            </div>
            <ul class="items">
              @for (s of current().items; track current().id + s; let i = $index) {
                <li [style.animation-delay.ms]="i * 40">{{ s }}</li>
              }
            </ul>
          </div>
        </div>

        <div class="soft" reveal>
          <span class="mono label">Working style</span>
          <ul>
            @for (s of soft; track s) { <li><app-icon name="check" [size]="16" /> {{ s }}</li> }
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .layout { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
    .tabs { display: grid; gap: 4px; align-content: start; }
    .tabs button { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; text-align: left; font-weight: 600; color: var(--fg-muted); transition: background-color .3s, color .3s; }
    .tabs button span:nth-child(2) { flex: 1; }
    .tabs button:hover { color: var(--fg); background: var(--surface-2); }
    .tabs button.on { background: var(--ink); color: var(--paper); }
    .n { font-size: 11px; opacity: .7; }
    .panel { padding: clamp(24px, 3vw, 40px); border-radius: var(--radius); background: var(--surface); border: 1px solid var(--line); min-height: 360px; }
    .panel-head { display: flex; align-items: center; gap: 14px; color: var(--accent); margin-bottom: 28px; }
    .panel-head h3 { color: var(--fg); font-size: 40px; line-height: 1; }
    .items { display: flex; flex-wrap: wrap; gap: 10px; }
    .items li { padding: 12px 18px; border-radius: 12px; border: 1px solid var(--line); font-weight: 600; font-size: 15px; background: var(--bg);
      animation: in .5s var(--ease) both; transition: background-color .3s, color .3s, border-color .3s; }
    .items li:hover { background: var(--terra); color: var(--paper); border-color: var(--terra); }
    .soft { margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--line); display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
    .label { color: var(--fg-muted); padding-top: 4px; }
    .soft ul { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px 32px; }
    .soft li { display: flex; gap: 10px; align-items: start; color: var(--fg); }
    .soft app-icon { color: var(--accent); margin-top: 3px; }
    @keyframes in { from { opacity: 0; transform: translateY(10px); } }
    @container (max-width: 820px) {
      .layout, .soft { grid-template-columns: 1fr; }
      .tabs { display: flex; overflow-x: auto; gap: 6px; padding-bottom: 6px; scrollbar-width: none; }
      .tabs button { flex-shrink: 0; }
      .tabs .n { display: none; }
      .soft ul { grid-template-columns: 1fr; }
    }
  `,
})
export class SkillsComponent {
  protected readonly groups = SKILL_GROUPS;
  protected readonly soft = SOFT_SKILLS;
  protected readonly active = signal(SKILL_GROUPS[0].id);
  protected readonly current = computed(() => this.groups.find((g) => g.id === this.active()) ?? this.groups[0]);
}
