// src/app/features/export/export.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-export',
  standalone: false,
  template: `
    <div class="export-view">
      <app-export-form></app-export-form>
      <app-file-upload></app-file-upload>
    </div>
  `,
  styles: [`
    .export-view {
      animation: fadeInUp 0.5s ease-out forwards;
    }

    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ExportComponent { }