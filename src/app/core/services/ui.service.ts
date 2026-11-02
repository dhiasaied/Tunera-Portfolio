import { DOCUMENT } from '@angular/common';
import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SectionId } from '../models/profile.models';

/** Global UI state: intro loader, command palette, mobile menu and the section in view. */
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  readonly introDone = signal(false);
  readonly paletteOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly activeSection = signal<SectionId | 'home'>('home');

  private spy?: IntersectionObserver;

  togglePalette(force?: boolean): void {
    this.paletteOpen.update((open) => force ?? !open);
  }

  toggleMenu(force?: boolean): void {
    this.menuOpen.update((open) => force ?? !open);
    this.doc.body.classList.toggle('no-scroll', this.menuOpen());
  }

  /** Scrolls to a section on the home page, navigating there first when needed. */
  async goTo(id: SectionId | 'home'): Promise<void> {
    this.toggleMenu(false);
    this.paletteOpen.set(false);
    if (!this.router.url.startsWith('/') || this.router.url.startsWith('/drive')) {
      await this.router.navigateByUrl('/');
      await new Promise((r) => setTimeout(r, 60));
    }
    const target = id === 'home' ? this.doc.body : this.doc.getElementById(id);
    if (id === 'home') {
      this.doc.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** Tracks which home-page section is currently in view. */
  watchSections(ids: readonly string[]): () => void {
    this.spy?.disconnect();
    const visible = new Map<string, number>();
    this.zone.runOutsideAngular(() => {
      this.spy = new IntersectionObserver(
        (entries) => {
          for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
          let best: string | null = null;
          let ratio = 0;
          for (const [id, r] of visible) {
            if (r > ratio) {
              ratio = r;
              best = id;
            }
          }
          const next = (best ?? 'home') as SectionId | 'home';
          if (next !== this.activeSection()) this.zone.run(() => this.activeSection.set(next));
        },
        { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] },
      );
      for (const id of ids) {
        const el = this.doc.getElementById(id);
        if (el) this.spy!.observe(el);
      }
    });
    return () => this.spy?.disconnect();
  }
}
