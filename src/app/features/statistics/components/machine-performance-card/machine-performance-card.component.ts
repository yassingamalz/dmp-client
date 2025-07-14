// src/app/features/statistics/components/machine-performance-card/machine-performance-card.component.ts
import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { MachineStatistics } from '../../../../core/models/statistics';

interface PerformanceAttribute {
  name: string;
  value: number;
  displayValue: number;
  subAttributes: {
    name: string;
    value: number;
  }[];
}

@Component({
  selector: 'app-machine-performance-card',
  standalone: false,
  templateUrl: './machine-performance-card.component.html',
  styleUrls: ['./machine-performance-card.component.scss']
})
export class MachinePerformanceCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() machineStats: MachineStatistics | null = null;
  @Input() selectedPeriod: 'lastMonth' | 'lastYear' | 'overall' = 'lastMonth';
  @Input() loading = false;

  performanceAttributes: PerformanceAttribute[] = [];
  overallRating = 0;
  displayRating = 0;
  animationStarted = false;
  private animationFrameId?: number;

  ngOnInit(): void {
    // Initialize with default attributes for skeleton
    this.initializeDefaultAttributes();
    
    // Watch for changes in machineStats and loading
    this.checkAndStartAnimations();
  }

  ngOnChanges(): void {
    this.checkAndStartAnimations();
  }

  private checkAndStartAnimations(): void {
    if (!this.loading && this.machineStats) {
      this.calculatePerformanceAttributes();
      this.calculateOverallRating();
      // Start animations after component is rendered
      setTimeout(() => {
        this.animationStarted = true;
        this.startNumberAnimations();
      }, 100);
    }
  }

  private initializeDefaultAttributes(): void {
    // Set default empty attributes for skeleton display
    this.performanceAttributes = [
      {
        name: 'Tasso Successo',
        value: 0,
        displayValue: 0,
        subAttributes: [
          { name: 'Elaborati', value: 0 },
          { name: 'Completati', value: 0 }
        ]
      },
      {
        name: 'Efficienza',
        value: 0,
        displayValue: 0,
        subAttributes: [
          { name: 'Velocità', value: 0 },
          { name: 'Utilizzo', value: 0 }
        ]
      },
      {
        name: 'Affidabilità',
        value: 0,
        displayValue: 0,
        subAttributes: [
          { name: 'Uptime', value: 0 },
          { name: 'Stabilità', value: 0 }
        ]
      },
      {
        name: 'Qualità',
        value: 0,
        displayValue: 0,
        subAttributes: [
          { name: 'Precisione', value: 0 },
          { name: 'Consistenza', value: 0 }
        ]
      }
    ];
  }

  ngOnDestroy(): void {
    this.animationStarted = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private startNumberAnimations(): void {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for car engine startup feel
      const easeProgress = this.engineStartupEasing(progress);

      // Animate overall rating
      this.displayRating = Math.floor(this.overallRating * easeProgress);

      // Animate performance attributes
      this.performanceAttributes.forEach(attr => {
        attr.displayValue = Math.floor(attr.value * easeProgress);
      });

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private engineStartupEasing(t: number): number {
    // Car engine startup easing: slow start, then quick acceleration, then settle
    if (t < 0.3) {
      return Math.pow(t / 0.3, 3) * 0.1;
    } else if (t < 0.8) {
      const adjusted = (t - 0.3) / 0.5;
      return 0.1 + Math.pow(adjusted, 2) * 0.7;
    } else {
      const adjusted = (t - 0.8) / 0.2;
      return 0.8 + adjusted * 0.2;
    }
  }

  private calculatePerformanceAttributes(): void {
    if (!this.machineStats) return;

    const stats = this.machineStats[this.selectedPeriod];
    const successRate = stats.successRate;
    const errorRate = ((stats.errors / stats.processed) * 100);
    const efficiency = Math.min(100, (stats.processed / 1000) * 100);
    const reliability = Math.max(0, 100 - (errorRate * 2));
    const throughput = Math.min(100, (stats.processed / stats.done) * 10);
    const quality = Math.max(0, 100 - errorRate);

    this.performanceAttributes = [
      {
        name: 'Tasso Successo',
        value: Math.round(successRate),
        displayValue: 0,
        subAttributes: [
          { name: 'Elaborati', value: Math.round((stats.processed / 100)) },
          { name: 'Completati', value: Math.round((stats.done / 100)) }
        ]
      },
      {
        name: 'Efficienza',
        value: Math.round(efficiency),
        displayValue: 0,
        subAttributes: [
          { name: 'Velocità', value: Math.round(throughput) },
          { name: 'Utilizzo', value: Math.round(efficiency * 0.8) }
        ]
      },
      {
        name: 'Affidabilità',
        value: Math.round(reliability),
        displayValue: 0,
        subAttributes: [
          { name: 'Uptime', value: Math.round(reliability * 0.95) },
          { name: 'Stabilità', value: Math.round(reliability * 0.9) }
        ]
      },
      {
        name: 'Qualità',
        value: Math.round(quality),
        displayValue: 0,
        subAttributes: [
          { name: 'Precisione', value: Math.round(quality * 0.95) },
          { name: 'Consistenza', value: Math.round(quality * 0.85) }
        ]
      }
    ];
  }

  private calculateOverallRating(): void {
    if (this.performanceAttributes.length === 0) return;

    const totalScore = this.performanceAttributes.reduce((sum, attr) => sum + attr.value, 0);
    this.overallRating = Math.round(totalScore / this.performanceAttributes.length);
    this.displayRating = 0;
  }

  getRatingClass(): string {
    if (this.overallRating >= 90) return 'excellent';
    if (this.overallRating >= 75) return 'good';
    if (this.overallRating >= 60) return 'average';
    if (this.overallRating >= 40) return 'below-average';
    return 'poor';
  }

  getAttributeColor(value: number): string {
    if (value >= 90) return 'excellent';
    if (value >= 75) return 'good';
    if (value >= 60) return 'average';
    if (value >= 40) return 'below-average';
    return 'poor';
  }

  getFormattedMachineName(): string {
    return this.machineStats?.machineName || 'Macchina Sconosciuta';
  }

  getFormattedMachineId(): string {
    return this.machineStats?.machineId || 'ID-UNKNOWN';
  }

  getPeriodLabel(): string {
    const labels = {
      'lastMonth': 'Ultimo Mese',
      'lastYear': 'Ultimo Anno',
      'overall': 'Totale'
    };
    return labels[this.selectedPeriod];
  }
}