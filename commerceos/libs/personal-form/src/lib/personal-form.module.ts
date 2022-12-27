import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { ButtonModule } from '@pe/button';
import { EntrySharedModule } from '@pe/entry/shared';
import { FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import {
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebSelectModule,
  PebCountryPickerModule,
  PeAutocompleteModule,
  PebMessagesModule,
} from '@pe/ui';

import { CreatePersonalFormComponent } from './create-personal-form.component';
import { RegistrationFormService } from './service/registration-form.service';
@NgModule({
  imports: [
    CommonModule, 
    FormModule, 
    FormsModule, 
    MatButtonModule, 
    ButtonModule, 
    I18nModule.forChild(), 
    PebFormBackgroundModule, 
    PebSelectModule,
    PeAutocompleteModule,
    PebCountryPickerModule,
    PebFormFieldInputModule,
    EntrySharedModule,
    PebMessagesModule,
  ],
  declarations: [CreatePersonalFormComponent],
  exports: [CreatePersonalFormComponent],
  providers: [
    RegistrationFormService,
  ],
})
export class PersonalFormModule { }
