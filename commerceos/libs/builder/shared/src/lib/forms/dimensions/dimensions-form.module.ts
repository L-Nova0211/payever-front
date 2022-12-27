import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebFormControlModule } from '../../form-control';

import { PebDimensionsForm } from './dimensions-form.component';
import { PebDimensionsFormService } from './dimensions-form.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebFormControlModule,
  ],
  declarations: [
    PebDimensionsForm,
  ],
  exports: [
    PebDimensionsForm,
  ],
  providers: [
    PebDimensionsFormService,
  ],
})
export class PebDimensionsFormModule {
}
