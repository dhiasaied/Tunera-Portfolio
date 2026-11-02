import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { CommandPaletteComponent } from './layout/command-palette.component';
import { CursorComponent } from './layout/cursor.component';
import { LoaderComponent } from './layout/loader.component';
import { NavComponent } from './layout/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, LoaderComponent, CursorComponent, CommandPaletteComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-loader />
    @if (!isDrive()) {
      <app-nav />
    }
    <main>
      <router-outlet />
    </main>
    <app-command-palette />
    <app-cursor />
  `,
})
export class AppComponent {
  private readonly router = inject(Router);
  protected readonly isDrive = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/drive')),
    ),
    { initialValue: location.pathname.startsWith('/drive') },
  );
}
