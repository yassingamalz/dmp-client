// src/app/core/models/settings.ts
export interface AppSettings {
  fileDetection: FileDetectionSettings;
  machine: MachineSettings;
  export: ExportSettings;
  connection: ConnectionSettings;
  ui: UISettings;
  advanced: AdvancedSettings;
}

export interface FileDetectionSettings {
  watchFolderPath: string;
  enabledExtensions: string[];
  scanFrequency: 'realtime' | '30s' | '1min' | '5min';
  includeSubdirectories: boolean;
  autoAddCandidates: boolean;
}

export interface MachineSettings {
  machineId: string;
  machineName: string;
  machineType: string;
  outputFolder: string;
  isActive: boolean;
}

export interface ExportSettings {
  defaultAction: 'move' | 'copy';
  autoFillStrategy: 'filename' | 'directory' | 'none';
  fileNamingConvention: string;
  showConfirmationDialogs: boolean;
}

export interface ConnectionSettings {
  serverUrl: string;
  connectionTimeout: number;
  retryAttempts: number;
  autoReconnect: boolean;
}

export interface UISettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  enableNotifications: boolean;
  autoRefreshInterval: number;
}

export interface AdvancedSettings {
  debugMode: boolean;
  cacheDuration: number;
  batchSize: number;
  maxConcurrentOperations: number;
}