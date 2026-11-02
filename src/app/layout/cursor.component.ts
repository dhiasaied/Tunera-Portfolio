import { ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, OnInit, inject, viewChild } from '@angular/core';

/** A quiet two-part cursor (dot + trailing ring) for fine pointers only. */
@Component({
  selector: 'app-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span #ring class="ring"></span><span #dot class="dot"></span>`,
  styles: `
    :host { position: fixed; inset: 0; pointer-events: none; z-index: 2000; display: none; }
    :host(.on) { display: block; }
    .dot, .ring { position: fixed; left: 0; top: 0; border-radius: 50%; will-change: transform; }
    .dot { width: 6px; height: 6px; margin: -3px 0 0 -3px; background: var(--terra); }
    .ring { width: 36px; height: 36px; margin: -18px 0 0 -18px; border: 1px solid rgba(15, 27, 45, .45);
      transition: width .3s var(--ease), height .3s var(--ease), margin .3s var(--ease), border-color .3s, background-color .3s; }
    .ring.hover { width: 64px; height: 64px; margin: -32px 0 0 -32px; border-color: var(--terra); background: rgba(192, 83, 43, .08); }
  `,
})
export class CursorComponent implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly ring = viewChild.required<ElementRef<HTMLElement>>('ring');
  private raf = 0;
  private off: () => void = () => {};

  ngOnInit(): void {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.host.nativeElement.classList.add('on');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const t = e.target as HTMLElement | null;
      const interactive = !!t?.closest('a, button, [role=button], input, .card, canvas');
      this.ring().nativeElement.classList.toggle('hover', interactive);
    };
    this.zone.runOutsideAngular(() => {
      addEventListener('pointermove', move, { passive: true });
      const loop = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        this.dot().nativeElement.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
        this.ring().nativeElement.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    });
    this.off = () => removeEventListener('pointermove', move);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.off();
  }
}
