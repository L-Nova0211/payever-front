import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { I18nModule } from '@pe/i18n';
import { PETextEditorModule } from '@pe/text-editor';
import {
  PebButtonToggleModule,
  PebColorPickerFormModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSelectModule,
  PeInputPickerModule,
  PePickerModule,
} from '@pe/ui';

import { ImagesUploaderService } from '../services/images-uploader.service';

import { PebWallpapersContextMenuComponent } from './context-menu/context-menu.component';
import { EditAddressComponent } from './edit-address/edit-address.component';
import { EditBankComponent } from './edit-bank/edit-bank.component';
import { EditCompanyComponent } from './edit-company/edit-company.component';
import { EditContactComponent } from './edit-contact/edit-contact.component';
import { EditCurrencyStylesComponent } from './edit-currency/edit-currency-styles/edit-currency-styles.component';
import { EditCurrencyComponent } from './edit-currency/edit-currency.component';
import { EditLanguageComponent } from './edit-language/edit-language.component';
import { EditOwnerComponent } from './edit-owner/edit-owner.component';
import { EditPasswordComponent } from './edit-password/edit-password.component';
import { EditPersonalInfoComponent } from './edit-personal-info/edit-personal-info.component';
import { EditPoliciesComponent } from './edit-policies/edit-policies.component';
import { EditShippingStylesComponent } from './edit-shipping/edit-shipping-styles.component';
import { EditShippingComponent } from './edit-shipping/edit-shipping.component';
import { EditStyleComponent } from './edit-style/edit-style.component';
import { EditTaxesComponent } from './edit-taxes/edit-taxes.component';
import { LogoAndStatusPickerComponent } from './logo-and-status-picker/logo-and-status-picker.component';

@NgModule({
  declarations: [
    EditPersonalInfoComponent,
    EditPoliciesComponent,
    EditLanguageComponent,
    EditPasswordComponent,
    EditShippingComponent,
    EditShippingStylesComponent,
    EditStyleComponent,
    PebWallpapersContextMenuComponent,
    EditAddressComponent,
    EditCurrencyComponent,
    EditCompanyComponent,
    EditContactComponent,
    EditBankComponent,
    EditTaxesComponent,
    LogoAndStatusPickerComponent,
    EditOwnerComponent,
    EditCurrencyStylesComponent,
  ],
  imports: [
    PebFormFieldTextareaModule,
    PebFormBackgroundModule,
    I18nModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    PebSelectModule,
    PebButtonToggleModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    MatGoogleMapsAutocompleteModule,
    PebColorPickerFormModule,
    PebLogoPickerModule,
    PePickerModule,
    PeInputPickerModule,
    PETextEditorModule,
  ],
  providers: [
    ImagesUploaderService,
  ],
  exports: [
    LogoAndStatusPickerComponent,
    PebWallpapersContextMenuComponent,
    EditCurrencyComponent,
  ],
})
export class ComponentModule {}
