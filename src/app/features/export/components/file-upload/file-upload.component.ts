// src/app/features/export/components/file-upload/file-upload.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { FileManagerService } from '../../../../core/services/file-manager.service';
import { ModalService } from '../../../../core/services/modal.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-file-upload',
  standalone:false,
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  selectedFiles: File[] = [];
  dragOver = false;
  exporting = false;
  canExport = false;
  
  private destroy$ = new Subject<void>();
  private exportForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fileManagerService: FileManagerService,
    private apiService: ApiService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {
    this.exportForm = this.fb.group({
      order: ['', Validators.required],
      phase: [''],
      progressive: ['']
    });
  }

  ngOnInit(): void {
    this.fileManagerService.selectedFiles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(files => {
        this.selectedFiles = files;
        this.updateExportButton();
      });

    // Listen to form changes from the parent export form
    // In a real implementation, you'd use a shared service or parent-child communication
    this.updateExportButton();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const files = Array.from(event.dataTransfer?.files || []);
    this.addFiles(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.addFiles(files);
    input.value = ''; // Reset input
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  addFiles(files: File[]): void {
    const result = this.fileManagerService.addFiles(files);
    
    if (result.rejected.length > 0) {
      this.toastService.showToast(
        'warning', 
        'Invalid Files', 
        `${result.rejected.length} files were rejected (invalid type or duplicate)`
      );
    }

    if (result.added.length > 0) {
      this.toastService.showToast(
        'success', 
        'Files Added', 
        `Added ${result.added.length} files to upload queue`
      );
    }
  }

  removeFile(index: number): void {
    const removedFile = this.fileManagerService.removeFile(index);
    if (removedFile) {
      this.toastService.showToast('info', 'File Removed', `Removed: ${removedFile.name}`);
    }
  }

  clearFiles(): void {
    if (this.selectedFiles.length === 0) return;
    
    this.modalService.showModal({
      title: 'Clear All Files',
      message: `Are you sure you want to remove all ${this.selectedFiles.length} selected files?`,
      icon: 'trash',
      onConfirm: () => {
        this.fileManagerService.clearFiles();
        this.toastService.showToast('success', 'Files Cleared', 'All files removed from queue');
      }
    });
  }

  exportFiles(): void {
    const order = 'ORD-2024-001'; // This should come from the form service
    const phase = '10';
    const progressive = '001';

    this.modalService.showModal({
      title: 'Confirm Export',
      message: `Export ${this.selectedFiles.length} files to DMP?\n\nOrder: ${order}\nPhase: ${phase || 'N/A'}\nProgressive: ${progressive || 'N/A'}`,
      icon: 'upload',
      onConfirm: () => this.performExport(order, phase, progressive)
    });
  }

  private performExport(order: string, phase: string, progressive: string): void {
    this.exporting = true;

    const exportRequest = {
      order,
      phase,
      progressive,
      payload: this.selectedFiles
    };

    this.apiService.exportFiles(exportRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.toastService.showToast('success', 'Export Complete', result.message);
            this.fileManagerService.clearFiles();
          } else {
            this.toastService.showToast('error', 'Export Failed', result.message);
          }
          this.exporting = false;
        },
        error: () => {
          this.toastService.showToast('error', 'Export Failed', 'An error occurred during export');
          this.exporting = false;
        }
      });
  }

  private updateExportButton(): void {
    this.canExport = this.selectedFiles.length > 0; // && this.exportForm.valid;
  }

  formatFileSize(bytes: number): string {
    return this.fileManagerService.formatFileSize(bytes);
  }
}