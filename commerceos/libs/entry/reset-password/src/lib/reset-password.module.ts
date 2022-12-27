import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { ButtonModule } from '@pe/button';
import { EntrySharedModule, ReCaptchaModule } from '@pe/entry/shared';
import { FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import {
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
} from '@pe/ui';

import { ForgotPasswordComponent, ResetPasswordComponent } from './components/index';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    I18nModule.forChild(),
    FormModule,
    ResetPasswordRoutingModule,
    MatButtonModule,
    ButtonModule,
    EntrySharedModule,
    PebFormBackgroundModule,
    PebMessagesModule,
    PebFormFieldInputModule,
    ReCaptchaModule,
  ],
  declarations: [ForgotPasswordComponent, ResetPasswordComponent],
})
export class ResetPasswordModule {}
