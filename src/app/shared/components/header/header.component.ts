// src/app/shared/components/header/header.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

/**
 * Application header component with navigation and theme controls.
 * Manages route navigation and provides access to application settings.
 */
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
    this.currentRoute = this.router.url;
    
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

  /**
   * Navigates to the specified route.
   * @param route Target route path
   */
  navigateTo(route: string): void {
    this.currentRoute = route;
    if (route === '/export' || route === '/files' || route === '/statistics' || route === '/machines') {
      this.router.navigate([route]);
    } else {
      console.log(`Navigazione a ${route} - Route non ancora implementata`);
    }
  }

  /**
   * Toggles between light and dark theme.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Opens the application settings modal.
   */
  openSettings(): void {
    this.settingsModal.openModal();
  }
}