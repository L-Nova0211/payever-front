import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { BrowserModule } from '@pe/browser';
import { ButtonModule } from '@pe/button';
import { EntrySharedModule, ReCaptchaModule } from '@pe/entry/shared';
import { FormComponentsInputModule, FormModule, SnackBarService } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule } from '@pe/ui';

import { EntryLoginModule } from './entry-login/entry-login.module';
import { LoginAsUserLayoutComponent } from './login-as-user-layout/login-as-user-layout.component';
import { LoginFormService } from './login-form.service';
import { LoginRefreshLayoutComponent } from './login-refresh-layout/login-refresh-layout.component';
import { LoginRoutingModule } from './login-routing.module';
import { PePersonalLoginLayoutComponent } from './personal-login-layout/personal-login-layout.component';
import { PersonalLoginComponent } from './personal-login/personal-login.component';
import { SocialLoginComponent } from './social-login/social-login.component';
@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    I18nModule.forChild(),
    FormModule,
    ReactiveFormsModule,
    FormComponentsInputModule,
    ButtonModule,
    EntrySharedModule,
    BrowserModule,
    MatButtonModule,
    MediaModule,
    ReCaptchaModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    EntryLoginModule,
  ],
  declarations: [
    PersonalLoginComponent,
    LoginRefreshLayoutComponent,
    LoginAsUserLayoutComponent,
    PePersonalLoginLayoutComponent,
    SocialLoginComponent,
  ],
  exports: [
    PePersonalLoginLayoutComponent,
  ],
  providers: [
    LoginFormService,
    SnackBarService,
  ],
})
export class LoginModule {}
