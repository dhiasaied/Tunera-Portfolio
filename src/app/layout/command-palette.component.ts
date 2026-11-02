import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IDENTITY, SECTIONS } from '../core/data/profile.data';
import { UiService } from '../core/services/ui.service';
import { IconComponent, IconName } from '../shared/icon.component';

interface Command {
  label: string;
  hint: string;
  icon: IconName;
  run: () => void;
}

/** Ctrl/Cmd + K quick navigation across sections and actions. */
@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ui.paletteOpen()) {
      <div class="backdrop" (click)="ui.togglePalette(false)"></div>
      <div class="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <label class="search">
          <app-icon name="search" [size]="18" />
          <input #field type="text" placeholder="Jump to a section or action…" [value]="query()"
            (input)="query.set(field.value); cursor.set(0)" (keydown)="onKey($event)" aria-label="Search commands" />
          <kbd>Esc</kbd>
        </label>
        <ul role="listbox">
          @for (c of results(); track c.label; let i = $index) {
            <li role="option" [attr.aria-selected]="i === cursor()">
              <button [class.on]="i === cursor()" (mouseenter)="cursor.set(i)" (click)="exec(c)">
                <app-icon [name]="c.icon" [size]="18" />
                <span class="label">{{ c.label }}</span>
                <span class="hint mono">{{ c.hint }}</span>
              </button>
            </li>
          } @empty {
            <li class="empty">No match for “{{ query() }}”</li>
          }
        </ul>
      </div>
    }
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; z-index: 400; background: rgba(15, 27, 45, .55); animation: fade .25s var(--ease); }
    .palette { position: fixed; z-index: 401; top: 14vh; left: 50%; width: min(620px, calc(100% - 32px)); transform: translateX(-50%);
      background: var(--paper); color: var(--ink); border-radius: 18px; border: 1px solid var(--line); overflow: hidden;
      animation: pop .35s var(--ease); }
    .search { display: flex; align-items: center; gap: 12px; padding: 18px 20px; border-bottom: 1px solid var(--line); color: #5b6577; }
    input { flex: 1; border: 0; outline: 0; background: transparent; font: inherit; font-size: 17px; color: var(--ink); }
    kbd { font-family: var(--font-mono); font-size: 11px; padding: 3px 7px; border: 1px solid var(--line); border-radius: 6px; }
    ul { max-height: 50vh; overflow-y: auto; padding: 8px; }
    li button { width: 100%; display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 10px; text-align: left; }
    li button.on { background: var(--ink); color: var(--paper); }
    .label { flex: 1; font-weight: 500; }
    .hint { font-size: 10px; opacity: .6; }
    .empty { padding: 24px; text-align: center; color: #5b6577; }
    @keyframes fade { from { opacity: 0; } }
    @keyframes pop { from { opacity: 0; transform: translate(-50%, 12px) scale(.98); } }
  `,
})
export class CommandPaletteComponent {
  protected readonly ui = inject(UiService);
  private readonly router = inject(Router);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  protected readonly query = signal('');
  protected readonly cursor = signal(0);

  private readonly commands: Command[] = [
    ...SECTIONS.map((s) => ({ label: s.label, hint: 'Section', icon: s.icon, run: () => this.ui.goTo(s.id) })),
    { label: 'Drive through Nabeul', hint: '3D experience', icon: 'car', run: () => this.router.navigateByUrl('/drive') },
    { label: 'Email Dhia', hint: 'Contact', icon: 'mail', run: () => (location.href = `mailto:${IDENTITY.email}`) },
    { label: 'Open LinkedIn profile', hint: 'External', icon: 'linkedin', run: () => open(IDENTITY.linkedin, '_blank', 'noopener') },
    { label: 'Open GitHub', hint: 'External', icon: 'github', run: () => open(IDENTITY.github, '_blank', 'noopener') },
    { label: 'Back to top', hint: 'Navigation', icon: 'arrow-right', run: () => this.ui.goTo('home') },
  ];

  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.commands.filter((c) => (c.label + ' ' + c.hint).toLowerCase().includes(q)) : this.commands;
  });

  constructor() {
    effect(() => {
      if (this.ui.paletteOpen()) {
        this.query.set('');
        this.cursor.set(0);
        queueMicrotask(() => setTimeout(() => this.field()?.nativeElement.focus(), 20));
      }
    }, { allowSignalWrites: true });
  }

  @HostListener('document:keydown', ['$event'])
  globalKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.ui.togglePalette();
    } else if (e.key === 'Escape' && this.ui.paletteOpen()) {
      this.ui.togglePalette(false);
    }
  }

  protected onKey(e: KeyboardEvent): void {
    const n = this.results().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.cursor.update((c) => (c + 1) % Math.max(n, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.cursor.update((c) => (c - 1 + n) % Math.max(n, 1));
    } else if (e.key === 'Enter') {
      const c = this.results()[this.cursor()];
      if (c) this.exec(c);
    }
  }

  protected exec(c: Command): void {
    this.ui.togglePalette(false);
    c.run();
  }
}
