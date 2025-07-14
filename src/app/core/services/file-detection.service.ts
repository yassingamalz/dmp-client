// src/app/core/services/file-detection.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { CandidateFile } from '../models/candidate-file';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class FileDetectionService {
  private mockFiles: CandidateFile[] = [
    {
      name: 'measurement_001.hdr.txt',
      size: 15420,
      lastModified: Date.now() - 3600000, // 1 hour ago
      path: 'C:\\MachineFiles\\CG008668\\measurement_001.hdr.txt'
    },
    {
      name: 'profile_data_v2.csv',
      size: 8960,
      lastModified: Date.now() - 7200000, // 2 hours ago
      path: 'C:\\MachineFiles\\CG008668\\profile_data_v2.csv'
    },
    {
      name: 'calibration.chr.txt',
      size: 25600,
      lastModified: Date.now() - 1800000, // 30 minutes ago
      path: 'C:\\MachineFiles\\CG008668\\calibration.chr.txt'
    },
    {
      name: 'final_report.pdf',
      size: 127840,
      lastModified: Date.now() - 900000, // 15 minutes ago
      path: 'C:\\MachineFiles\\CG008668\\final_report.pdf'
    },
    {
      name: 'temp_measure.fet.txt',
      size: 12330,
      lastModified: Date.now() - 300000, // 5 minutes ago
      path: 'C:\\MachineFiles\\CG008668\\temp_measure.fet.txt'
    }
  ];

  private candidateFiles = new BehaviorSubject<CandidateFile[]>([...this.mockFiles]);
  private watchDirectory = new BehaviorSubject<string>('');
  private removedFiles = new Set<string>(); // Track files that were added to export queue

  public candidateFiles$ = this.candidateFiles.asObservable();
  public watchDirectory$ = this.watchDirectory.asObservable();

  constructor(private settingsService: SettingsService) {
    this.initializeBidirectionalSync();
    
    // Listen to settings changes and update watch directory
    this.settingsService.settings$.subscribe(settings => {
      if (settings?.fileDetection?.watchFolderPath) {
        this.watchDirectory.next(settings.fileDetection.watchFolderPath);
      }
    });
  }

  getCandidateFiles(): Observable<CandidateFile[]> {
    return of([...this.candidateFiles.value]).pipe(delay(300));
  }

  removeFromCandidates(fileName: string): void {
    const currentFiles = this.candidateFiles.value;
    const fileToRemove = currentFiles.find(f => f.name === fileName);
    
    if (fileToRemove) {
      const updatedFiles = currentFiles.filter(file => file.name !== fileName);
      this.candidateFiles.next(updatedFiles);
      this.removedFiles.add(fileName);
    }
  }

  addToCandidates(candidateFile: CandidateFile): void {
    const currentFiles = this.candidateFiles.value;
    const fileExists = currentFiles.find(file => file.name === candidateFile.name);
    
    if (!fileExists) {
      this.candidateFiles.next([...currentFiles, candidateFile]);
      this.removedFiles.delete(candidateFile.name);
    }
  }

  setWatchDirectory(path: string): void {
    this.watchDirectory.next(path);
    // Update the settings with the new path
    this.settingsService.updateFileDetectionSettings({ watchFolderPath: path });
    // Simulate rescanning directory
    this.refreshCandidates();
  }

  refreshCandidates(): void {
    // Simulate file discovery with slight delay
    setTimeout(() => {
      // Get enabled extensions from settings
      const settings = this.settingsService.getSettings();
      const enabledExtensions = settings?.fileDetection?.enabledExtensions || [];
      
      // Filter files based on enabled extensions and removed files
      const availableFiles = this.mockFiles.filter(file => {
        const isValidExtension = enabledExtensions.some(ext => 
          file.name.toLowerCase().endsWith(ext.toLowerCase())
        );
        return isValidExtension && !this.removedFiles.has(file.name);
      });
      
      this.candidateFiles.next([...availableFiles]);
    }, 500);
  }

  createFileFromCandidate(candidate: CandidateFile): File {
    // Create a mock File object for the FileManagerService
    const blob = new Blob(['mock file content'], { type: 'text/plain' });
    const file = new File([blob], candidate.name, {
      lastModified: candidate.lastModified
    });
    
    // Add custom properties to track it came from candidates
    (file as any).candidateFile = candidate;
    return file;
  }

  // Method to handle file being removed from export queue
  handleFileRemovedFromQueue(fileName: string): void {
    const originalFile = this.mockFiles.find(f => f.name === fileName);
    if (originalFile && this.removedFiles.has(fileName)) {
      this.addToCandidates(originalFile);
    }
  }

  // Initialize bidirectional sync with FileManagerService
  private initializeBidirectionalSync(): void {
    // This would ideally be injected, but to avoid circular dependency,
    // we'll handle the sync in the component level
  }

  // Helper method to check if file was originally a candidate
  wasCandidate(fileName: string): boolean {
    return this.mockFiles.some(f => f.name === fileName);
  }
}