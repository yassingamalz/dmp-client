// src/app/features/statistics/statistics/statistics.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil, finalize, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { SettingsService } from '../../../core/services/settings.service';
import { MachineStatistics, ErrorSummary } from '../../../core/models/statistics';

@Component({
  selector: 'app-statistics',
  standalone: false,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit, OnDestroy {
  currentMachineStats$: Observable<MachineStatistics | null> | undefined;
  recentErrors$: Observable<ErrorSummary[]> | undefined;
  selectedPeriod: 'lastMonth' | 'lastYear' | 'overall' = 'lastMonth';
  loading = true;
  currentMachineId = '';
  currentMachineName = '';

  private destroy$ = new Subject<void>();

  periods = [
    { key: 'lastMonth' as const, label: 'Ultimo Mese' },
    { key: 'lastYear' as const, label: 'Ultimo Anno' },
    { key: 'overall' as const, label: 'Complessivo' }
  ];

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    // Get current machine info from settings
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.currentMachineId = settings.machine.machineId;
        this.currentMachineName = settings.machine.machineName;
        this.loadCurrentMachineStatistics();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentMachineStatistics(): void {
    if (!this.currentMachineId) {
      this.toastService.showWarning(
        'Configurazione Mancante',
        'ID macchina non configurato nelle impostazioni'
      );
      this.loading = false;
      return;
    }

    this.loading = true;
    
    // Load statistics for current machine only
    this.currentMachineStats$ = this.apiService.getMachineStatistics(this.currentMachineId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      );

    // Load recent errors for current machine
    this.recentErrors$ = this.apiService.getErrorsByPeriod(this.selectedPeriod)
      .pipe(
        map(errors => errors.filter(error => error.machineId === this.currentMachineId)),
        takeUntil(this.destroy$)
      );

    // Handle errors
    this.currentMachineStats$.subscribe({
      error: (error) => {
        console.error('Errore caricamento statistiche:', error);
        this.toastService.showError(
          'Errore Caricamento',
          'Impossibile caricare le statistiche della macchina'
        );
      }
    });
  }

  onPeriodChange(period: 'lastMonth' | 'lastYear' | 'overall'): void {
    this.selectedPeriod = period;
    // Reload errors for new period
    if (this.currentMachineId) {
      this.recentErrors$ = this.apiService.getErrorsByPeriod(period)
        .pipe(
          map(errors => errors.filter(error => error.machineId === this.currentMachineId)),
          takeUntil(this.destroy$)
        );
    }
  }

  refreshStatistics(): void {
    this.loadCurrentMachineStatistics();
    this.toastService.showInfo('Aggiornamento', 'Statistiche aggiornate');
  }

  openMachineSettings(): void {
    this.toastService.showInfo(
      'Impostazioni Macchina',
      'Utilizza il menu impostazioni per configurare i dettagli della macchina'
    );
  }
}