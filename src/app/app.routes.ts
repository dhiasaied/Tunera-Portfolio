import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'TUNÉRA Dhia Eddine Saied · Full Stack Developer' },
  {
    path: 'drive',
    loadComponent: () => import('./pages/drive.page').then((m) => m.DrivePage),
    title: 'Drive through Nabeul TUNÉRA',
  },
  { path: '**', redirectTo: '' },
];
