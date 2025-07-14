// src/app/core/services/file-manager.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CandidateFile } from '../models/candidate-file';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  private selectedFiles = new BehaviorSubject<File[]>([]);
  public selectedFiles$ = this.selectedFiles.asObservable();

  // Track files that came from candidates for bidirectional sync
  private candidateFileMap = new Map<string, CandidateFile>();

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
        
        // Track if this file came from candidates
        const candidateFile = (file as any).candidateFile as CandidateFile;
        if (candidateFile) {
          this.candidateFileMap.set(file.name, candidateFile);
        }
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
      
      // Check if this file came from candidates
      const candidateFile = this.candidateFileMap.get(removedFile.name);
      if (candidateFile) {
        // Remove from tracking map
        this.candidateFileMap.delete(removedFile.name);
        
        // Add back to candidates (this will be handled by FileDetectionService)
        this.notifyFileRemovedFromQueue(candidateFile);
      }
      
      this.selectedFiles.next(updatedFiles);
      return removedFile;
    }
    return null;
  }

  clearFiles(): void {
    const currentFiles = this.selectedFiles.value;
    
    // Return all candidate files back to the candidate list
    currentFiles.forEach(file => {
      const candidateFile = this.candidateFileMap.get(file.name);
      if (candidateFile) {
        this.notifyFileRemovedFromQueue(candidateFile);
      }
    });
    
    // Clear tracking map and file list
    this.candidateFileMap.clear();
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

  // This method will be called by FileDetectionService
  private notifyFileRemovedFromQueue(candidateFile: CandidateFile): void {
    // Emit an event or use a callback mechanism
    // For now, we'll use a simple approach where FileDetectionService
    // listens to the selectedFiles$ observable changes
    console.log(`File ${candidateFile.name} removed from queue, should be added back to candidates`);
  }

  // Helper method to check if a file came from candidates
  isFromCandidates(fileName: string): boolean {
    return this.candidateFileMap.has(fileName);
  }

  // Helper method to get candidate file info
  getCandidateFileInfo(fileName: string): CandidateFile | undefined {
    return this.candidateFileMap.get(fileName);
  }
}