import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PebFormControlModule } from '../../form-control/form-control.module';

import { PebRestrictAccessForm } from './restrict-access.form';
import { PebRestrictAccessFormComponent } from './restrict-access-form.component';
import { PebRestrictAccessFormService } from './restrict-access-form.service';



@NgModule({
  declarations: [PebRestrictAccessForm, PebRestrictAccessFormComponent],
  imports: [
    CommonModule,
    PebFormControlModule,
    ReactiveFormsModule,
  ],
  providers: [PebRestrictAccessFormService],
  exports: [PebRestrictAccessFormComponent],
})
export class PebRestrictAccessFormModule { }
