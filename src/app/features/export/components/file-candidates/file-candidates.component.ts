// src/app/features/export/components/file-candidates/file-candidates.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FileDetectionService } from '../../../../core/services/file-detection.service';
import { FileManagerService } from '../../../../core/services/file-manager.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CandidateFile } from '../../../../core/models/candidate-file';

@Component({
  selector: 'app-file-candidates',
  standalone: false,
  templateUrl: './file-candidates.component.html',
  styleUrls: ['./file-candidates.component.scss']
})
export class FileCandidatesComponent implements OnInit, OnDestroy {
  candidateFiles: CandidateFile[] = [];
  loading = false;
  watchDirectory = '';
  
  private destroy$ = new Subject<void>();
  private previousExportQueue: string[] = [];

  constructor(
    private fileDetectionService: FileDetectionService,
    private fileManagerService: FileManagerService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Listen for candidate files
    this.fileDetectionService.candidateFiles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(files => {
        this.candidateFiles = files;
      });

    // Listen for watch directory changes
    this.fileDetectionService.watchDirectory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(directory => {
        this.watchDirectory = directory;
      });

    // Monitor export queue for removed files
    this.fileManagerService.selectedFiles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedFiles => {
        this.handleExportQueueChanges(selectedFiles);
      });

    this.refreshFiles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToExport(candidate: CandidateFile): void {
    // Create File object from candidate
    const file = this.fileDetectionService.createFileFromCandidate(candidate);
    
    // Add to file manager
    const result = this.fileManagerService.addFiles([file]);
    
    if (result.added.length > 0) {
      // Remove from candidates list
      this.fileDetectionService.removeFromCandidates(candidate.name);
      
      this.toastService.showToast(
        'success',
        'File Aggiunto',
        `${candidate.name} aggiunto alla coda di esportazione`
      );
    } else {
      this.toastService.showToast(
        'warning',
        'File Già Presente',
        `${candidate.name} è già nella coda di esportazione`
      );
    }
  }

  refreshFiles(): void {
    this.loading = true;
    this.fileDetectionService.getCandidateFiles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (files) => {
          this.candidateFiles = files;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.showToast('error', 'Errore', 'Impossibile scansionare la directory');
        }
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes} min fa`;
    } else {
      return `${hours} h fa`;
    }
  }

  private handleExportQueueChanges(currentQueue: File[]): void {
    const currentFileNames = currentQueue.map(f => f.name);
    
    // Find files that were removed from the export queue
    const removedFiles = this.previousExportQueue.filter(
      fileName => !currentFileNames.includes(fileName)
    );
    
    // Add removed files back to candidates if they were originally candidates
    removedFiles.forEach(fileName => {
      if (this.fileDetectionService.wasCandidate(fileName)) {
        this.fileDetectionService.handleFileRemovedFromQueue(fileName);
      }
    });
    
    // Update the previous queue for next comparison
    this.previousExportQueue = [...currentFileNames];
  }
}