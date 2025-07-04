// src/app/features/statistics/components/stats-dashboard/stats-dashboard.component.ts
import { Component, Input } from '@angular/core';
import { ProcessingStatistics, MachineStatistics } from '../../../../core/models/statistics';

@Component({
  selector: 'app-stats-dashboard',
  standalone: false,
  templateUrl: './stats-dashboard.component.html',
  styleUrls: ['./stats-dashboard.component.scss']
})
export class StatsDashboardComponent {
  @Input() statistics: ProcessingStatistics | null = null;
  @Input() loading = false;

  selectedPeriod: 'lastMonth' | 'lastYear' | 'overall' = 'lastMonth';

  periods = [
    { key: 'lastMonth' as const, label: 'Ultimo Mese' },
    { key: 'lastYear' as const, label: 'Ultimo Anno' },
    { key: 'overall' as const, label: 'Complessivo' }
  ];

  getSuccessRateClass(rate: number): string {
    if (rate >= 95) return 'excellent';
    if (rate >= 85) return 'good';
    if (rate >= 70) return 'average';
    if (rate >= 50) return 'poor';
    return 'critical';
  }

  getSuccessRateIcon(rate: number): string {
    if (rate >= 95) return 'bi-trophy-fill';
    if (rate >= 85) return 'bi-emoji-smile-fill';
    if (rate >= 70) return 'bi-emoji-neutral-fill';
    if (rate >= 50) return 'bi-emoji-frown-fill';
    return 'bi-exclamation-triangle-fill';
  }

  getMachineStatusClass(machine: MachineStatistics): string {
    const rate = machine[this.selectedPeriod].successRate;
    return this.getSuccessRateClass(rate);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  getSkeletonItems(): number[] {
    return Array(4).fill(0).map((_, i) => i);
  }
}