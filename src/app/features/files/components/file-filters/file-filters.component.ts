// src/app/features/files/components/file-filters/file-filters.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-file-filters',
  standalone:false,
  templateUrl: './file-filters.component.html',
  styleUrls: ['./file-filters.component.scss']
})
export class FileFiltersComponent {
  @Input() filterForm!: FormGroup;
  @Output() refresh = new EventEmitter<void>();

  years = ['2024', '2023', '2022'];
  months = [
    { value: '', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  onRefresh(): void {
    this.refresh.emit();
  }
}
