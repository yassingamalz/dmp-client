// src/app/features/files/components/file-filters/file-filters.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-file-filters',
  standalone: false,
  templateUrl: './file-filters.component.html',
  styleUrls: ['./file-filters.component.scss']
})
export class FileFiltersComponent {
  @Input() filterForm!: FormGroup;
  @Output() refresh = new EventEmitter<void>();

  years = ['2024', '2023', '2022'];
  months = [
    { value: '', label: 'Tutti i Mesi' },
    { value: '01', label: 'Gennaio' },
    { value: '02', label: 'Febbraio' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Aprile' },
    { value: '05', label: 'Maggio' },
    { value: '06', label: 'Giugno' },
    { value: '07', label: 'Luglio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Settembre' },
    { value: '10', label: 'Ottobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Dicembre' }
  ];

  onRefresh(): void {
    this.refresh.emit();
  }
}
