// src/app/shared/components/toast/toast.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { ToastNotification } from '../../../core/models/toast-notification';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts$: Observable<ToastNotification[]>;
  private hoverTimeouts = new Map<string, number>();
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void {
    // Subscribe to toasts to handle cleanup
    this.toasts$.pipe(takeUntil(this.destroy$)).subscribe(toasts => {
      // Clean up hover timeouts for removed toasts
      const currentToastIds = new Set(toasts.map(t => t.id));
      this.hoverTimeouts.forEach((timeout, id) => {
        if (!currentToastIds.has(id)) {
          clearTimeout(timeout as unknown as number);
          this.hoverTimeouts.delete(id);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up all hover timeouts
    this.hoverTimeouts.forEach(timeout => clearTimeout(timeout as unknown as number));
    this.hoverTimeouts.clear();
  }

  trackByToastId(index: number, toast: ToastNotification): string {
    return toast.id;
  }

  onToastHover(toastId: string, isHovering: boolean): void {
    if (isHovering) {
      // Clear any existing timeout for this toast
      const existingTimeout = this.hoverTimeouts.get(toastId);
      if (existingTimeout) {
        clearTimeout(existingTimeout as unknown as number);
        this.hoverTimeouts.delete(toastId);
      }
    } else {
      // Set a small delay before allowing auto-dismiss to resume
      const timeout = setTimeout(() => {
        this.hoverTimeouts.delete(toastId);
      }, 100) as unknown as number;
      this.hoverTimeouts.set(toastId, timeout);
    }
  }

  removeToast(id: string): void {
    // Add exit animation class
    const toastElement = document.querySelector(`[data-toast-id="${id}"]`);
    if (toastElement) {
      toastElement.classList.add('toast-exit');
      
      // Remove after animation completes
      setTimeout(() => {
        this.toastService.removeToast(id);
      }, 300);
    } else {
      this.toastService.removeToast(id);
    }

    // Clean up hover timeout
    const timeout = this.hoverTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout as unknown as number);
      this.hoverTimeouts.delete(id);
    }
  }

  getIconClass(type: string): string {
    const iconMap: { [key: string]: string } = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    return iconMap[type] || 'bi-info-circle-fill';
  }
}