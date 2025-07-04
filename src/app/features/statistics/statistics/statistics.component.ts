// src/app/features/statistics/statistics.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil, finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProcessingStatistics } from '../../../core/models/statistics';

@Component({
  selector: 'app-statistics',
  template: `
    <div class="statistics-view">
      <div class="stats-header">
        <div class="card">
          <div class="card-header">
            <div class="card-icon">
              <i class="bi bi-graph-up"></i>
            </div>
            <h2 class="card-title">Statistiche Elaborazione</h2>
          </div>
          <div class="card-body">
            <div class="stats-overview">
              <div class="overview-item">
                <div class="overview-label">Macchine Totali</div>
                <div class="overview-value">{{ (statistics$ | async)?.totalMachines || 0 }}</div>
              </div>
              <div class="overview-item">
                <div class="overview-label">Macchine Attive</div>
                <div class="overview-value success">{{ (statistics$ | async)?.activeMachines || 0 }}</div>
              </div>
              <div class="overview-item">
                <div class="overview-label">File Totali</div>
                <div class="overview-value">{{ (statistics$ | async)?.totalFiles || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <app-stats-dashboard 
        [statistics]="statistics$ | async"
        [loading]="loading">
      </app-stats-dashboard>
    </div>
  `,
  standalone: false,
  styles: [`
    .statistics-view {
      animation: fadeIn 0.3s ease;
    }

    .stats-header {
      margin-bottom: 2rem;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 2rem;
      text-align: center;
    }

    .overview-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .overview-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .overview-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);

      &.success {
        color: var(--success-color);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class StatisticsComponent implements OnInit, OnDestroy {
  statistics$: Observable<ProcessingStatistics> | undefined;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatistics(): void {
    this.loading = true;
    this.statistics$ = this.apiService.getProcessingStatistics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      );

    this.statistics$.subscribe({
      error: () => {
        this.toastService.showError('Errore Caricamento', 'Impossibile caricare le statistiche');
      }
    });
  }
}