// src/app/features/machines/components/environment-selector/environment-selector.component.ts
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MachineService } from '../../../../core/services/machine.service';
import { EnvironmentInfo } from '../../../../core/models/machine-status';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Environment selector component.
 * Provides interface for switching between backend environments.
 */
@Component({
  selector: 'app-environment-selector',
  standalone: false,
  templateUrl: './environment-selector.component.html',
  styleUrls: ['./environment-selector.component.scss']
})
export class EnvironmentSelectorComponent implements OnInit, OnDestroy {
  @Output() environmentChanged = new EventEmitter<string>();

  environments$: Observable<EnvironmentInfo[]>;
  currentEnvironment$: Observable<string>;
  currentEnvironment = 'development';
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(private machineService: MachineService) {
    this.environments$ = this.machineService.getEnvironments();
    this.currentEnvironment$ = this.machineService.currentEnvironment$;
  }

  ngOnInit(): void {
    this.currentEnvironment$
      .pipe(takeUntil(this.destroy$))
      .subscribe(env => {
        this.currentEnvironment = env;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles environment selection change.
   * @param environment Selected environment name
   */
  onEnvironmentChange(environment: string): void {
    if (this.loading) return;

    this.loading = true;
    this.machineService.setCurrentEnvironment(environment);
    this.environmentChanged.emit(environment);

    setTimeout(() => {
      this.loading = false;
    }, 600);
  }

  /**
   * Gets base URL for environment display.
   * @param environments Array of available environments
   * @param envName Environment name to lookup
   * @returns Base URL string for environment
   */
  getEnvironmentBaseUrl(environments: EnvironmentInfo[], envName: string): string {
    const env = environments.find(e => e.name === envName);
    return env?.baseUrl || '';
  }
}