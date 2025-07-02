// src/app/core/models/machine-config.interface.ts
export interface MachineConfig {
  label: string;
  machina: string;
  output: string;
  enabledFileExtensions: string[];
  active: boolean;
}

export interface MachineFolderMapping {
  label: string;
  machine: string;
  listaMachine: MachineConfig[];
  output: string;
  enabledFileExtensions: string[];
  active: boolean;
}