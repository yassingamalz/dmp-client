// src/app/core/services/machine.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { 
  MachineStatusDto, 
  MachineStatsDto, 
  BulkToggleRequest, 
  ApiResponse, 
  MachineToggleRequest,
  MachineToggleResponse,
  EnvironmentInfo
} from '../models/machine-status';
import { EnvironmentConfigService, BackendEnvironment } from './environment-config.service';

/**
 * Service for machine administration operations.
 * Handles communication with backend machine management API.
 */
@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private machinesSubject = new BehaviorSubject<MachineStatusDto[]>([]);
  private currentEnvironmentSubject = new BehaviorSubject<string>('development');
  private statsSubject = new BehaviorSubject<MachineStatsDto | null>(null);

  public machines$ = this.machinesSubject.asObservable();
  public currentEnvironment$ = this.currentEnvironmentSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private envConfig: EnvironmentConfigService
  ) {
    const currentEnv = this.envConfig.getCurrentEnvironment();
    this.currentEnvironmentSubject.next(currentEnv.name);
  }

  /**
   * Gets all available backend environments for selection.
   * @returns Observable of environment information array
   */
  getEnvironments(): Observable<EnvironmentInfo[]> {
    const backendEnvs = this.envConfig.getAvailableEnvironments();
    
    return of(backendEnvs.map(env => ({
      name: env.name,
      displayName: env.displayName,
      color: env.color,
      baseUrl: env.baseUrl,
      machineCount: 0
    }))).pipe(
      shareReplay(1)
    );
  }

  /**
   * Retrieves machines for the specified environment from backend API.
   * @param environment Optional environment filter
   * @returns Observable of machine status array
   */
  getMachinesByEnvironment(environment?: string): Observable<MachineStatusDto[]> {
    if (environment) {
      this.envConfig.setCurrentEnvironment(environment);
      this.currentEnvironmentSubject.next(environment);
    }

    let params = new HttpParams();
    if (environment) {
      params = params.set('environment', environment);
    }

    const apiUrl = this.envConfig.getApiUrl();
    
    return this.http.get<ApiResponse<MachineStatusDto[]>>(apiUrl, { params })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch machines');
          }
        }),
        tap(machines => {
          this.machinesSubject.next(machines);
          this.updateEnvironmentMachineCounts(machines.length);
        }),
        catchError(this.handleError<MachineStatusDto[]>('getMachinesByEnvironment', []))
      );
  }

  /**
   * Gets detailed status for a specific machine.
   * @param machineName Name of the machine to retrieve
   * @returns Observable of machine status details
   */
  getMachineStatus(machineName: string): Observable<MachineStatusDto> {
    const apiUrl = `${this.envConfig.getApiUrl()}/${machineName}`;
    
    return this.http.get<ApiResponse<MachineStatusDto>>(apiUrl)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch machine status');
          }
        }),
        catchError(this.handleError<MachineStatusDto>('getMachineStatus'))
      );
  }

  /**
   * Toggles the activation status of a machine.
   * @param request Machine toggle request containing machine name and environment
   * @returns Observable of toggle operation response
   */
  toggleMachine(request: MachineToggleRequest): Observable<MachineToggleResponse> {
    if (request.environment) {
      this.envConfig.setCurrentEnvironment(request.environment);
    }

    const apiUrl = `${this.envConfig.getApiUrl()}/${request.machineName}/toggle`;
    
    return this.http.put<ApiResponse<MachineStatusDto>>(apiUrl, {})
      .pipe(
        map(response => {
          if (response.success) {
            this.updateMachineInList(response.data);
            
            return {
              success: true,
              message: response.message,
              machine: response.data
            };
          } else {
            throw new Error(response.message || 'Failed to toggle machine');
          }
        }),
        catchError(error => {
          return of({
            success: false,
            message: this.getErrorMessage(error),
            machine: {} as MachineStatusDto
          });
        })
      );
  }

  /**
   * Performs bulk toggle operation on multiple machines.
   * @param machineNames Array of machine names to toggle
   * @returns Observable of updated machine status array
   */
  bulkToggleMachines(machineNames: string[]): Observable<MachineStatusDto[]> {
    const apiUrl = `${this.envConfig.getApiUrl()}/bulk-toggle`;
    const request: BulkToggleRequest = { machineNames };
    
    return this.http.put<ApiResponse<MachineStatusDto[]>>(apiUrl, request)
      .pipe(
        map(response => {
          if (response.success) {
            response.data.forEach(machine => this.updateMachineInList(machine));
            return response.data;
          } else {
            throw new Error(response.message || 'Bulk toggle operation failed');
          }
        }),
        catchError(this.handleError<MachineStatusDto[]>('bulkToggleMachines', []))
      );
  }

  /**
   * Toggles all machines in current environment to specified state.
   * @param environment Target environment
   * @param enabled Desired enabled state for all machines
   * @returns Observable of updated machine status array
   */
  toggleAllMachines(environment: string, enabled: boolean): Observable<MachineStatusDto[]> {
    const currentMachines = this.machinesSubject.value;
    const machineNames = currentMachines
      .filter(m => m.active)
      .filter(m => m.policyEnabled !== enabled)
      .map(m => m.machineName);

    if (machineNames.length === 0) {
      return of(currentMachines);
    }

    return this.bulkToggleMachines(machineNames);
  }

  /**
   * Retrieves machine statistics from backend API.
   * @returns Observable of machine statistics
   */
  getMachineStats(): Observable<MachineStatsDto> {
    const apiUrl = `${this.envConfig.getApiUrl()}/stats`;
    
    return this.http.get<ApiResponse<MachineStatsDto>>(apiUrl)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch statistics');
          }
        }),
        tap(stats => this.statsSubject.next(stats)),
        catchError(this.handleError<MachineStatsDto>('getMachineStats'))
      );
  }

  /**
   * Refreshes machine list for current environment.
   * @returns Observable of current machine status array
   */
  refreshMachines(): Observable<MachineStatusDto[]> {
    const currentEnv = this.getCurrentEnvironment();
    return this.getMachinesByEnvironment(currentEnv);
  }

  /**
   * Sets the current active environment.
   * @param environment Environment name to set as current
   */
  setCurrentEnvironment(environment: string): void {
    this.envConfig.setCurrentEnvironment(environment);
    this.currentEnvironmentSubject.next(environment);
  }

  /**
   * Gets the currently selected environment name.
   * @returns Current environment name string
   */
  getCurrentEnvironment(): string {
    return this.currentEnvironmentSubject.value;
  }

  /**
   * Gets current backend environment configuration details.
   * @returns Current backend environment object
   */
  getCurrentBackendEnvironment(): BackendEnvironment {
    return this.envConfig.getCurrentEnvironment();
  }

  /**
   * Updates a machine entry in the local cached list.
   * @param updatedMachine Machine with updated status
   */
  private updateMachineInList(updatedMachine: MachineStatusDto): void {
    const currentMachines = this.machinesSubject.value;
    const index = currentMachines.findIndex(m => m.machineName === updatedMachine.machineName);
    
    if (index !== -1) {
      const updatedMachines = [...currentMachines];
      updatedMachines[index] = updatedMachine;
      this.machinesSubject.next(updatedMachines);
    }
  }

  /**
   * Updates machine count for environment display.
   * @param count Current machine count
   */
  private updateEnvironmentMachineCounts(count: number): void {
    // Implementation for updating environment machine counts
  }

  /**
   * Generic HTTP error handler for service operations.
   * @param operation Name of operation that failed
   * @param result Optional fallback result to return
   * @returns Error handling function
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      if (result !== undefined) {
        return of(result);
      } else {
        return throwError(() => new Error(this.getErrorMessage(error)));
      }
    };
  }

  /**
   * Extracts user-friendly error messages from HTTP errors.
   * @param error HTTP error or general error object
   * @returns Localized error message string
   */
  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    } else if (error?.message) {
      return error.message;
    } else if (error?.status === 0) {
      return 'Impossibile connettersi al server. Verificare la connessione di rete.';
    } else if (error?.status >= 500) {
      return 'Errore interno del server. Riprovare più tardi.';
    } else if (error?.status === 404) {
      return 'Risorsa non trovata.';
    } else if (error?.status === 403) {
      return 'Accesso negato. Verificare i permessi.';
    } else {
      return 'Si è verificato un errore imprevisto.';
    }
  }
}