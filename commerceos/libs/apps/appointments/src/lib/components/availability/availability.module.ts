import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { TextMaskModule } from 'angular2-text-mask';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';

import { PeAuthService } from '@pe/auth';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebSelectModule,
} from '@pe/ui';

import { PeCommonItemService } from '../../classes';
import {
  CreateAvailabilityGql,
  DeleteAvailabilityGql,
  GetAvailabilitiesGql,
  GetAvailabilityGql, GetDefaultAvailabilityGql,
  UpdateAvailabilityGql,
} from '../../graph-ql';
import { apolloInterceptor } from '../../interceptors';
import {
  PeAppointmentsReferenceService,
  PeAppointmentsAvailabilityApiService,
  PeAppointmentsAvailabilityService, PeErrorsHandlerService,
} from '../../services';
import { PE_APPOINTMENTS_API_PATH } from '../../tokens';
import { PeAppointmentsAvailabilityEditorComponent } from '../availability-editor';

import { PeAppointmentsAvailabilityComponent } from './availability.component';

const routes: Routes = [{
  path: '',
  component: PeAppointmentsAvailabilityComponent,
}];

const angularModules = [
  CommonModule,
  FormsModule,
  MatIconModule,
  NgxsModule.forFeature([PeGridState]),
  ReactiveFormsModule,
  RouterModule.forChild(routes),
  TextMaskModule,
];

const apolloModules = [
  ApolloModule,
  HttpLinkModule,
];

const peModules = [
  I18nModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebCheckboxModule,
  PebButtonModule,
  PebSelectModule,

  PeGridModule,
];

@NgModule({
  declarations: [
    PeAppointmentsAvailabilityComponent,
    PeAppointmentsAvailabilityEditorComponent,
  ],
  imports: [
    ...angularModules,
    ...apolloModules,
    ...peModules,
  ],
  providers: [
    CreateAvailabilityGql,
    DeleteAvailabilityGql,
    GetAvailabilitiesGql,
    GetAvailabilityGql,
    UpdateAvailabilityGql,
    GetDefaultAvailabilityGql,

    PeAppointmentsAvailabilityApiService,
    PeAppointmentsReferenceService,
    {
      provide: PeCommonItemService,
      useClass: PeAppointmentsAvailabilityService,
    },
    {
      deps: [HttpLink, PE_APPOINTMENTS_API_PATH, PeAuthService, PeErrorsHandlerService],
      provide: APOLLO_OPTIONS,
      useFactory: apolloInterceptor,
    },
  ],
})
export class PeAppointmentsAvailabilityModule { }
