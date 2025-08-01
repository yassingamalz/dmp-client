// src/app/features/machines/machines/machines.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MachineService } from '../../../core/services/machine.service';
import { ToastService } from '../../../core/services/toast.service';
import { MachineStatusDto, MachineToggleRequest, MachineStatsDto } from '../../../core/models/machine-status';

/**
 * Main machine management component.
 * Provides interface for viewing and controlling machine states across environments.
 */
@Component({
  selector: 'app-machines',
  standalone: false,
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.scss']
})
export class MachinesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  machines$ = this.machineService.machines$;
  currentEnvironment$ = this.machineService.currentEnvironment$;
  stats$ = this.machineService.stats$;

  loading = false;
  machineToggleStates = new Map<string, boolean>();

  constructor(
    private machineService: MachineService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadMachines();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles environment change and loads machines for new environment.
   * @param environment Selected environment name
   */
  onEnvironmentChanged(environment: string): void {
    this.loading = true;
    this.machineService.getMachinesByEnvironment(environment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (machines) => {
          this.loading = false;
          const envName = this.getEnvironmentDisplayName(environment);
          this.toastService.showToast(
            'success',
            'Ambiente Cambiato',
            `Caricate ${machines.length} macchine per ${envName}`
          );
          this.loadStats();
        },
        error: (error) => {
          this.loading = false;
          this.toastService.showToast(
            'error',
            'Errore Connessione',
            'Impossibile caricare le macchine per questo ambiente'
          );
          console.error('Error loading machines:', error);
        }
      });
  }

  /**
   * Handles individual machine toggle operations.
   * @param request Machine toggle request
   */
  onMachineToggle(request: MachineToggleRequest): void {
    this.machineToggleStates.set(request.machineName, true);

    this.machineService.toggleMachine(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.machineToggleStates.delete(request.machineName);

          if (response.success) {
            this.toastService.showToast(
              'success',
              'Macchina Aggiornata',
              response.message
            );
            this.loadStats();
          } else {
            this.toastService.showToast(
              'error',
              'Errore Toggle',
              response.message
            );
          }
        },
        error: (error) => {
          this.machineToggleStates.delete(request.machineName);
          this.toastService.showToast(
            'error',
            'Errore di Connessione',
            'Impossibile aggiornare lo stato della macchina'
          );
          console.error('Error toggling machine:', error);
        }
      });
  }

  /**
   * Handles viewing detailed machine information.
   * @param machine Machine to view details for
   */
  onMachineViewDetails(machine: MachineStatusDto): void {
    this.machineService.getMachineStatus(machine.machineName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detailedMachine) => {
          this.toastService.showToast(
            'info',
            'Dettagli Macchina',
            `${detailedMachine.displayName || detailedMachine.machineName} - Status: ${detailedMachine.policyEnabled ? 'Attiva' : 'Inattiva'}`
          );
        },
        error: (error) => {
          this.toastService.showToast(
            'error',
            'Errore',
            'Impossibile caricare i dettagli della macchina'
          );
          console.error('Error loading machine details:', error);
        }
      });
  }

  /**
   * Refreshes the machine list for current environment.
   */
  onRefreshMachines(): void {
    this.loading = true;
    this.machineService.refreshMachines()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (machines) => {
          this.loading = false;
          this.toastService.showToast(
            'success',
            'Aggiornamento Completato',
            `${machines.length} macchine aggiornate`
          );
          this.loadStats();
        },
        error: (error) => {
          this.loading = false;
          this.toastService.showToast(
            'error',
            'Errore di Aggiornamento',
            'Impossibile aggiornare le macchine'
          );
          console.error('Error refreshing machines:', error);
        }
      });
  }

  /**
   * Performs bulk toggle operation on all machines.
   * @param enabled Target state for all machines
   */
  onToggleAllMachines(enabled: boolean): void {
    const currentEnv = this.machineService.getCurrentEnvironment();
    this.loading = true;

    this.machineService.toggleAllMachines(currentEnv, enabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (machines) => {
          this.loading = false;
          const action = enabled ? 'attivate' : 'disattivate';
          this.toastService.showToast(
            'success',
            'Operazione Completata',
            `${machines.length} macchine sono state ${action}`
          );

          this.loadStats();
        },
        error: (error) => {
          this.loading = false;
          this.toastService.showToast(
            'error',
            'Errore Operazione Massiva',
            'Impossibile aggiornare tutte le macchine'
          );
          console.error('Error toggling all machines:', error);
        }
      });
  }

  /**
   * Handles configuration export request.
   */
  onExportConfiguration(): void {
    this.toastService.showToast(
      'info',
      'Esportazione Configurazione',
      'Funzionalità in sviluppo'
    );
  }

  /**
   * Handles statistics refresh request.
   */
  onGetStats(): void {
    this.loadStats();
  }

  /**
   * Gets loading state for specific machine.
   * @param machineName Machine name to check loading state
   * @returns Boolean indicating if machine is in loading state
   */
  getMachineToggleState(machineName: string): boolean {
    return this.machineToggleStates.get(machineName) || false;
  }

  /**
   * TrackBy function for machine list rendering optimization.
   * @param index Array index
   * @param machine Machine object
   * @returns Unique identifier for tracking
   */
  trackByMachineId(index: number, machine: MachineStatusDto): string {
    return machine.machineName;
  }

  /**
   * Loads machines for current environment.
   */
  private loadMachines(): void {
    const currentEnv = this.machineService.getCurrentEnvironment();
    this.onEnvironmentChanged(currentEnv);
  }

  /**
   * Loads machine statistics from backend API.
   */
  private loadStats(): void {
    this.machineService.getMachineStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          // Statistics automatically available via stats$ observable
        },
        error: (error) => {
          console.warn('Error loading machine stats:', error);
        }
      });
  }

  /**
   * Gets display name for environment.
   * @param environment Environment name
   * @returns Localized display name
   */
  private getEnvironmentDisplayName(environment: string): string {
    const envConfig = this.machineService.getCurrentBackendEnvironment();
    return envConfig.displayName;
  }
}