import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BaseModule } from '@pe/base';
import { PeDomainsModule } from '@pe/domains';
import { I18nModule } from '@pe/i18n';
import { PeMediaService } from '@pe/media';
import {
  PebButtonModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebLogoPickerModule,
  PeListModule,
} from '@pe/ui';

import { PeAppointmentsNetworksApiService, PeAppointmentsReferenceService } from '../../services';
import { PeAppointmentsNetworkEditorComponent } from '../network-editor';

import { PeAppointmentsSettingsComponent } from './settings.component';

const routes: Routes = [{
  path: '',
  component: PeAppointmentsSettingsComponent,
}];

@NgModule({
  declarations: [
    PeAppointmentsNetworkEditorComponent,
    PeAppointmentsSettingsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    BaseModule,
    I18nModule,
    PebButtonModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebLogoPickerModule,
    PeDomainsModule,
    PeListModule,
  ],
  providers: [
    PeAppointmentsNetworksApiService,
    PeAppointmentsReferenceService,
    PeMediaService,
  ],
})
export class PeAppointmentsSettingsModule { }
