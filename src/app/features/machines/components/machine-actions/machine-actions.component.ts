// src/app/features/machines/components/machine-actions/machine-actions.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MachineStatusDto } from '../../../../core/models/machine-status';

/**
 * Machine actions panel component.
 * Provides bulk operations and statistics for machine management.
 */
@Component({
  selector: 'app-machine-actions',
  standalone: false,
  templateUrl: './machine-actions.component.html',
  styleUrls: ['./machine-actions.component.scss']
})
export class MachineActionsComponent {
  @Input() machines: MachineStatusDto[] = [];
  @Input() environment!: string;
  @Input() loading = false;
  @Output() refreshMachines = new EventEmitter<void>();
  @Output() toggleAllMachines = new EventEmitter<boolean>();
  @Output() exportConfiguration = new EventEmitter<void>();
  @Output() getStats = new EventEmitter<void>();

  /**
   * Gets count of active and enabled machines.
   * @returns Number of machines that are both active and policy enabled
   */
  get activeMachinesCount(): number {
    return this.machines.filter(m => m.active && m.policyEnabled).length;
  }

  /**
   * Gets count of total active machines.
   * @returns Number of machines that are active
   */
  get totalMachinesCount(): number {
    return this.machines.filter(m => m.active).length;
  }

  /**
   * Checks if all active machines are enabled.
   * @returns True if all active machines have policy enabled
   */
  get allMachinesEnabled(): boolean {
    const activeMachines = this.machines.filter(m => m.active);
    return activeMachines.length > 0 && activeMachines.every(m => m.policyEnabled);
  }

  /**
   * Checks if all active machines are disabled.
   * @returns True if all active machines have policy disabled
   */
  get allMachinesDisabled(): boolean {
    const activeMachines = this.machines.filter(m => m.active);
    return activeMachines.length > 0 && activeMachines.every(m => !m.policyEnabled);
  }

  /**
   * Gets count of machines with policy enabled.
   * @returns Number of machines with policy enabled
   */
  get enabledMachinesCount(): number {
    return this.machines.filter(m => m.policyEnabled).length;
  }

  /**
   * Gets count of active machines with policy disabled.
   * @returns Number of active machines with policy disabled
   */
  get disabledMachinesCount(): number {
    return this.machines.filter(m => m.active && !m.policyEnabled).length;
  }

  /**
   * Gets count of inactive machines.
   * @returns Number of machines that are inactive
   */
  get inactiveMachinesCount(): number {
    return this.machines.filter(m => !m.active).length;
  }

  /**
   * Handles refresh machines action.
   */
  onRefresh(): void {
    if (this.loading) return;
    this.refreshMachines.emit();
  }

  /**
   * Handles bulk toggle all machines action.
   * @param enabled Target state for all machines
   */
  onToggleAll(enabled: boolean): void {
    if (this.loading) return;
    this.toggleAllMachines.emit(enabled);
  }

  /**
   * Handles configuration export action.
   */
  onExportConfiguration(): void {
    if (this.loading) return;
    this.exportConfiguration.emit();
  }

  /**
   * Handles statistics refresh action.
   */
  onGetStats(): void {
    if (this.loading) return;
    this.getStats.emit();
  }
}