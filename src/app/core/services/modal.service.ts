// src/app/core/services/modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private isOpen = new BehaviorSubject<boolean>(false);
  private config = new BehaviorSubject<ModalConfig | null>(null);

  public isOpen$ = this.isOpen.asObservable();
  public config$ = this.config.asObservable();

  showModal(config: ModalConfig): void {
    this.config.next({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      icon: 'question-circle',
      ...config
    });
    this.isOpen.next(true);
  }

  closeModal(): void {
    this.isOpen.next(false);
    this.config.next(null);
  }

  confirm(): void {
    const currentConfig = this.config.value;
    if (currentConfig?.onConfirm) {
      currentConfig.onConfirm();
    }
    this.closeModal();
  }

  cancel(): void {
    const currentConfig = this.config.value;
    if (currentConfig?.onCancel) {
      currentConfig.onCancel();
    }
    this.closeModal();
  }
}

