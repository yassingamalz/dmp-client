// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/export', pathMatch: 'full' },
  { 
    path: 'export', 
    loadChildren: () => import('./features/export/export.module').then(m => m.ExportModule)
  },
  { 
    path: 'files', 
    loadChildren: () => import('./features/files/files.module').then(m => m.FilesModule)
  },
  { path: '**', redirectTo: '/export' }
];