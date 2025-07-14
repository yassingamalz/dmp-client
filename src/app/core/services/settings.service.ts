// src/app/core/services/settings.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings, FileDetectionSettings, MachineSettings, ExportSettings, ConnectionSettings, UISettings, AdvancedSettings } from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'dmp-client-settings';
  
  private defaultSettings: AppSettings = {
    fileDetection: {
      watchFolderPath: 'C:\\MachineFiles\\CG008668',
      enabledExtensions: ['.hdr.txt', '.chr.txt', '.fet.txt', '.csv', '.pdf', '.txt'],
      scanFrequency: '30s',
      includeSubdirectories: false,
      autoAddCandidates: true
    },
    machine: {
      machineId: 'CG008668',
      machineName: 'Zeiss Prismo 5',
      machineType: 'CMM',
      outputFolder: '/measurements',
      isActive: true
    },
    export: {
      defaultAction: 'copy',
      autoFillStrategy: 'filename',
      fileNamingConvention: '{machine}§{order}§{phase}§{progressive}#{filename}',
      showConfirmationDialogs: true
    },
    connection: {
      serverUrl: 'http://localhost:9070',
      connectionTimeout: 30000,
      retryAttempts: 3,
      autoReconnect: true
    },
    ui: {
      theme: 'light',
      language: 'it',
      enableNotifications: true,
      autoRefreshInterval: 30000
    },
    advanced: {
      debugMode: false,
      cacheDuration: 3600000, // 1 hour
      batchSize: 10,
      maxConcurrentOperations: 5
    }
  };

  private settings = new BehaviorSubject<AppSettings>(this.loadSettings());
  public settings$ = this.settings.asObservable();

  constructor() {
    // Watch for changes and save to localStorage
    this.settings$.subscribe(settings => {
      this.saveSettings(settings);
    });
  }

  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return this.mergeWithDefaults(parsedSettings);
      }
    } catch (error) {
      console.warn('Impossibile caricare le impostazioni da localStorage:', error);
    }
    return { ...this.defaultSettings };
  }

  private saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Impossibile salvare le impostazioni in localStorage:', error);
    }
  }

  private mergeWithDefaults(stored: Partial<AppSettings>): AppSettings {
    return {
      fileDetection: { ...this.defaultSettings.fileDetection, ...stored.fileDetection },
      machine: { ...this.defaultSettings.machine, ...stored.machine },
      export: { ...this.defaultSettings.export, ...stored.export },
      connection: { ...this.defaultSettings.connection, ...stored.connection },
      ui: { ...this.defaultSettings.ui, ...stored.ui },
      advanced: { ...this.defaultSettings.advanced, ...stored.advanced }
    };
  }

  getSettings(): AppSettings {
    return this.settings.value;
  }

  updateSettings(newSettings: Partial<AppSettings>): void {
    const currentSettings = this.settings.value;
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
      fileDetection: { ...currentSettings.fileDetection, ...newSettings.fileDetection },
      machine: { ...currentSettings.machine, ...newSettings.machine },
      export: { ...currentSettings.export, ...newSettings.export },
      connection: { ...currentSettings.connection, ...newSettings.connection },
      ui: { ...currentSettings.ui, ...newSettings.ui },
      advanced: { ...currentSettings.advanced, ...newSettings.advanced }
    };
    this.settings.next(updatedSettings);
  }

  updateFileDetectionSettings(settings: Partial<FileDetectionSettings>): void {
    this.updateSettings({ fileDetection: { ...this.settings.value.fileDetection, ...settings } });
  }

  updateMachineSettings(settings: Partial<MachineSettings>): void {
    this.updateSettings({ machine: { ...this.settings.value.machine, ...settings } });
  }

  updateExportSettings(settings: Partial<ExportSettings>): void {
    this.updateSettings({ export: { ...this.settings.value.export, ...settings } });
  }

  updateConnectionSettings(settings: Partial<ConnectionSettings>): void {
    this.updateSettings({ connection: { ...this.settings.value.connection, ...settings } });
  }

  updateUISettings(settings: Partial<UISettings>): void {
    this.updateSettings({ ui: { ...this.settings.value.ui, ...settings } });
  }

  updateAdvancedSettings(settings: Partial<AdvancedSettings>): void {
    this.updateSettings({ advanced: { ...this.settings.value.advanced, ...settings } });
  }

  resetToDefaults(): void {
    this.settings.next({ ...this.defaultSettings });
  }

  exportSettings(): string {
    return JSON.stringify(this.settings.value, null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      const mergedSettings = this.mergeWithDefaults(importedSettings);
      this.settings.next(mergedSettings);
      return true;
    } catch (error) {
      console.error('Impossibile importare le impostazioni:', error);
      return false;
    }
  }

  clearCache(): void {
    // Clear any cached data
    sessionStorage.clear();
  }
}