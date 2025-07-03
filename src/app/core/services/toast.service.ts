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
    duration: number = 5000,
    isUrgent: boolean = false
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

  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.showToast('success', title, message, duration);
  }

  showError(title: string, message: string, duration: number = 8000): void {
    this.showToast('error', title, message, duration, true);
  }

  showWarning(title: string, message: string, duration: number = 6000): void {
    this.showToast('warning', title, message, duration);
  }

  showInfo(title: string, message: string, duration: number = 5000): void {
    this.showToast('info', title, message, duration);
  }

  removeToast(id: string): void {
    const currentToasts = this.toasts.value.filter(toast => toast.id !== id);
    this.toasts.next(currentToasts);
  }

  removeAllToasts(): void {
    this.toasts.next([]);
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}