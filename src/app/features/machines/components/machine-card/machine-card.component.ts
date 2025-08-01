// src/app/features/machines/components/machine-card/machine-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MachineStatusDto, MachineToggleRequest } from '../../../../core/models/machine-status';

@Component({
  selector: 'app-machine-card',
  standalone: false,
  templateUrl: './machine-card.component.html',
  styleUrls: ['./machine-card.component.scss']
})
export class MachineCardComponent {
  @Input() machine!: MachineStatusDto;
  @Input() environment!: string;
  @Input() loading = false;
  @Output() toggle = new EventEmitter<MachineToggleRequest>();
  @Output() viewDetails = new EventEmitter<MachineStatusDto>();

  showDetails = false;

  /**
   * Gets status indicator color based on machine state.
   */
  get statusColor(): string {
    if (!this.machine.overallActive) return '#6c757d';
    return this.machine.policyEnabled ? '#28a745' : '#dc3545';
  }

  /**
   * Gets localized status text for machine.
   */
  get statusText(): string {
    if (!this.machine.overallActive) return 'INATTIVA';
    return this.machine.policyEnabled ? 'ATTIVA' : 'DISATTIVATA';
  }

  /**
   * Gets formatted last modified timestamp.
   */
  get lastModifiedFormatted(): string {
    const dateString = this.machine.lastModified || this.machine.lastStartup;
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Gets display name for machine with fallback.
   */
  get displayName(): string {
    return this.machine.displayName || this.machine.machineName;
  }

  /**
   * Gets comma-separated folder list.
   */
  get folders(): string {
    return this.machine.folders?.join(', ') || 'N/A';
  }

  /**
   * Gets comma-separated roots list.
   */
  get roots(): string {
    return this.machine.roots?.join(', ') || 'N/A';
  }

  /**
   * Handles machine toggle action.
   */
  onToggle(): void {
    if (this.loading) return;

    const request: MachineToggleRequest = {
      machineName: this.machine.machineName,
      environment: this.environment
    };

    this.toggle.emit(request);
  }

  /**
   * Handles view details action.
   */
  onViewDetails(): void {
    this.viewDetails.emit(this.machine);
  }

  /**
   * Toggles detail section visibility.
   */
  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}