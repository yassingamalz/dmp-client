// src/app/core/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastNotification } from '../models/toast-notification';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<ToastNotification[]>([]);
  public toasts$ = this.toasts.asObservable();

  showToast(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    duration: number = 5000
  ): void {
    const toast: ToastNotification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration
    };

    const currentToasts = this.toasts.value;
    this.toasts.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  removeToast(id: string): void {
    const currentToasts = this.toasts.value.filter(toast => toast.id !== id);
    this.toasts.next(currentToasts);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

