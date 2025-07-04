// src/app/core/models/statistics.ts
export interface MachineStatistics {
  machineId: string;
  machineName: string;
  lastMonth: {
    processed: number;
    done: number;
    errors: number;
    successRate: number;
  };
  lastYear: {
    processed: number;
    done: number;
    errors: number;
    successRate: number;
  };
  overall: {
    processed: number;
    done: number;
    errors: number;
    successRate: number;
  };
}

export interface ProcessingStatistics {
  totalMachines: number;
  activeMachines: number;
  totalFiles: number;
  machineStats: MachineStatistics[];
  recentErrors: ErrorSummary[];
}

export interface ErrorSummary {
  id: string;
  fileName: string;
  machineId: string;
  errorReason: string;
  timestamp: string;
  order?: string;
  phase?: string;
}

export interface StatsPeriod {
  period: 'lastMonth' | 'lastYear' | 'overall';
  label: string;
  processed: number;
  done: number;
  errors: number;
  successRate: number;
}