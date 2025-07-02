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
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ExportComponent { }

