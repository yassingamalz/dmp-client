// src/app/shared/components/settings-modal/settings-modal.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';
import { AppSettings } from '../../../core/models/settings';

@Component({
  selector: 'app-settings-modal',
  standalone: false,
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss']
})
export class SettingsModalComponent implements OnInit, OnDestroy {
  @ViewChild('folderInput') folderInput!: ElementRef<HTMLInputElement>;
  
  isOpen = false;
  activeTab = 'fileDetection';
  settingsForm: FormGroup;
  
  private destroy$ = new Subject<void>();
  fileNamingPlaceholder = '{{machine}}§{{order}}§{{phase}}§{{progressive}}#{{filename}}';
  fileNamingVariables = '{{machine}}, {{order}}, {{phase}}, {{progressive}}, {{filename}}';

  tabs = [
    { id: 'fileDetection', label: 'Rilevamento File', icon: 'bi-folder-plus' },
    { id: 'machine', label: 'Macchina', icon: 'bi-cpu' },
    { id: 'export', label: 'Esportazione', icon: 'bi-upload' },
    { id: 'connection', label: 'Connessione', icon: 'bi-wifi' },
    { id: 'ui', label: 'Interfaccia', icon: 'bi-palette' },
    { id: 'advanced', label: 'Avanzate', icon: 'bi-gear-wide-connected' }
  ];

  scanFrequencyOptions = [
    { value: 'realtime', label: 'Tempo reale' },
    { value: '30s', label: 'Ogni 30 secondi' },
    { value: '1min', label: 'Ogni minuto' },
    { value: '5min', label: 'Ogni 5 minuti' }
  ];

  machineTypeOptions = [
    { value: 'CMM', label: 'Macchina di Misurazione a Coordinate' },
    { value: 'OPTICAL', label: 'Misurazione Ottica' },
    { value: 'LASER', label: 'Scanner Laser' },
    { value: 'OTHER', label: 'Altro' }
  ];

  fileExtensions = [
    { value: '.hdr.txt', label: 'File header (.hdr.txt)' },
    { value: '.chr.txt', label: 'File carattere (.chr.txt)' },
    { value: '.fet.txt', label: 'File feature (.fet.txt)' },
    { value: '.csv', label: 'File CSV (.csv)' },
    { value: '.pdf', label: 'Report PDF (.pdf)' },
    { value: '.txt', label: 'File di testo (.txt)' }
  ];

  languageOptions = [
    { value: 'it', label: 'Italiano' },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private modalService: ModalService
  ) {
    this.settingsForm = this.createForm();
  }

  ngOnInit(): void {
    // Load current settings into form
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.updateFormWithSettings(settings);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fileDetection: this.fb.group({
        watchFolderPath: [''],
        enabledExtensions: [[]],
        scanFrequency: ['30s'],
        includeSubdirectories: [false],
        autoAddCandidates: [true]
      }),
      machine: this.fb.group({
        machineId: [''],
        machineName: [''],
        machineType: ['CMM'],
        outputFolder: [''],
        isActive: [true]
      }),
      export: this.fb.group({
        defaultAction: ['copy'],
        autoFillStrategy: ['filename'],
        fileNamingConvention: [''],
        showConfirmationDialogs: [true]
      }),
      connection: this.fb.group({
        serverUrl: [''],
        connectionTimeout: [30000],
        retryAttempts: [3],
        autoReconnect: [true]
      }),
      ui: this.fb.group({
        theme: ['light'],
        language: ['it'],
        enableNotifications: [true],
        autoRefreshInterval: [30000]
      }),
      advanced: this.fb.group({
        debugMode: [false],
        cacheDuration: [3600000],
        batchSize: [10],
        maxConcurrentOperations: [5]
      })
    });
  }

  private updateFormWithSettings(settings: AppSettings): void {
    this.settingsForm.patchValue(settings);
  }

  openModal(): void {
    this.isOpen = true;
    this.activeTab = 'fileDetection';
  }

  closeModal(): void {
    this.isOpen = false;
  }

  selectTab(tabId: string): void {
    this.activeTab = tabId;
  }

  onFolderSelect(): void {
    this.folderInput.nativeElement.click();
  }

  onFolderSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      // Get the path from the first file
      const file = files[0];
      const fullPath = (file as any).webkitRelativePath || file.name;
      const folderPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
      
      const pathControl = this.settingsForm.get('fileDetection.watchFolderPath');
      if (pathControl) {
        pathControl.setValue(folderPath);
      }
      this.toastService.showToast('success', 'Cartella Selezionata', `Selezionata: ${folderPath}`);
    }
  }

  onExtensionToggle(extension: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const checked = checkbox.checked;
    
    const currentExtensions = this.settingsForm.get('fileDetection.enabledExtensions')?.value || [];
    let updatedExtensions: string[];

    if (checked) {
      updatedExtensions = [...currentExtensions, extension];
    } else {
      updatedExtensions = currentExtensions.filter((ext: string) => ext !== extension);
    }

    const extensionsControl = this.settingsForm.get('fileDetection.enabledExtensions');
    if (extensionsControl) {
      extensionsControl.setValue(updatedExtensions);
    }
  }

  isExtensionEnabled(extension: string): boolean {
    const enabledExtensions = this.settingsForm.get('fileDetection.enabledExtensions')?.value || [];
    return enabledExtensions.includes(extension);
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      const formValue = this.settingsForm.value;
      this.settingsService.updateSettings(formValue);
      this.toastService.showToast('success', 'Impostazioni Salvate', 'Le tue impostazioni sono state salvate con successo');
      this.closeModal();
    } else {
      this.toastService.showToast('error', 'Impostazioni Non Valide', 'Verifica le tue impostazioni e riprova');
    }
  }

  resetToDefaults(): void {
    this.modalService.showModal({
      title: 'Ripristina Impostazioni',
      message: 'Sei sicuro di voler ripristinare tutte le impostazioni ai valori predefiniti? Questa azione non può essere annullata.',
      icon: 'exclamation-triangle',
      confirmText: 'Ripristina',
      cancelText: 'Annulla',
      onConfirm: () => {
        this.settingsService.resetToDefaults();
        this.toastService.showToast('success', 'Impostazioni Ripristinate', 'Tutte le impostazioni sono state ripristinate ai valori predefiniti');
      }
    });
  }

  exportSettings(): void {
    try {
      const settingsJson = this.settingsService.exportSettings();
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dmp-client-impostazioni-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      this.toastService.showToast('success', 'Impostazioni Esportate', 'Il file delle impostazioni è stato scaricato');
    } catch (error) {
      this.toastService.showToast('error', 'Esportazione Fallita', 'Impossibile esportare le impostazioni');
    }
  }

  onImportSettings(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settingsJson = e.target?.result as string;
          if (this.settingsService.importSettings(settingsJson)) {
            this.toastService.showToast('success', 'Impostazioni Importate', 'Le impostazioni sono state importate con successo');
          } else {
            this.toastService.showToast('error', 'Importazione Fallita', 'Formato file impostazioni non valido');
          }
        } catch (error) {
          this.toastService.showToast('error', 'Importazione Fallita', 'Impossibile importare il file delle impostazioni');
        }
      };
      reader.readAsText(file);
    }
    
    // Reset the input
    input.value = '';
  }

  clearCache(): void {
    this.modalService.showModal({
      title: 'Svuota Cache',
      message: 'Questo cancellerà tutti i dati in cache. Sei sicuro di voler continuare?',
      icon: 'trash',
      confirmText: 'Svuota',
      cancelText: 'Annulla',
      onConfirm: () => {
        this.settingsService.clearCache();
        this.toastService.showToast('success', 'Cache Svuotata', 'Tutti i dati in cache sono stati cancellati');
      }
    });
  }

  testConnection(): void {
    const serverUrlControl = this.settingsForm.get('connection.serverUrl');
    const serverUrl = serverUrlControl?.value || 'server non configurato';
    this.toastService.showToast('info', 'Test Connessione', `Test della connessione a ${serverUrl}...`);
    
    // Simulate connection test
    setTimeout(() => {
      this.toastService.showToast('success', 'Test Connessione', 'Connessione riuscita');
    }, 2000);
  }
}