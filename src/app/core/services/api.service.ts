// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ExportHistory } from '../models/export-history';
import { ExportRequest } from '../models/export-request';
import { UploadedFile } from '../models/uploaded-file';
import { WorkOrder } from '../models/work-order';
import { MachineStatistics, ErrorSummary, ProcessingStatistics } from '../models/statistics';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private mockWorkOrders: WorkOrder[] = [
    { id: "ORD-2024-001", description: "Assemblaggio Testata Cilindri", phases: ["10", "20", "30", "40"] },
    { id: "ORD-2024-002", description: "Lavorazione Monoblocco Motore", phases: ["15", "25", "35"] },
    { id: "WO-2024-152", description: "Produzione Fasce Elastiche", phases: ["05", "15", "25"] },
    { id: "ORD-2024-003", description: "Lavorazione Albero Motore", phases: ["10", "20", "30"] }
  ];

  private mockExportHistory: ExportHistory[] = [
    { order: "ORD-2024-001", phase: "10", progressive: "001", machine: "CG008668", date: "2024-07-01" },
    { order: "ORD-2024-001", phase: "20", progressive: "002", machine: "CG008668", date: "2024-07-01" },
    { order: "WO-2024-152", phase: "15", progressive: "001", machine: "CG008668", date: "2024-06-30" },
    { order: "ORD-2024-003", phase: "10", progressive: "001", machine: "CG008668", date: "2024-06-29" }
  ];

  private mockUploadedFiles: UploadedFile[] = [
    {
      name: "CG008668§ORD-2024-001§10§001#measurement1.hdr.txt",
      size: 15420,
      date: "2024-07-01T10:30:00",
      order: "ORD-2024-001",
      phase: "10",
      progressive: "001"
    },
    {
      name: "CG008668§ORD-2024-001§20§002#measurement2.chr.txt",
      size: 8960,
      date: "2024-07-01T14:15:00",
      order: "ORD-2024-001",
      phase: "20",
      progressive: "002"
    },
    {
      name: "CG008668§WO-2024-152§15§001#profile_data.csv",
      size: 25600,
      date: "2024-06-30T09:45:00",
      order: "WO-2024-152",
      phase: "15",
      progressive: "001"
    },
    {
      name: "CG008668§ORD-2024-003§10§001#report.pdf",
      size: 127840,
      date: "2024-06-29T16:20:00",
      order: "ORD-2024-003",
      phase: "10",
      progressive: "001"
    }
  ];

  private mockMachineStats: MachineStatistics[] = [
    {
      machineId: 'CG008668',
      machineName: 'Zeiss Prismo 5',
      lastMonth: { processed: 1247, done: 1189, errors: 58, successRate: 95.3 },
      lastYear: { processed: 14562, done: 13891, errors: 671, successRate: 95.4 },
      overall: { processed: 45231, done: 42876, errors: 2355, successRate: 94.8 }
    },
    {
      machineId: 'CG008669',
      machineName: 'Zeiss Contura G2',
      lastMonth: { processed: 892, done: 761, errors: 131, successRate: 85.3 },
      lastYear: { processed: 10847, done: 9234, errors: 1613, successRate: 85.1 },
      overall: { processed: 32156, done: 27312, errors: 4844, successRate: 84.9 }
    },
    {
      machineId: 'CG008670',
      machineName: 'Mitutoyo Crysta-Apex',
      lastMonth: { processed: 1567, done: 1456, errors: 111, successRate: 92.9 },
      lastYear: { processed: 18734, done: 17389, errors: 1345, successRate: 92.8 },
      overall: { processed: 56782, done: 52341, errors: 4441, successRate: 92.2 }
    },
    {
      machineId: 'CG008671',
      machineName: 'Hexagon Optiv Performance',
      lastMonth: { processed: 743, done: 512, errors: 231, successRate: 68.9 },
      lastYear: { processed: 8956, done: 6234, errors: 2722, successRate: 69.6 },
      overall: { processed: 28347, done: 19672, errors: 8675, successRate: 69.4 }
    }
  ];

  private mockRecentErrors: ErrorSummary[] = [
    {
      id: 'err-001',
      fileName: 'measurement_001.hdr.txt',
      machineId: 'CG008669',
      errorReason: 'File corrotto durante il trasferimento',
      timestamp: '2024-07-04T09:15:00',
      order: 'ORD-2024-001',
      phase: '10'
    },
    {
      id: 'err-002',
      fileName: 'profile_data_v2.csv',
      machineId: 'CG008671',
      errorReason: 'Formato dati non riconosciuto',
      timestamp: '2024-07-04T08:42:00',
      order: 'WO-2024-152'
    },
    {
      id: 'err-003',
      fileName: 'calibration.chr.txt',
      machineId: 'CG008670',
      errorReason: 'Parametri di calibrazione mancanti',
      timestamp: '2024-07-04T07:28:00',
      order: 'ORD-2024-003',
      phase: '20'
    },
    {
      id: 'err-004',
      fileName: 'final_report.pdf',
      machineId: 'CG008668',
      errorReason: 'Dimensioni file eccessive',
      timestamp: '2024-07-03T16:45:00',
      order: 'ORD-2024-002'
    },
    {
      id: 'err-005',
      fileName: 'temp_measure.fet.txt',
      machineId: 'CG008669',
      errorReason: 'Timestamp non valido',
      timestamp: '2024-07-03T14:22:00'
    }
  ];

  searchWorkOrders(query: string): Observable<WorkOrder[]> {
    let results: WorkOrder[];

    // If query is empty, return all work orders
    if (query === '') {
      results = [...this.mockWorkOrders];
    } else {
      results = this.mockWorkOrders.filter(wo =>
        wo.id.toLowerCase().includes(query.toLowerCase()) ||
        wo.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    return of(results).pipe(delay(500));
  }

  getWorkOrderDetails(orderId: string): Observable<WorkOrder | null> {
    const workOrder = this.mockWorkOrders.find(wo => wo.id === orderId);
    return of(workOrder || null).pipe(delay(300));
  }

  getLastProgressive(order: string, phase: string): Observable<string> {
    const entries = this.mockExportHistory
      .filter(exp => exp.order === order && exp.phase === phase)
      .sort((a, b) => parseInt(b.progressive) - parseInt(a.progressive));

    const lastProgressive = entries.length > 0 ? entries[0].progressive : "000";
    return of(lastProgressive).pipe(delay(200));
  }

  exportFiles(request: ExportRequest): Observable<{ success: boolean; message: string }> {
    return of({
      success: true,
      message: `Esportati con successo ${request.payload.length} file`
    }).pipe(delay(2000));
  }

  getUploadedFiles(filters?: { year?: string; month?: string; order?: string }): Observable<UploadedFile[]> {
    let filteredFiles = [...this.mockUploadedFiles];

    if (filters) {
      filteredFiles = filteredFiles.filter(file => {
        const fileDate = new Date(file.date);
        const fileYear = fileDate.getFullYear().toString();
        const fileMonth = (fileDate.getMonth() + 1).toString().padStart(2, '0');

        const yearMatch = !filters.year || fileYear === filters.year;
        const monthMatch = !filters.month || fileMonth === filters.month;
        const orderMatch = !filters.order || file.order.toLowerCase().includes(filters.order.toLowerCase());

        return yearMatch && monthMatch && orderMatch;
      });
    }

    return of(filteredFiles).pipe(delay(300));
  }

  generateRandomBarcode(): Observable<string> {
    const mockBarcodes = ["ORD-2024-005", "WO-2024-201", "ORD-2024-006"];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    return of(randomBarcode).pipe(delay(1000));
  }

  getProcessingStatistics(): Observable<ProcessingStatistics> {
    const totalFiles = this.mockMachineStats.reduce((sum, machine) => sum + machine.overall.processed, 0);
    const activeMachines = this.mockMachineStats.filter(m => m.lastMonth.processed > 0).length;

    const statistics: ProcessingStatistics = {
      totalMachines: this.mockMachineStats.length,
      activeMachines,
      totalFiles,
      machineStats: this.mockMachineStats,
      recentErrors: this.mockRecentErrors
    };

    return of(statistics).pipe(delay(800));
  }

  getMachineStatistics(machineId: string): Observable<MachineStatistics | null> {
    const machine = this.mockMachineStats.find(m => m.machineId === machineId);
    return of(machine || null).pipe(delay(300));
  }

  getErrorsByPeriod(period: 'lastMonth' | 'lastYear' | 'overall'): Observable<ErrorSummary[]> {
    // Filter errors based on period - simplified for demo
    let filteredErrors = [...this.mockRecentErrors];

    if (period === 'lastMonth') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      filteredErrors = filteredErrors.filter(e => new Date(e.timestamp) >= lastMonth);
    }

    return of(filteredErrors).pipe(delay(400));
  }
}