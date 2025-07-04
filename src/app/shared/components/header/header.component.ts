// src/app/shared/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentTheme$: Observable<'light' | 'dark'>;
  currentRoute = '/export';

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
  }

  navigateTo(route: string): void {
    this.currentRoute = route;
    // Navigate to existing routes
    if (route === '/export' || route === '/files' || route === '/statistics') {
      this.router.navigate([route]);
    } else {
      // Handle non-existing routes gracefully
      console.log(`Navigation to ${route} - Route not implemented yet`);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}