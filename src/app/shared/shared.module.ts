// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { ModalComponent } from './components/modal/modal.component';
import { AutocompleteInputComponent } from './components/autocomplete-input/autocomplete-input.component';
import { QrScannerModalComponent } from './components/qr-scanner-modal/qr-scanner-modal.component';

@NgModule({
  declarations: [
    HeaderComponent,
    ToastComponent,
    ModalComponent,
    AutocompleteInputComponent,
    QrScannerModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    ToastComponent,
    ModalComponent,
    AutocompleteInputComponent,
    QrScannerModalComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule 
  ]
})
export class SharedModule { }