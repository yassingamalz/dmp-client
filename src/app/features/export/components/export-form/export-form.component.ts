// src/app/features/export/components/export-form/export-form.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, switchMap, tap } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FileManagerService } from '../../../../core/services/file-manager.service';
import { AutocompleteSuggestion } from '../../../../core/models/autocomplete-suggestion';

@Component({
  selector: 'app-export-form',
  standalone: false,
  templateUrl: './export-form.component.html',
  styleUrls: ['./export-form.component.scss']
})
export class ExportFormComponent implements OnInit, OnDestroy {
  exportForm: FormGroup;
  orderSuggestions: AutocompleteSuggestion[] = [];
  phaseSuggestions: AutocompleteSuggestion[] = [];
  progressiveSuggestions: AutocompleteSuggestion[] = [];
  orderLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastService: ToastService,
    private fileManagerService: FileManagerService
  ) {
    this.exportForm = this.fb.group({
      order: ['', Validators.required],
      phase: [''],
      progressive: ['']
    });
  }

  ngOnInit(): void {
    // Listen for file changes to auto-fill form
    this.fileManagerService.selectedFiles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(files => {
        if (files.length > 0 && !this.exportForm.get('order')?.value) {
          const autoFill = this.fileManagerService.tryAutoFill(files[0].name);
          if (autoFill.order || autoFill.phase) {
            this.exportForm.patchValue(autoFill);
            if (autoFill.order) {
              this.toastService.showToast('info', 'Auto-filled', `Detected order from filename: ${autoFill.order}`);
            }
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOrderInput(value: string): void {
    if (value.length < 1) {
      this.orderSuggestions = [];
      return;
    }

    this.orderLoading = true;
    this.apiService.searchWorkOrders(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workOrders) => {
          this.orderSuggestions = workOrders.map(wo => ({
            value: wo.id,
            label: wo.id,
            meta: wo.description,
            badge: 'ERP'
          }));
          this.orderLoading = false;
        },
        error: () => {
          this.orderLoading = false;
        }
      });
  }

  onOrderSelected(suggestion: AutocompleteSuggestion): void {
    this.toastService.showToast('info', 'Order Selected', `Selected work order: ${suggestion.value}`);
    this.loadPhaseSuggestions();
  }

  onPhaseInput(value: string): void {
    this.loadPhaseSuggestions(value);
  }

  onPhaseSelected(): void {
    this.loadProgressiveSuggestions();
  }

  onProgressiveInput(value: string): void {
    this.loadProgressiveSuggestions(value);
  }

  private loadPhaseSuggestions(filter = ''): void {
    const orderValue = this.exportForm.get('order')?.value;
    if (!orderValue) {
      this.phaseSuggestions = [];
      return;
    }

    this.apiService.getWorkOrderDetails(orderValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(workOrder => {
        if (workOrder) {
          let phases = workOrder.phases;
          if (filter) {
            phases = phases.filter(phase => 
              phase.toLowerCase().includes(filter.toLowerCase())
            );
          }

          this.phaseSuggestions = phases.map(phase => ({
            value: phase,
            label: phase,
            badge: 'ERP'
          }));
        } else {
          this.phaseSuggestions = [];
        }
      });
  }

  private loadProgressiveSuggestions(filter = ''): void {
    const orderValue = this.exportForm.get('order')?.value;
    const phaseValue = this.exportForm.get('phase')?.value;
    
    if (!orderValue || !phaseValue) {
      this.progressiveSuggestions = [];
      return;
    }

    this.apiService.getLastProgressive(orderValue, phaseValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(lastProgressive => {
        const nextProgressive = String(parseInt(lastProgressive) + 1).padStart(3, '0');
        
        let suggestions = [
          { value: nextProgressive, label: `${nextProgressive} (Next)`, badge: 'Suggested' },
          { value: lastProgressive, label: lastProgressive, badge: 'Last used' }
        ];

        if (filter) {
          suggestions = suggestions.filter(sugg => 
            sugg.value.includes(filter) || sugg.label.toLowerCase().includes(filter.toLowerCase())
          );
        }

        this.progressiveSuggestions = suggestions;
      });
  }

  scanBarcode(): void {
    this.apiService.generateRandomBarcode()
      .pipe(takeUntil(this.destroy$))
      .subscribe(barcode => {
        this.exportForm.patchValue({ order: barcode });
        this.toastService.showToast('success', 'Barcode Scanned', `Detected order: ${barcode}`);
      });
  }

  suggestPhase(): void {
    const orderValue = this.exportForm.get('order')?.value;
    if (!orderValue) {
      this.toastService.showToast('warning', 'Missing Order', 'Please enter an order number first');
      return;
    }

    this.apiService.getWorkOrderDetails(orderValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(workOrder => {
        if (workOrder && workOrder.phases.length > 0) {
          this.exportForm.patchValue({ phase: workOrder.phases[0] });
          this.toastService.showToast('success', 'Phase Suggested', `Set phase to: ${workOrder.phases[0]}`);
        } else {
          this.exportForm.patchValue({ phase: '10' });
          this.toastService.showToast('info', 'Default Phase', 'Set default phase: 10');
        }
      });
  }

  autoProgressive(): void {
    const orderValue = this.exportForm.get('order')?.value;
    const phaseValue = this.exportForm.get('phase')?.value;
    
    if (!orderValue || !phaseValue) {
      this.toastService.showToast('warning', 'Missing Information', 'Please enter order and phase first');
      return;
    }

    this.apiService.getLastProgressive(orderValue, phaseValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(lastProgressive => {
        const nextProgressive = String(parseInt(lastProgressive) + 1).padStart(3, '0');
        this.exportForm.patchValue({ progressive: nextProgressive });
        this.toastService.showToast('success', 'Progressive Set', `Auto-incremented to: ${nextProgressive}`);
      });
  }
}
