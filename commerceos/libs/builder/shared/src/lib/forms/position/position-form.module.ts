import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebFormControlModule } from '../../form-control';

import { PebPositionForm } from './position-form.component';
import { PebPositionFormService } from './position-form.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebFormControlModule,
  ],
  declarations: [
    PebPositionForm,
  ],
  exports: [
    PebPositionForm,
  ],
  providers: [
    PebPositionFormService,
  ],
})
export class PebPositionFormModule {
}
