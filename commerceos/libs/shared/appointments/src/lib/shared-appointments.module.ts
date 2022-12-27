import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AppointmentsAppState } from './store';

export const NgxsFeatureModule = NgxsModule.forFeature([AppointmentsAppState]);

@NgModule({
  imports: [
    CommonModule,
    NgxsFeatureModule,
  ],
})
export class SharedAppointmentsModule {}
