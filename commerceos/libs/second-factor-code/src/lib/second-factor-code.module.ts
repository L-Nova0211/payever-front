import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';

import { BrowserModule } from '@pe/browser';
import { ButtonModule } from '@pe/button';
import { EntrySharedModule } from '@pe/entry/shared';
import { FormComponentsInputModule, FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';

import {
  AutofocusDirective,
  LoginSecondFactorCodeComponent,
} from './login-second-factor-code/login-second-factor-code.component';
import { LoginFormService } from '@pe/entry/login';


const routes: Routes = [
  {
    path: '',
    component: LoginSecondFactorCodeComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    FormModule,
    ReactiveFormsModule,
    FormComponentsInputModule,
    BrowserModule,
    I18nModule.forChild(),
    RouterModule.forChild(routes),
    MatButtonModule,
    EntrySharedModule,
  ],
  exports: [LoginSecondFactorCodeComponent],
  declarations: [LoginSecondFactorCodeComponent, AutofocusDirective],
  providers: [
    LoginFormService,
  ],
})
export class SecondFactorCodeModule {}
