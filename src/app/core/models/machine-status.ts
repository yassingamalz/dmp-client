// src/app/core/models/machine-status.ts
export interface MachineStatusDto {
  id: string;
  machineName: string;
  displayName: string;
  folders: string[];
  roots?: string[];
  active: boolean;
  policyEnabled: boolean;
  lastModified: string;
  environment?: string;
}

export interface MachineStatsDto {
  totalMachines: number;
  activeMachines: number;
  enabledMachines: number;
  disabledMachines: number;
  inactiveMachines: number;
}

export interface BulkToggleRequest {
  machineNames: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface MachineToggleRequest {
  machineName: string;
  environment: string;
}

export interface MachineToggleResponse {
  success: boolean;
  message: string;
  machine: MachineStatusDto;
}

export interface EnvironmentInfo {
  name: string;
  displayName: string;
  color: string;
  baseUrl: string;
  machineCount: number;
}

// Legacy interface for compatibility (can be removed later)
export interface MachineStatus {
  id: string;
  label: string;
  machine: string;
  output: string;
  environment: string;
  active: boolean;
  policyEnabled: boolean;
  enabledFileExtensions: string[];
  lastModified: string;
  listaMachine?: MachineConfig[];
}

export interface MachineConfig {
  label: string;
  machina: string;
  output: string;
  enabledFileExtensions: string[];
  active: boolean;
}