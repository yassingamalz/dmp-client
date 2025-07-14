// src/app/features/export/export.module.ts
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ExportRoutingModule } from './export-routing.module';
import { ExportFormComponent } from './components/export-form/export-form.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { FileCandidatesComponent } from './components/file-candidates/file-candidates.component';
import { ExportComponent } from './export/export.component';

@NgModule({
  declarations: [
    ExportComponent,
    ExportFormComponent,
    FileUploadComponent,
    FileCandidatesComponent
  ],
  imports: [
    SharedModule,
    ExportRoutingModule
  ]
})
export class ExportModule { }