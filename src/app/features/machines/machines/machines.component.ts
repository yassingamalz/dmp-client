// src/app/features/machines/machines/machines.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MachineService } from '../../../core/services/machine.service';
import { ToastService } from '../../../core/services/toast.service';
import { MachineStatus, MachineToggleRequest, MachineToggleResponse } from '../../../core/models/machine-status';

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

  loading = false;
  machineToggleStates = new Map<string, boolean>();

  constructor(
    private machineService: MachineService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Load initial data
    this.loadMachines();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEnvironmentChanged(environment: string): void {
    this.loading = true;
    this.machineService.getMachinesByEnvironment(environment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (machines) => {
          this.loading = false;
          this.toastService.showToast(
            'success',
            'Ambiente Cambiato',
            `Caricate ${machines.length} macchine per ${environment}`
          );
        },
        error: (error) => {
          this.loading = false;
          this.toastService.showToast(
            'error',
            'Errore',
            'Impossibile caricare le macchine per questo ambiente'
          );
          console.error('Error loading machines:', error);
        }
      });
  }

  onMachineToggle(request: MachineToggleRequest): void {
    // Set loading state for specific machine
    this.machineToggleStates.set(request.machineId, true);

    this.machineService.toggleMachine(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: MachineToggleResponse) => {
          this.machineToggleStates.delete(request.machineId);

          if (response.success) {
            this.toastService.showToast(
              'success',
              'Macchina Aggiornata',
              response.message
            );
          } else {
            this.toastService.showToast(
              'error',
              'Errore',
              response.message
            );
          }
        },
        error: (error) => {
          this.machineToggleStates.delete(request.machineId);
          this.toastService.showToast(
            'error',
            'Errore di Connessione',
            'Impossibile aggiornare lo stato della macchina'
          );
          console.error('Error toggling machine:', error);
        }
      });
  }

  onMachineViewDetails(machine: MachineStatus): void {
    // For now, show a toast with machine details
    // In a real app, this could open a detailed modal
    this.toastService.showToast(
      'info',
      'Dettagli Macchina',
      `${machine.label} - ${machine.machine}`
    );
  }

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

  onToggleAllMachines(enabled: boolean): void {
    const currentEnv = this.machineService.getCurrentEnvironment();
    this.loading = true;

    this.machineService.toggleAllMachines(currentEnv, enabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (responses) => {
          this.loading = false;
          const action = enabled ? 'attivate' : 'disattivate';
          this.toastService.showToast(
            'success',
            'Operazione Completata',
            `Tutte le macchine sono state ${action}`
          );

          // Refresh the machines list
          this.onRefreshMachines();
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

  onExportConfiguration(): void {
    // Mock implementation - in real app, this would call an API endpoint
    this.toastService.showToast(
      'info',
      'Esportazione Configurazione',
      'Funzionalità in sviluppo'
    );

    // Example of what this could do:
    // this.machineService.exportConfiguration().subscribe(...)
  }

  getMachineToggleState(machineId: string): boolean {
    return this.machineToggleStates.get(machineId) || false;
  }

  private loadMachines(): void {
    const currentEnv = this.machineService.getCurrentEnvironment();
    this.onEnvironmentChanged(currentEnv);
  }

  trackByMachineId(index: number, machine: MachineStatus): string {
    return machine.id;
  }
}