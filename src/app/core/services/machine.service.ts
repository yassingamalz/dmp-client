// src/app/core/services/machine.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MachineStatus, MachineToggleRequest, MachineToggleResponse, EnvironmentInfo } from '../models/machine-status';

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private readonly baseUrl = 'http://localhost:9070/api/admin/machines';
  private machinesSubject = new BehaviorSubject<MachineStatus[]>([]);
  private currentEnvironmentSubject = new BehaviorSubject<string>('production');

  public machines$ = this.machinesSubject.asObservable();
  public currentEnvironment$ = this.currentEnvironmentSubject.asObservable();

  // Mock data based on your actual policy configuration
  private mockMachines: MachineStatus[] = [
    {
      id: 'machine-1',
      label: 'ZEISS Calypso',
      machine: 'zeissCalypso',
      output: '/zeiss',
      environment: 'production',
      active: true,
      policyEnabled: true,
      enabledFileExtensions: ['.txt', '.chr', '.hdr'],
      lastModified: '2024-07-29T10:30:00Z'
    },
    {
      id: 'machine-2',
      label: 'Adcole Measurement',
      machine: 'adcole',
      output: '/adcole',
      environment: 'production',
      active: true,
      policyEnabled: false,
      enabledFileExtensions: ['.txt', '.dat'],
      lastModified: '2024-07-29T09:15:00Z'
    },
    {
      id: 'machine-3',
      label: 'Mitutoyo Profiler',
      machine: 'mitutoyoProfiler',
      output: '/mitutoyoProfiler',
      environment: 'production',
      active: true,
      policyEnabled: true,
      enabledFileExtensions: ['.txt', '.csv'],
      lastModified: '2024-07-29T08:45:00Z'
    },
    {
      id: 'machine-4',
      label: 'Barkhausen System',
      machine: 'barkhausen',
      output: '/barkhausen',
      environment: 'production',
      active: true,
      policyEnabled: false,
      enabledFileExtensions: ['.txt', '.dat'],
      lastModified: '2024-07-29T07:30:00Z'
    },
    {
      id: 'machine-5',
      label: 'PolyWorks System',
      machine: 'polyworks',
      output: '/polyworks',
      environment: 'production',
      active: true,
      policyEnabled: true,
      enabledFileExtensions: ['.txt', '.asc', '.ply'],
      lastModified: '2024-07-29T06:15:00Z',
      listaMachine: [
        {
          label: 'Comet Scanner',
          machina: 'comet',
          output: '/comet',
          enabledFileExtensions: ['.txt', '.asc'],
          active: true
        },
        {
          label: 'Faro Scanner',
          machina: 'faro',
          output: '/faro',
          enabledFileExtensions: ['.txt', '.ply'],
          active: false
        }
      ]
    },
    {
      id: 'machine-6',
      label: 'Roughness Meter',
      machine: 'roughnessMeter',
      output: '/roughnessMeter',
      environment: 'production',
      active: true,
      policyEnabled: true,
      enabledFileExtensions: ['.txt', '.csv'],
      lastModified: '2024-07-29T05:00:00Z'
    },
    {
      id: 'machine-7',
      label: 'Tomograph System',
      machine: 'tomograph',
      output: '/tomografo',
      environment: 'production',
      active: false,
      policyEnabled: false,
      enabledFileExtensions: ['.txt', '.dcm'],
      lastModified: '2024-07-28T18:30:00Z'
    },
    {
      id: 'machine-8',
      label: 'Jenoptik Measurement',
      machine: 'jenoptik',
      output: '/jenoptik',
      environment: 'production',
      active: true,
      policyEnabled: true,
      enabledFileExtensions: ['.txt', '.dat'],
      lastModified: '2024-07-29T04:20:00Z'
    }
  ];

  private environments: EnvironmentInfo[] = [
    { name: 'production', displayName: 'Produzione', color: '#dc3545', machineCount: 0 },
    { name: 'integration', displayName: 'Integrazione', color: '#fd7e14', machineCount: 0 },
    { name: 'development', displayName: 'Sviluppo', color: '#198754', machineCount: 0 }
  ];

  constructor(private http: HttpClient) {
    this.updateMachineCounters();
    this.machinesSubject.next(this.mockMachines);
  }

  getEnvironments(): Observable<EnvironmentInfo[]> {
    return of(this.environments).pipe(delay(300));
  }

  getMachinesByEnvironment(environment: string): Observable<MachineStatus[]> {
    // In real implementation, this would call the backend API
    // return this.http.get<MachineStatus[]>(`${this.baseUrl}/${environment}`);
    
    // Mock implementation
    const filteredMachines = this.mockMachines.map(machine => ({
      ...machine,
      environment
    }));
    
    this.machinesSubject.next(filteredMachines);
    return of(filteredMachines).pipe(delay(500));
  }

  toggleMachine(request: MachineToggleRequest): Observable<MachineToggleResponse> {
    // In real implementation:
    // return this.http.put<MachineToggleResponse>(`${this.baseUrl}/${request.environment}/${request.machineId}/toggle`, request);
    
    // Mock implementation
    const machines = this.machinesSubject.value;
    const machineIndex = machines.findIndex(m => m.id === request.machineId);
    
    if (machineIndex !== -1) {
      const updatedMachine = {
        ...machines[machineIndex],
        policyEnabled: request.enabled,
        lastModified: new Date().toISOString()
      };
      
      const updatedMachines = [...machines];
      updatedMachines[machineIndex] = updatedMachine;
      this.machinesSubject.next(updatedMachines);
      
      return of({
        success: true,
        message: `Macchina ${request.enabled ? 'attivata' : 'disattivata'} con successo`,
        machine: updatedMachine
      }).pipe(delay(800));
    }
    
    return of({
      success: false,
      message: 'Macchina non trovata',
      machine: {} as MachineStatus
    }).pipe(delay(800));
  }

  setCurrentEnvironment(environment: string): void {
    this.currentEnvironmentSubject.next(environment);
    this.getMachinesByEnvironment(environment).subscribe();
  }

  getCurrentEnvironment(): string {
    return this.currentEnvironmentSubject.value;
  }

  private updateMachineCounters(): void {
    this.environments.forEach(env => {
      env.machineCount = this.mockMachines.filter(m => m.active).length;
    });
  }

  // Utility methods for bulk operations
  toggleAllMachines(environment: string, enabled: boolean): Observable<MachineToggleResponse[]> {
    const machines = this.machinesSubject.value;
    const toggleRequests = machines.map(machine => ({
      machineId: machine.id,
      environment,
      enabled
    }));

    // Process all toggle requests
    const responses$ = toggleRequests.map(request => this.toggleMachine(request));
    
    // In real implementation, you might want to use forkJoin for parallel requests
    return of(responses$.map(() => ({
      success: true,
      message: `Tutte le macchine ${enabled ? 'attivate' : 'disattivate'}`,
      machine: {} as MachineStatus
    }))).pipe(delay(1000));
  }

  refreshMachines(): Observable<MachineStatus[]> {
    const currentEnv = this.getCurrentEnvironment();
    return this.getMachinesByEnvironment(currentEnv);
  }
}