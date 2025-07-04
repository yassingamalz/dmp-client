// src/app/features/statistics/statistics.module.ts
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { StatisticsRoutingModule } from './statistics-routing.module';

import { StatisticsComponent } from './statistics/statistics.component';
import { StatsDashboardComponent } from './components/stats-dashboard/stats-dashboard.component';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';

@NgModule({
  declarations: [
    StatisticsComponent,
    StatsDashboardComponent,
    StatsCardsComponent
  ],
  imports: [
    SharedModule,
    StatisticsRoutingModule
  ]
})
export class StatisticsModule { }