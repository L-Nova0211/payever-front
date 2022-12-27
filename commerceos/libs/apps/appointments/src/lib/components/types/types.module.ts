
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
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
  CreateAppointmentTypeGQL, CreateAvailabilityGql,
  DeleteAppointmentTypeGQL, DeleteAvailabilityGql,
  GetAppointmentTypeGQL,
  GetAppointmentTypesGQL, GetAvailabilitiesGql, GetAvailabilityGql, GetDefaultAvailabilityGql,
  UpdateAppointmentTypeGQL, UpdateAvailabilityGql,
} from '../../graph-ql';
import { apolloInterceptor } from '../../interceptors';
import {
  PeAppointmentsReferenceService,
  PeAppointmentsTypesApiService,
  PeAppointmentsTypesService,
  PeErrorsHandlerService, PeAppointmentsAvailabilityApiService,
} from '../../services';
import { PE_APPOINTMENTS_API_PATH } from '../../tokens';
import { PeAppointmentsTypeEditorComponent } from '../type-editor';

import { PeAppointmentsTypesComponent } from './types.component';

const routes: Routes = [{
  path: '',
  component: PeAppointmentsTypesComponent,
}];

const angularModules = [
  CommonModule,
  FormsModule,
  NgxsModule.forFeature([PeGridState]),
  ReactiveFormsModule,
  RouterModule.forChild(routes),
];

const apolloModules = [
  ApolloModule,
  HttpLinkModule,
];

const peModules = [
  I18nModule,
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebSelectModule,

  PeGridModule,
];

@NgModule({
  declarations: [
    PeAppointmentsTypeEditorComponent,
    PeAppointmentsTypesComponent,
  ],
  imports: [
    ...angularModules,
    ...apolloModules,
    ...peModules,
  ],
  providers: [
    CreateAppointmentTypeGQL,
    DeleteAppointmentTypeGQL,
    GetAppointmentTypeGQL,
    GetAppointmentTypesGQL,
    UpdateAppointmentTypeGQL,

    CreateAvailabilityGql,
    DeleteAvailabilityGql,
    GetAvailabilitiesGql,
    GetAvailabilityGql,
    UpdateAvailabilityGql,
    GetDefaultAvailabilityGql,
    PeAppointmentsAvailabilityApiService,

    PeAppointmentsReferenceService,
    PeAppointmentsTypesApiService,
    PeAppointmentsTypesService,
    {
      provide: PeCommonItemService,
      useClass: PeAppointmentsTypesService,
    },
    {
      deps: [HttpLink, PE_APPOINTMENTS_API_PATH, PeAuthService, PeErrorsHandlerService],
      provide: APOLLO_OPTIONS,
      useFactory: apolloInterceptor,
    },
  ],
})
export class PeAppointmentsTypesModule { }
