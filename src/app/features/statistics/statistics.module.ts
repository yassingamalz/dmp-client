// src/app/features/statistics/statistics.module.ts
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { MachinePerformanceCardComponent } from './components/machine-performance-card/machine-performance-card.component';
import { StatisticsComponent } from './statistics/statistics.component';

@NgModule({
  declarations: [
    StatisticsComponent,
    MachinePerformanceCardComponent
  ],
  imports: [
    SharedModule,
    StatisticsRoutingModule
  ]
})
export class StatisticsModule { }