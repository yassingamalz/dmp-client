
// src/app/features/files/files.module.ts
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FilesRoutingModule } from './files-routing.module';

import { FileBrowserComponent } from './components/file-browser/file-browser.component';
import { FileFiltersComponent } from './components/file-filters/file-filters.component';
import { FilesComponent } from './files/files.component';

@NgModule({
  declarations: [
    FilesComponent,
    FileBrowserComponent,
    FileFiltersComponent
  ],
  imports: [
    SharedModule,
    FilesRoutingModule
  ]
})
export class FilesModule { }

