// src/app/core/services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = new BehaviorSubject<'light' | 'dark'>('light');
  public currentTheme$ = this.currentTheme.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    this.setTheme(savedTheme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.next(theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}

