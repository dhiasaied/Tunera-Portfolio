import { ChangeDetectionStrategy, Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { UiService } from '../core/services/ui.service';

/** Intro curtain: the TUNÉRA wordmark assembles while a counter runs, then the curtain lifts. */
@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!gone()) {
      <div class="loader tone-dark" [class.leaving]="leaving()" aria-hidden="true">
        <div class="top mono">
          <span>Portfolio</span>
          <span>Nabeul Tunisia</span>
        </div>
        <div class="mark">
          @for (l of letters; track $index) {
            <span class="l" [style.animation-delay.ms]="120 + $index * 70">{{ l }}</span>
          }
        </div>
        <div class="bottom">
          <span class="mono">Dhia Eddine Saied</span>
          <span class="count serif">{{ progress() }}</span>
        </div>
        <span class="bar" [style.transform]="'scaleX(' + progress() / 100 + ')'"></span>
      </div>
    }
  `,
  styles: `
    .loader {
      position: fixed; inset: 0; z-index: 1000; display: grid; grid-template-rows: auto 1fr auto;
      padding: clamp(20px, 4vw, 48px); transition: transform 1s var(--ease-in-out);
    }
    .loader.leaving { transform: translateY(-100%); }
    .top, .bottom { display: flex; justify-content: space-between; align-items: end; color: var(--fg-muted); }
    .mark { display: flex; align-items: center; justify-content: center; overflow: hidden;
      font-family: var(--font-display); font-size: clamp(64px, 17vw, 260px); letter-spacing: .02em; line-height: 1; }
    .l { display: inline-block; transform: translateY(110%); animation: rise .9s var(--ease) forwards; }
    .count { font-size: clamp(48px, 8vw, 110px); line-height: .8; color: var(--fg); }
    .bar { position: absolute; left: 0; bottom: 0; height: 3px; width: 100%; background: var(--accent);
      transform-origin: left; transition: transform .1s linear; }
    @keyframes rise { to { transform: none; } }
  `,
})
export class LoaderComponent implements OnInit {
  private readonly ui = inject(UiService);
  private readonly zone = inject(NgZone);
  protected readonly letters = 'TUNÉRA'.split('');
  protected readonly progress = signal(0);
  protected readonly leaving = signal(false);
  protected readonly gone = signal(false);

  ngOnInit(): void {
    const seen = (() => {
      try { return sessionStorage.getItem('tunera:intro') === '1'; } catch { return false; }
    })();
    const duration = seen ? 500 : 1700;
    const start = performance.now();
    this.zone.runOutsideAngular(() => {
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        this.zone.run(() => this.progress.set(Math.round(eased * 100)));
        if (t < 1) requestAnimationFrame(tick);
        else this.zone.run(() => this.finish());
      };
      requestAnimationFrame(tick);
    });
  }

  private finish(): void {
    try { sessionStorage.setItem('tunera:intro', '1'); } catch { /* storage unavailable */ }
    this.leaving.set(true);
    this.ui.introDone.set(true);
    setTimeout(() => this.gone.set(true), 1050);
  }
}
