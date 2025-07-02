// src/app/core/services/file-manager.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private selectedFiles = new BehaviorSubject<File[]>([]);
  public selectedFiles$ = this.selectedFiles.asObservable();

  private validExtensions = ['.txt', '.csv', '.pdf', '.hdr.txt', '.chr.txt', '.fet.txt'];

  addFiles(files: File[]): { added: File[], rejected: File[] } {
    const currentFiles = this.selectedFiles.value;
    const added: File[] = [];
    const rejected: File[] = [];

    files.forEach(file => {
      const isValid = this.isValidFile(file);
      const isUnique = !currentFiles.find(f => f.name === file.name);

      if (isValid && isUnique) {
        added.push(file);
      } else {
        rejected.push(file);
      }
    });

    if (added.length > 0) {
      this.selectedFiles.next([...currentFiles, ...added]);
    }

    return { added, rejected };
  }

  removeFile(index: number): File | null {
    const currentFiles = this.selectedFiles.value;
    if (index >= 0 && index < currentFiles.length) {
      const removedFile = currentFiles[index];
      const updatedFiles = currentFiles.filter((_, i) => i !== index);
      this.selectedFiles.next(updatedFiles);
      return removedFile;
    }
    return null;
  }

  clearFiles(): void {
    this.selectedFiles.next([]);
  }

  private isValidFile(file: File): boolean {
    return this.validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext.toLowerCase())
    );
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  tryAutoFill(filename: string): { order?: string; phase?: string } {
    const result: { order?: string; phase?: string } = {};
    
    const orderMatch = filename.match(/ORD[_-]?(\d{4}[_-]?\d{3})/i);
    const phaseMatch = filename.match(/phase[_-]?(\d+)/i);
    
    if (orderMatch) {
      result.order = orderMatch[0];
    }
    if (phaseMatch) {
      result.phase = phaseMatch[1];
    }
    
    return result;
  }
}