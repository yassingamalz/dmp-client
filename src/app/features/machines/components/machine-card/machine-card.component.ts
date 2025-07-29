// src/app/features/machines/components/machine-card/machine-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MachineStatus, MachineToggleRequest } from '../../../../core/models/machine-status';

@Component({
  selector: 'app-machine-card',
  standalone: false,
  templateUrl: './machine-card.component.html',
  styleUrls: ['./machine-card.component.scss']
})
export class MachineCardComponent {
  @Input() machine!: MachineStatus;
  @Input() environment!: string;
  @Input() loading = false;
  @Output() toggle = new EventEmitter<MachineToggleRequest>();
  @Output() viewDetails = new EventEmitter<MachineStatus>();

  showDetails = false;

  get statusColor(): string {
    if (!this.machine.active) return '#6c757d'; // Gray for inactive
    return this.machine.policyEnabled ? '#28a745' : '#dc3545'; // Green for enabled, red for disabled
  }

  get statusText(): string {
    if (!this.machine.active) return 'INATTIVA';
    return this.machine.policyEnabled ? 'ATTIVA' : 'DISATTIVATA';
  }

  get lastModifiedFormatted(): string {
    return new Date(this.machine.lastModified).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onToggle(): void {
    if (this.loading || !this.machine.active) return;

    const request: MachineToggleRequest = {
      machineId: this.machine.id,
      environment: this.environment,
      enabled: !this.machine.policyEnabled
    };

    this.toggle.emit(request);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.machine);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}