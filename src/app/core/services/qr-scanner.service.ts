// src/app/core/services/qr-scanner.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {
  private isOpen = new BehaviorSubject<boolean>(false);
  private scannedCode = new BehaviorSubject<string | null>(null);

  public isOpen$ = this.isOpen.asObservable();
  public scannedCode$ = this.scannedCode.asObservable();

  openScanner(): void {
    this.isOpen.next(true);
  }

  closeScanner(): void {
    this.isOpen.next(false);
    this.scannedCode.next(null);
  }

  setScannedCode(code: string): void {
    this.scannedCode.next(code);
  }

  async checkCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  async getCameraDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting camera devices:', error);
      return [];
    }
  }
}