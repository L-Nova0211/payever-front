import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebFormControlModule } from '../../form-control';

import { PebBorderRadiusForm } from './border-radius-form.component';
import { PebBorderRadiusFormService } from './border-radius-form.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebFormControlModule,
  ],
  declarations: [
    PebBorderRadiusForm,
  ],
  exports: [
    PebBorderRadiusForm,
  ],
  providers: [
    PebBorderRadiusFormService,
  ],
})
export class PebBorderRadiusFormModule {
}
