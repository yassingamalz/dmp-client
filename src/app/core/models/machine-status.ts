// src/app/core/models/machine-status.ts
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

export interface MachineToggleRequest {
  machineId: string;
  environment: string;
  enabled: boolean;
}

export interface MachineToggleResponse {
  success: boolean;
  message: string;
  machine: MachineStatus;
}

export interface EnvironmentInfo {
  name: string;
  displayName: string;
  color: string;
  machineCount: number;
}