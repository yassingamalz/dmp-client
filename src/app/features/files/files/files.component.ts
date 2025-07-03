// src/app/features/files/files.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, combineLatest, map, startWith, delay, finalize } from 'rxjs';
import { UploadedFile } from '../../../core/models/uploaded-file';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-files',
  template: `
    <div class="files-view">
      <div class="card">
        <div class="card-header">
          <div class="card-icon">
            <i class="bi bi-archive"></i>
          </div>
          <h2 class="card-title">File Esportati</h2>
        </div>
        <div class="card-body">
          <app-file-filters 
            [filterForm]="filterForm"
            (refresh)="refreshFiles()">
          </app-file-filters>
          <app-file-browser 
            [files]="filteredFiles$ | async"
            [loading]="loading">
          </app-file-browser>
        </div>
      </div>
    </div>
  `,
  standalone: false,
  styles: [`
    .files-view {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FilesComponent implements OnInit {
  filterForm: FormGroup;
  allFiles$: Observable<UploadedFile[]>;
  filteredFiles$: Observable<UploadedFile[]> | undefined;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.filterForm = this.fb.group({
      year: ['2024'],
      month: [''],
      order: ['']
    });

    this.allFiles$ = this.apiService.getUploadedFiles().pipe(
      delay(800), // Simulate network delay
      finalize(() => this.loading = false)
    );
  }

  ngOnInit(): void {
    this.filteredFiles$ = combineLatest([
      this.allFiles$,
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      map(([files, filters]) => this.applyFilters(files, filters))
    );
  }

  refreshFiles(): void {
    this.loading = true;
    this.allFiles$ = this.apiService.getUploadedFiles().pipe(
      delay(800), // Simulate network delay
      finalize(() => this.loading = false)
    );
    this.ngOnInit(); // Re-initialize the filtered files observable
  }

  private applyFilters(files: UploadedFile[], filters: any): UploadedFile[] {
    return files.filter(file => {
      const fileDate = new Date(file.date);
      const fileYear = fileDate.getFullYear().toString();
      const fileMonth = (fileDate.getMonth() + 1).toString().padStart(2, '0');

      const yearMatch = !filters.year || fileYear === filters.year;
      const monthMatch = !filters.month || fileMonth === filters.month;
      const orderMatch = !filters.order || file.order.toLowerCase().includes(filters.order.toLowerCase());

      return yearMatch && monthMatch && orderMatch;
    });
  }
}