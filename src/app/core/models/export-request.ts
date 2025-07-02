// src/app/core/models/export-request.interface.ts
export interface ExportRequest {
  order: string;
  phase: string;
  progressive: string;
  behalf?: string;
  move?: boolean;
  payload: File[];
}