import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent, IconName } from './icon.component';
import { RevealDirective } from './motion.directives';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head" reveal>
      <div class="meta">
        <span class="index">{{ index() }}</span>
        <span class="rule"></span>
        <app-icon [name]="icon()" [size]="16" />
        <span class="eyebrow">{{ eyebrow() }}</span>
      </div>
      <h2 class="title">{{ title() }}</h2>
      @if (lead()) {
        <p class="lead">{{ lead() }}</p>
      }
    </header>
  `,
  styles: `
    .head { margin-bottom: clamp(32px, 5vw, 64px); max-width: 860px; }
    .meta { display: flex; align-items: center; gap: 12px; color: var(--accent); margin-bottom: 20px; }
    .index { font-family: var(--font-mono); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--fg-muted); }
    .rule { width: 40px; height: 1px; background: var(--line); }
    .eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--fg); }
    .title { font-family: var(--font-display); font-weight: 400; font-size: clamp(40px, 6.2vw, 84px); line-height: .98; letter-spacing: -.01em; margin: 0; }
    .lead { color: var(--fg-muted); font-size: clamp(16px, 1.4vw, 19px); line-height: 1.6; margin: 22px 0 0; max-width: 640px; }
  `,
})
export class SectionHeaderComponent {
  readonly index = input.required<string>();
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly icon = input<IconName>('compass');
  readonly lead = input<string>('');
}
