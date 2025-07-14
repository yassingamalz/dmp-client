// src/app/features/export/export/export.component.ts
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';

@Component({
  selector: 'app-export',
  standalone: false,
  template: `
    <div class="export-view">
      <div class="export-container">
        <div class="export-main-content">
          <app-export-form></app-export-form>
          <app-file-upload></app-file-upload>
        </div>
        <div class="export-sidebar">
          <app-file-candidates></app-file-candidates>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Global override for export view */
    :host ::ng-deep .main-content.export-expanded {
      max-width: 1600px !important;
    }

    @media (max-width: 1650px) {
      :host ::ng-deep .main-content.export-expanded {
        max-width: 1400px !important;
      }
    }

    @media (max-width: 1200px) {
      :host ::ng-deep .main-content.export-expanded {
        max-width: 1200px !important;
      }
    }

    .export-view {
      animation: fadeInUp 0.5s ease-out forwards;
    }

    .export-container {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
      width: 100%;
    }

    .export-main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      min-width: 0;
    }

    .export-sidebar {
      width: 400px;
      flex-shrink: 0;
    }

    @media (max-width: 1200px) {
      .export-container {
        gap: 1.5rem;
      }
      
      .export-sidebar {
        width: 350px;
      }
    }

    @media (max-width: 768px) {
      .export-container {
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .export-sidebar {
        width: 100%;
        order: -1;
      }
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
export class ExportComponent implements OnInit, OnDestroy {
  
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    // Add class to main-content to expand it
    const mainContent = this.document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.add('export-expanded');
    }
  }

  ngOnDestroy(): void {
    // Remove class when leaving export view
    const mainContent = this.document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('export-expanded');
    }
  }
}