// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/export', 
    pathMatch: 'full' 
  },
  {
    path: 'export',
    loadChildren: () => import('./features/export/export.module').then(m => m.ExportModule)
  },
  {
    path: 'files',
    loadChildren: () => import('./features/files/files.module').then(m => m.FilesModule)
  },
  {
    path: 'statistics',
    loadChildren: () => import('./features/statistics/statistics.module').then(m => m.StatisticsModule)
  },
  {
    path: 'machines',
    loadChildren: () => import('./features/machines/machines.module').then(m => m.MachinesModule)
  },
  { 
    path: '**', 
    redirectTo: '/export' 
  }
];