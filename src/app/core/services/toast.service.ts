// src/app/core/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastNotification } from '../models/toast-notification';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<ToastNotification[]>([]);
  private maxToasts = 5; // Maximum number of toasts to show at once
  public toasts$ = this.toasts.asObservable();

  showToast(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    duration: number = this.getDefaultDuration(type),
    isUrgent: boolean = type === 'error'
  ): void {
    const toast: ToastNotification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
      isUrgent
    };

    let currentToasts = this.toasts.value;
    
    // If we have too many toasts, remove the oldest ones
    if (currentToasts.length >= this.maxToasts) {
      currentToasts = currentToasts.slice(-(this.maxToasts - 1));
    }

    // Add new toast
    this.toasts.next([...currentToasts, toast]);

    // Auto-remove after duration if duration > 0
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  showSuccess(title: string, message: string, duration: number = 4000): void {
    this.showToast('success', title, message, duration, false);
  }

  showError(title: string, message: string, duration: number = 8000): void {
    this.showToast('error', title, message, duration, true);
  }

  showWarning(title: string, message: string, duration: number = 6000): void {
    this.showToast('warning', title, message, duration, false);
  }

  showInfo(title: string, message: string, duration: number = 5000): void {
    this.showToast('info', title, message, duration, false);
  }

  // Enhanced methods for specific scenarios
  showFileSuccess(fileName: string, action: string = 'processed'): void {
    this.showSuccess(
      'File Success',
      `${fileName} ${action} successfully`,
      4000
    );
  }

  showFileError(fileName: string, reason: string): void {
    this.showError(
      'File Error',
      `Failed to process ${fileName}: ${reason}`,
      8000
    );
  }

  showConnectionSuccess(): void {
    this.showSuccess(
      'Connected',
      'Successfully connected to DMP server',
      3000
    );
  }

  showConnectionError(details?: string): void {
    this.showError(
      'Connection Failed',
      details || 'Unable to connect to DMP server. Please check your connection.',
      10000
    );
  }

  showExportSuccess(fileCount: number): void {
    this.showSuccess(
      'Export Complete',
      `Successfully exported ${fileCount} file${fileCount !== 1 ? 's' : ''} to DMP`,
      5000
    );
  }

  showExportError(reason: string): void {
    this.showError(
      'Export Failed',
      `Export operation failed: ${reason}`,
      8000
    );
  }

  showValidationWarning(field: string, issue: string): void {
    this.showWarning(
      'Validation Warning',
      `${field}: ${issue}`,
      6000
    );
  }

  showSettingsSaved(): void {
    this.showSuccess(
      'Settings Saved',
      'Your preferences have been updated successfully',
      3000
    );
  }

  showQuickInfo(message: string): void {
    this.showInfo(
      'Info',
      message,
      3000
    );
  }

  // Persistent toast (manual dismiss only)
  showPersistent(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ): string {
    const toast: ToastNotification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: 0, // No auto-dismiss
      isUrgent: type === 'error'
    };

    const currentToasts = this.toasts.value;
    this.toasts.next([...currentToasts, toast]);
    
    return toast.id; // Return ID so caller can dismiss manually
  }

  removeToast(id: string): void {
    const currentToasts = this.toasts.value.filter(toast => toast.id !== id);
    this.toasts.next(currentToasts);
  }

  removeAllToasts(): void {
    this.toasts.next([]);
  }

  // Remove toasts of specific type
  removeToastsByType(type: 'success' | 'error' | 'warning' | 'info'): void {
    const currentToasts = this.toasts.value.filter(toast => toast.type !== type);
    this.toasts.next(currentToasts);
  }

  private getDefaultDuration(type: string): number {
    const durations = {
      success: 4000,
      info: 5000,
      warning: 6000,
      error: 8000
    };
    return durations[type as keyof typeof durations] || 5000;
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}