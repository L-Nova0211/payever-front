import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebFormControlModule } from '../../form-control';

import { PebGridLayoutForm } from './grid-layout-form.component';
import { PebGridLayoutFormService } from './grid-layout-form.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebFormControlModule,
  ],
  declarations: [
    PebGridLayoutForm,
  ],
  exports: [
    PebGridLayoutForm,
  ],
  providers: [
    PebGridLayoutFormService,
  ],
})
export class PebGridLayoutFormModule {
}
