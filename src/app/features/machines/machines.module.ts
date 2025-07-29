// src/app/features/machines/machines.module.ts
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MachinesRoutingModule } from './machines-routing.module';

import { MachinesComponent } from './machines/machines.component';
import { MachineCardComponent } from './components/machine-card/machine-card.component';
import { EnvironmentSelectorComponent } from './components/environment-selector/environment-selector.component';
import { MachineActionsComponent } from './components/machine-actions/machine-actions.component';

@NgModule({
  declarations: [
    MachinesComponent,
    MachineCardComponent,
    EnvironmentSelectorComponent,
    MachineActionsComponent
  ],
  imports: [
    SharedModule,
    MachinesRoutingModule
  ]
})
export class MachinesModule { }