import { Component, Input } from '@angular/core';
import { UploadedFile } from '../../../../core/models/uploaded-file';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-file-browser',
  standalone: false,
  templateUrl: './file-browser.component.html',
  styleUrl: './file-browser.component.scss'
})

export class FileBrowserComponent {
  @Input() files: UploadedFile[] | null = [];

  constructor(private toastService: ToastService) {}

  viewFile(file: UploadedFile): void {
    const displayName = file.name.split('#')[1] || file.name;
    this.toastService.showToast('info', 'File Viewer', `Opening: ${displayName}`);
  }

  downloadFile(event: Event, file: UploadedFile): void {
    event.stopPropagation();
    const displayName = file.name.split('#')[1] || file.name;
    this.toastService.showToast('success', 'Download Started', `Downloading: ${displayName}`);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getDisplayName(fileName: string): string {
    return fileName.split('#')[1] || fileName;
  }
}
