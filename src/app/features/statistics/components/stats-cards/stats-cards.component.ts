// src/app/features/statistics/components/stats-cards/stats-cards.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-stats-cards',
  template: `<div class="stats-cards"><!-- Future implementation --></div>`,
  standalone: false,
  styles: [`
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
  `]
})
export class StatsCardsComponent { }