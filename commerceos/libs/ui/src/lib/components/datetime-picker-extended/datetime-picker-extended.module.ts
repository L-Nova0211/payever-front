import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { PebCheckboxModule } from '../checkbox/checkbox.module';

import { PebDateTimePickerExtendedComponent } from './datetime-picker-extended';

@NgModule({
  imports: [CommonModule, MatDatepickerModule, OverlayModule, PortalModule, MatMomentDateModule, PebCheckboxModule],
  declarations: [PebDateTimePickerExtendedComponent],
  exports: [PebDateTimePickerExtendedComponent, PebCheckboxModule],
})
export class PebDateTimePickerExtendedModule {}
