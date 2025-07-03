// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ExportHistory } from '../models/export-history';
import { ExportRequest } from '../models/export-request';
import { UploadedFile } from '../models/uploaded-file';
import { WorkOrder } from '../models/work-order';

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
}