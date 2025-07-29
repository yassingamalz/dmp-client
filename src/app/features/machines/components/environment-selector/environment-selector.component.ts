// src/app/features/machines/components/environment-selector/environment-selector.component.ts
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MachineService } from '../../../../core/services/machine.service';
import { EnvironmentInfo } from '../../../../core/models/machine-status';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  currentEnvironment = 'production'; // Store current value for action expressions
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(private machineService: MachineService) {
    this.environments$ = this.machineService.getEnvironments();
    this.currentEnvironment$ = this.machineService.currentEnvironment$;
  }

  ngOnInit(): void {
    // Subscribe to current environment changes
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

  onEnvironmentChange(environment: string): void {
    if (this.loading) return;

    this.loading = true;
    this.machineService.setCurrentEnvironment(environment);
    this.environmentChanged.emit(environment);

    // Reset loading state after a delay
    setTimeout(() => {
      this.loading = false;
    }, 600);
  }
}