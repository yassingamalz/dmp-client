// src/app/core/services/environment-config.service.ts
import { Injectable } from '@angular/core';

export interface BackendEnvironment {
  name: string;
  displayName: string;
  baseUrl: string;
  color: string;
}

/**
 * Service for managing backend environment configurations.
 * Handles switching between development, test, and production environments.
 */
@Injectable({
  providedIn: 'root'
})
export class EnvironmentConfigService {
  
  private environments: BackendEnvironment[] = [
        {
      name: 'local',
      displayName: 'local',
      baseUrl: 'http://localhost:8080',
      color: '#818181ff'
    },
    {
      name: 'development',
      displayName: 'Sviluppo/Integrazione',
      baseUrl: 'http://twxdev06:8081',
      color: '#198754'
    },
    {
      name: 'test',
      displayName: 'Test',
      baseUrl: 'http://twxtest:8081',
      color: '#fd7e14'
    },
    {
      name: 'production',
      displayName: 'Produzione',
      baseUrl: 'http://f1-platform:8081',
      color: '#dc3545'
    }
  ];

  private currentEnvironment: BackendEnvironment;

  constructor() {
    this.currentEnvironment = this.environments[0];
  }

  /**
   * Gets all available backend environments.
   * @returns Array of backend environment configurations
   */
  getAvailableEnvironments(): BackendEnvironment[] {
    return [...this.environments];
  }

  /**
   * Gets the currently selected environment.
   * @returns Current backend environment configuration
   */
  getCurrentEnvironment(): BackendEnvironment {
    return this.currentEnvironment;
  }

  /**
   * Sets the current backend environment.
   * @param environmentName Name of the environment to switch to
   */
  setCurrentEnvironment(environmentName: string): void {
    const env = this.environments.find(e => e.name === environmentName);
    if (env) {
      this.currentEnvironment = env;
    }
  }

  /**
   * Gets the base URL for the current environment.
   * @returns Base URL string for API calls
   */
  getBaseUrl(): string {
    return this.currentEnvironment.baseUrl;
  }

  /**
   * Gets the complete API URL for machine administration endpoints.
   * @returns Full API URL for machine admin operations
   */
  getApiUrl(): string {
    return `${this.getBaseUrl()}/api/admin/machines`;
  }
}