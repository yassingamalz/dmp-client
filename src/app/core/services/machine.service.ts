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
  private environmentsSubject = new BehaviorSubject<EnvironmentInfo[]>([]);

  public machines$ = this.machinesSubject.asObservable();
  public currentEnvironment$ = this.currentEnvironmentSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public environments$ = this.environmentsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private envConfig: EnvironmentConfigService
  ) {
    const currentEnv = this.envConfig.getCurrentEnvironment();
    this.currentEnvironmentSubject.next(currentEnv.name);
  }

  /**
   * Gets all available backend environments with machine counts.
   */
  getEnvironments(): Observable<EnvironmentInfo[]> {
    const backendEnvs = this.envConfig.getAvailableEnvironments();

    const environmentsWithCounts = backendEnvs.map(env => ({
      name: env.name,
      displayName: env.displayName,
      color: env.color,
      baseUrl: env.baseUrl,
      machineCount: 0
    }));

    const currentEnvironments = this.environmentsSubject.value;
    if (currentEnvironments.length > 0) {
      return of(currentEnvironments);
    } else {
      this.environmentsSubject.next(environmentsWithCounts);
      return of(environmentsWithCounts);
    }
  }

  /**
   * Retrieves machines for the specified environment from backend API.
   */
  getMachinesByEnvironment(environment?: string): Observable<MachineStatusDto[]> {
    // Clear existing machines when switching environments to prevent stale data
    this.machinesSubject.next([]);

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
            return response.data.map(machine => this.mapBackendResponse(machine));
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
   */
  getMachineStatus(machineName: string): Observable<MachineStatusDto> {
    const normalizedMachineName = machineName.toLowerCase();
    const apiUrl = `${this.envConfig.getApiUrl()}/${normalizedMachineName}`;

    return this.http.get<ApiResponse<MachineStatusDto>>(apiUrl)
      .pipe(
        map(response => {
          if (response.success) {
            return this.mapBackendResponse(response.data);
          } else {
            throw new Error(response.message || 'Failed to fetch machine status');
          }
        }),
        catchError(this.handleError<MachineStatusDto>('getMachineStatus'))
      );
  }

  /**
   * Toggles the activation status of a machine.
   */
  toggleMachine(request: MachineToggleRequest): Observable<MachineToggleResponse> {
    if (request.environment) {
      this.envConfig.setCurrentEnvironment(request.environment);
    }

    // Convert machine name to lowercase for API URL
    const normalizedMachineName = request.machineName.toLowerCase();
    const apiUrl = `${this.envConfig.getApiUrl()}/${normalizedMachineName}/toggle`;

    // Store original machine state for rollback on error
    const originalMachine = this.machinesSubject.value.find(m =>
      m.machineName.toLowerCase() === normalizedMachineName
    );

    return this.http.put<ApiResponse<MachineStatusDto>>(apiUrl, {})
      .pipe(
        map(response => {
          if (response.success) {
            const mappedMachine = this.mapBackendResponse(response.data);
            this.updateMachineInList(mappedMachine);

            return {
              success: true,
              message: response.message,
              machine: mappedMachine
            };
          } else {
            throw new Error(response.message || 'Failed to toggle machine');
          }
        }),
        catchError(error => {
          // Rollback UI state on error if we have the original machine state
          if (originalMachine) {
            this.updateMachineInList(originalMachine);
          }

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
   */
  bulkToggleMachines(machineNames: string[]): Observable<MachineStatusDto[]> {
    const apiUrl = `${this.envConfig.getApiUrl()}/bulk-toggle`;
    // Convert machine names to lowercase for bulk operations
    const normalizedMachineNames = machineNames.map(name => name.charAt(0).toLowerCase() + name.slice(1)); const request: BulkToggleRequest = { machineNames: normalizedMachineNames };

    return this.http.put<ApiResponse<MachineStatusDto[]>>(apiUrl, request)
      .pipe(
        map(response => {
          if (response.success) {
            const mappedMachines = response.data.map(machine => this.mapBackendResponse(machine));
            mappedMachines.forEach(machine => this.updateMachineInList(machine));
            return mappedMachines;
          } else {
            throw new Error(response.message || 'Bulk toggle operation failed');
          }
        }),
        catchError(this.handleError<MachineStatusDto[]>('bulkToggleMachines', []))
      );
  }

  /**
   * Toggles all machines in current environment to specified state.
   */
  toggleAllMachines(environment: string, enabled: boolean): Observable<MachineStatusDto[]> {
    const currentMachines = this.machinesSubject.value;
    const machineNames = currentMachines
      .filter(m => m.annotationActive)
      .filter(m => m.policyEnabled !== enabled)
      .map(m => m.machineName);

    if (machineNames.length === 0) {
      return of(currentMachines);
    }

    return this.bulkToggleMachines(machineNames);
  }

  /**
   * Retrieves machine statistics from backend API.
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
   */
  refreshMachines(): Observable<MachineStatusDto[]> {
    const currentEnv = this.getCurrentEnvironment();
    return this.getMachinesByEnvironment(currentEnv);
  }

  /**
   * Sets the current active environment.
   */
  setCurrentEnvironment(environment: string): void {
    this.envConfig.setCurrentEnvironment(environment);
    this.currentEnvironmentSubject.next(environment);
  }

  /**
   * Gets the currently selected environment name.
   */
  getCurrentEnvironment(): string {
    return this.currentEnvironmentSubject.value;
  }

  /**
   * Gets current backend environment configuration details.
   */
  getCurrentBackendEnvironment(): BackendEnvironment {
    return this.envConfig.getCurrentEnvironment();
  }

  /**
   * Updates machine count for environment display.
   */
  private updateEnvironmentMachineCounts(count: number): void {
    const currentEnv = this.getCurrentEnvironment();

    this.getEnvironments().subscribe(environments => {
      const updatedEnvironments = environments.map(env => ({
        ...env,
        machineCount: env.name === currentEnv ? count : env.machineCount
      }));

      this.environmentsSubject.next(updatedEnvironments);
    });
  }

  /**
   * Updates a machine in the current machines list.
   */
  private updateMachineInList(updatedMachine: MachineStatusDto): void {
    const currentMachines = this.machinesSubject.value;
    const index = currentMachines.findIndex(m =>
      m.machineName.toLowerCase() === updatedMachine.machineName.toLowerCase()
    );

    if (index >= 0) {
      currentMachines[index] = {
        ...currentMachines[index],
        ...updatedMachine,
        overallActive: updatedMachine.overallActive,
        annotationActive: updatedMachine.annotationActive,
        policyEnabled: updatedMachine.policyEnabled
      };

      this.machinesSubject.next([...currentMachines]);
    }
  }

  /**
   * Maps backend response to frontend model.
   */
  private mapBackendResponse(backendData: any): MachineStatusDto {
    return {
      id: backendData.machineName,
      machineName: backendData.machineName,
      displayName: backendData.displayName,
      folders: backendData.folders || [],
      roots: backendData.roots || [],
      annotationActive: backendData.annotationActive,
      policyEnabled: backendData.policyEnabled,
      overallActive: backendData.overallActive,
      environment: backendData.environment,
      root: backendData.root,
      lastStartup: backendData.lastStartup,
      status: backendData.status,
      lastModified: backendData.lastModified || backendData.lastStartup || new Date().toISOString()
    };
  }

  /**
   * Generic HTTP error handler for service operations.
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
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.error) {
      return error.error.error;
    }

    if (error.message) {
      return error.message;
    }

    return `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
  }
}