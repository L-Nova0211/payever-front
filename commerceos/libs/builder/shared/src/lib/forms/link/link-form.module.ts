import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebFormControlModule } from '../../form-control';

import { PebLinkForm } from './link-form.component';
import { PebLinkFormService } from './link-form.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebFormControlModule,
  ],
  declarations: [
    PebLinkForm,
  ],
  exports: [
    PebLinkForm,
  ],
  providers: [
    PebLinkFormService,
  ],
})
export class PebLinkFormModule {
}
