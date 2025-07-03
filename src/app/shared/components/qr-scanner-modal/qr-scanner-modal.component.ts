// src/app/shared/components/qr-scanner-modal/qr-scanner-modal.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { QrScannerService } from '../../../core/services/qr-scanner.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-qr-scanner-modal',
  templateUrl: './qr-scanner-modal.component.html',
  styleUrls: ['./qr-scanner-modal.component.scss']
})
export class QrScannerModalComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
  @Output() codeScanned = new EventEmitter<string>();

  isOpen$: Observable<boolean>;
  isScanning = false;
  hasPermission = false;
  cameras: MediaDeviceInfo[] = [];
  selectedCamera: string = '';
  stream: MediaStream | null = null;
  scanningInterval: number | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private qrScannerService: QrScannerService,
    private toastService: ToastService
  ) {
    this.isOpen$ = this.qrScannerService.isOpen$;
  }

  ngOnInit(): void {
    this.isOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        if (isOpen) {
          this.initializeScanner();
        } else {
          this.stopScanning();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopScanning();
  }

  async initializeScanner(): Promise<void> {
    try {
      this.hasPermission = await this.qrScannerService.checkCameraPermission();
      
      if (this.hasPermission) {
        this.cameras = await this.qrScannerService.getCameraDevices();
        if (this.cameras.length > 0) {
          this.selectedCamera = this.cameras[0].deviceId;
          await this.startCamera();
        } else {
          this.toastService.showToast('error', 'Nessuna Camera', 'Nessuna camera trovata sul dispositivo');
        }
      } else {
        this.toastService.showToast('error', 'Permesso Camera', 'Permesso camera negato. Abilita la camera nelle impostazioni del browser.');
      }
    } catch (error) {
      console.error('Error initializing scanner:', error);
      this.toastService.showToast('error', 'Errore Scanner', 'Errore durante l\'inizializzazione dello scanner');
    }
  }

  async startCamera(): Promise<void> {
    try {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: this.selectedCamera ? { exact: this.selectedCamera } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Try to use back camera on mobile
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.videoElement.nativeElement.play();
        this.startScanning();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      this.toastService.showToast('error', 'Errore Camera', 'Impossibile avviare la camera');
    }
  }

  startScanning(): void {
    this.isScanning = true;
    this.scanningInterval = window.setInterval(() => {
      this.scanFrame();
    }, 100);
  }

  stopScanning(): void {
    this.isScanning = false;
    
    if (this.scanningInterval) {
      clearInterval(this.scanningInterval);
      this.scanningInterval = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  scanFrame(): void {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) {
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = this.detectQRCode(imageData);
    
    if (code) {
      this.onCodeDetected(code);
    }
  }

  detectQRCode(imageData: ImageData): string | null {
    // Simple QR code detection using jsQR library simulation
    // In a real implementation, you would use jsQR or similar library
    // For now, simulate detection with mock data for demo
    
    // This is a simplified version - in production you'd use:
    // import jsQR from 'jsqr';
    // const code = jsQR(imageData.data, imageData.width, imageData.height);
    // return code ? code.data : null;
    
    // Mock detection for demo - randomly detect mock codes
    const mockCodes = ['ORD-2024-007', 'WO-2024-301', 'ORD-1173159', 'WO-1174741'];
    const randomDetection = Math.random() < 0.01; // 1% chance per frame
    
    if (randomDetection) {
      return mockCodes[Math.floor(Math.random() * mockCodes.length)];
    }
    
    return null;
  }

  onCodeDetected(code: string): void {
    this.qrScannerService.setScannedCode(code);
    this.codeScanned.emit(code);
    this.toastService.showToast('success', 'QR Code Rilevato', `Codice scansionato: ${code}`);
    this.closeModal();
  }

  async onCameraChange(): Promise<void> {
    if (this.selectedCamera) {
      await this.startCamera();
    }
  }

  closeModal(): void {
    this.qrScannerService.closeScanner();
  }

  // Manual input fallback
  onManualInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const code = input.value.trim();
    if (code) {
      this.onCodeDetected(code);
    }
  }
}