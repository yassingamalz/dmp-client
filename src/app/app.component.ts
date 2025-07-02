// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
      <app-modal></app-modal>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dmp-client';

  constructor(
    private themeService: ThemeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Welcome message
    this.toastService.showToast('success', 'Welcome!', 'DMP Client is ready to use');
  }
}