import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ButtonModule } from '@pe/button';
import { FormModule, AddressService } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { DynamicFormServiceService, SharedBusinessFormModule } from '@pe/shared/business-form';
import {
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebSelectModule,
  PebCountryPickerModule,
  PeAutocompleteModule,
  PebFormFieldTextareaModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebRadioModule,
} from '@pe/ui';

import { CreateBusinessFormComponent, DynamicBusinessFormComponent } from './components';
import {
  AutocompleteIndustryComponent,
  SelectBusinessStatusComponent,
  SelectStatusComponent,
  SelectSalesComponent,
  SelectPhoneCodeComponent,
  InputPhoneComponent,
} from './components/default-controls';
import { CustomValidatorsService, DynamicFormService } from './services';

const standardComponents = [
  AutocompleteIndustryComponent,
  SelectBusinessStatusComponent,
  SelectStatusComponent,
  SelectSalesComponent,
  SelectPhoneCodeComponent,
  InputPhoneComponent,
]
@NgModule({
  imports: [
    CommonModule,
    FormModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ButtonModule,
    I18nModule.forChild(),
    PebFormBackgroundModule,
    PebSelectModule,
    PebFormFieldTextareaModule,
    PeAutocompleteModule,
    PebCountryPickerModule,
    PebFormFieldInputModule,
    PebButtonToggleModule,
    PebCheckboxModule,
    PebRadioModule,

    SharedBusinessFormModule,
  ],
  declarations: [
    CreateBusinessFormComponent,
    DynamicBusinessFormComponent,
    ...standardComponents,
  ],
  exports: [
    CreateBusinessFormComponent,
    DynamicBusinessFormComponent,
  ],
  providers: [
    AddressService,
    DynamicFormServiceService,
    CustomValidatorsService,
    DynamicFormService,
  ],
})
export class BusinessFormModule { }
