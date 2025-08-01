// src/app/features/machines/components/environment-selector/environment-selector.component.ts
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MachineService } from '../../../../core/services/machine.service';
import { EnvironmentInfo } from '../../../../core/models/machine-status';

@Component({
  selector: 'app-environment-selector',
  standalone: false,
  templateUrl: './environment-selector.component.html',
  styleUrls: ['./environment-selector.component.scss']
})
export class EnvironmentSelectorComponent implements OnInit {
  @Output() environmentChanged = new EventEmitter<string>();

  environments$: Observable<EnvironmentInfo[]>;
  currentEnvironment: string;
  loading = false;

  constructor(private machineService: MachineService) {
    this.environments$ = this.machineService.environments$;
    this.currentEnvironment = this.machineService.getCurrentEnvironment();
  }

  ngOnInit(): void {
    this.machineService.getEnvironments().subscribe();

    this.machineService.currentEnvironment$.subscribe(env => {
      this.currentEnvironment = env;
    });
  }

  onEnvironmentChange(environmentName: string): void {
    if (this.loading || environmentName === this.currentEnvironment) {
      return;
    }

    this.loading = true;
    this.currentEnvironment = environmentName;

    this.environmentChanged.emit(environmentName);

    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}