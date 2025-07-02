
// src/app/features/export/export.module.ts
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ExportRoutingModule } from './export-routing.module';
import { ExportFormComponent } from './components/export-form/export-form.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ExportComponent } from './export/export.component';

@NgModule({
  declarations: [
    ExportComponent,
    ExportFormComponent,
    FileUploadComponent
  ],
  imports: [
    SharedModule,
    ExportRoutingModule
  ]
})
export class ExportModule { }
