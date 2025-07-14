// src/app/shared/components/header/header.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild(SettingsModalComponent) settingsModal!: SettingsModalComponent;
  
  currentTheme$: Observable<'light' | 'dark'>;
  currentRoute = '/export';
  private destroy$ = new Subject<void>();

  machineInfo = {
    id: 'CG008668',
    name: 'Zeiss Prismo 5',
    status: 'ONLINE'
  };

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    this.currentTheme$ = this.themeService.currentTheme$;
  }

  ngOnInit(): void {
    // Set initial route
    this.currentRoute = this.router.url;
    
    // Listen for route changes to keep tab selection in sync
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    // Navigate to existing routes
    if (route === '/export' || route === '/files' || route === '/statistics') {
      this.router.navigate([route]);
    } else {
      // Handle non-existing routes gracefully
      console.log(`Navigazione a ${route} - Route non ancora implementata`);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openSettings(): void {
    this.settingsModal.openModal();
  }
}