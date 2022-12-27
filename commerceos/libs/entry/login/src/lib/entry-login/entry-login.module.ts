import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { BrowserModule } from '@pe/browser';
import { ButtonModule } from '@pe/button';
import { PE_ENV } from '@pe/common';
import { ReCaptchaModule } from '@pe/entry/shared';
import { FormComponentsInputModule, FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule } from '@pe/ui';

import { EntryLoginComponent } from './entry-login.component';

(window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons(['social-facebook-12']);

@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    FormModule,
    ReactiveFormsModule,
    FormComponentsInputModule,
    ButtonModule,
    MatButtonModule,
    MediaModule,
    ReCaptchaModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    BrowserModule,
  ],
  declarations: [
    EntryLoginComponent,
  ],
  exports: [
    EntryLoginComponent,
  ],
  providers: [
    {
      provide: 'GOOGLE_AUTH_CLIENT_ID',
      deps: [PE_ENV],
      useFactory: env => env.config.googleAuthClientId,
    },
  ],
})
export class EntryLoginModule { }
