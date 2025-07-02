// src/app/shared/components/toast/toast.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { ToastNotification } from '../../../core/models/toast-notification';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  toasts$: Observable<ToastNotification[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit(): void { }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  getIconClass(type: string): string {
    const iconMap: { [key: string]: string } = {
      success: 'bi-check',
      error: 'bi-x',
      warning: 'bi-exclamation',
      info: 'bi-info'
    };
    return iconMap[type] || 'bi-info';
  }
}

