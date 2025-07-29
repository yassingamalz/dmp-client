// src/app/features/machines/components/machine-actions/machine-actions.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MachineStatus } from '../../../../core/models/machine-status';

@Component({
  selector: 'app-machine-actions',
  standalone: false,
  templateUrl: './machine-actions.component.html',
  styleUrls: ['./machine-actions.component.scss']
})
export class MachineActionsComponent {
  @Input() machines: MachineStatus[] = [];
  @Input() environment!: string;
  @Input() loading = false;
  @Output() refreshMachines = new EventEmitter<void>();
  @Output() toggleAllMachines = new EventEmitter<boolean>();
  @Output() exportConfiguration = new EventEmitter<void>();

  get activeMachinesCount(): number {
    return this.machines.filter(m => m.active && m.policyEnabled).length;
  }

  get totalMachinesCount(): number {
    return this.machines.filter(m => m.active).length;
  }

  get allMachinesEnabled(): boolean {
    const activeMachines = this.machines.filter(m => m.active);
    return activeMachines.length > 0 && activeMachines.every(m => m.policyEnabled);
  }

  get allMachinesDisabled(): boolean {
    const activeMachines = this.machines.filter(m => m.active);
    return activeMachines.length > 0 && activeMachines.every(m => !m.policyEnabled);
  }

  onRefresh(): void {
    if (this.loading) return;
    this.refreshMachines.emit();
  }

  onToggleAll(enabled: boolean): void {
    if (this.loading) return;
    this.toggleAllMachines.emit(enabled);
  }

  onExportConfiguration(): void {
    if (this.loading) return;
    this.exportConfiguration.emit();
  }
}