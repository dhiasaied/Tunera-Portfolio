import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject, input } from '@angular/core';

const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches;

/** Fades/slides an element in the first time it enters the viewport. */
@Directive({ selector: '[reveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  readonly revealDelay = input<number>(0);
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement as HTMLElement;
    node.classList.add('reveal');
    node.style.setProperty('--reveal-delay', `${this.revealDelay()}ms`);
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-visible');
            this.observer?.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

/** Pulls an element slightly toward the pointer used on primary calls to action. */
@Directive({ selector: '[magnetic]', standalone: true })
export class MagneticDirective implements OnInit, OnDestroy {
  readonly strength = input<number>(0.28);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private cleanup: (() => void)[] = [];

  ngOnInit(): void {
    if (!finePointer() || prefersReducedMotion()) return;
    const node = this.el.nativeElement as HTMLElement;
    node.style.transition = 'transform .35s cubic-bezier(.2,.8,.2,1)';
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * this.strength();
      const y = (e.clientY - (r.top + r.height / 2)) * this.strength();
      node.style.transform = `translate(${x}px, ${y}px)`;
    };
    const leave = () => (node.style.transform = '');
    this.zone.runOutsideAngular(() => {
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerleave', leave);
    });
    this.cleanup.push(
      () => node.removeEventListener('pointermove', move),
      () => node.removeEventListener('pointerleave', leave),
    );
  }

  ngOnDestroy(): void {
    this.cleanup.forEach((fn) => fn());
  }
}

/** Subtle 3D tilt following the pointer, for cards. */
@Directive({ selector: '[tilt]', standalone: true })
export class TiltDirective implements OnInit, OnDestroy {
  readonly maxTilt = input<number>(5);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private cleanup: (() => void)[] = [];

  ngOnInit(): void {
    if (!finePointer() || prefersReducedMotion()) return;
    const node = this.el.nativeElement as HTMLElement;
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      node.style.transform = `perspective(900px) rotateX(${-py * this.maxTilt()}deg) rotateY(${px * this.maxTilt()}deg) translateY(-4px)`;
      node.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
      node.style.setProperty('--my', `${(py + 0.5) * 100}%`);
    };
    const leave = () => (node.style.transform = '');
    this.zone.runOutsideAngular(() => {
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerleave', leave);
    });
    this.cleanup.push(
      () => node.removeEventListener('pointermove', move),
      () => node.removeEventListener('pointerleave', leave),
    );
  }

  ngOnDestroy(): void {
    this.cleanup.forEach((fn) => fn());
  }
}
