
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { TextMaskModule } from 'angular2-text-mask';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';

import { PeAuthService } from '@pe/auth';
import {
  PebDocumentMakerElement,
  PebGridMakerElement,
  PebSectionMakerElement,
  PebShapeMakerElement, PebTextMakerElement,
} from '@pe/builder-elements';
import { ELEMENT_FACTORIES } from '@pe/builder-renderer';
import { PeFoldersActionsService, PeFoldersApiService, PeFoldersModule } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule, TranslationGuard } from '@pe/i18n';
import { PeMediaService } from '@pe/media';
import {
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebProductPickerModule,
  PebRadioModule,
  PebSelectModule,
} from '@pe/ui';

import { PeCommonItemService } from '../../classes';
import { PeAppointmentsRoutingPathsEnum } from '../../enums';
import {
  CreateAppointmentGQL,
  CreateFieldGQL,
  DeleteAppointmentGQL,
  DeleteFieldGQL,
  GetAppointmentGQL,
  GetAppointmentsGQL,
  GetFieldsGQL,
  UpdateAppointmentGQL,
  UpdateFieldGQL,
  GetDefaultAvailabilityGql,
  CreateAvailabilityGql,
  DeleteAvailabilityGql,
  GetAvailabilitiesGql,
  GetAvailabilityGql,
  UpdateAvailabilityGql,
} from '../../graph-ql';
import { apolloInterceptor } from '../../interceptors';
import {
  PeAppointmentsCalendarApiService,
  PeAppointmentsCalendarService,
  PeAppointmentsPickerService,
  PeAppointmentsReferenceService,
  PeErrorsHandlerService, PeAppointmentsAvailabilityApiService,
} from '../../services';
import { PE_APPOINTMENTS_API_PATH } from '../../tokens';
import { PeAppointmentsAppointmentEditorComponent } from '../appointment-editor';
import { PeAppointmentsCutomFieldEditorComponent } from '../custom-field-editor';
import { PeAppointmentsCutomFieldsSwitcherComponent } from '../custom-fields-switcher';
import { PeAppointmentsPickersWrapperComponent } from '../pickers-wrapper';
import { PeAppointmentsPickersWrapperStylesComponent } from '../pickers-wrapper-styles';

import { PeAppointmentsCalendarComponent } from './calendar.component';

const routes: Routes = [{
  path: '',
  component: PeAppointmentsCalendarComponent,
  children: [
    {
      path: PeAppointmentsRoutingPathsEnum.Contacts,
      component: PeAppointmentsPickersWrapperComponent,
      children: [{
        path: '',
        loadChildren: () => import('@pe/apps/contacts').then(m => m.ContactsModule),
        canActivate: [TranslationGuard],
        data: {
          i18nDomains: [
            'contacts-app',
            'filters-app',
          ],
          isFromDashboard: true,
        },
      }],
    },
    {
      path: PeAppointmentsRoutingPathsEnum.Products,
      component: PeAppointmentsPickersWrapperComponent,
      children: [{
        path: '',
        loadChildren: () => import('@pe/apps/products').then(m => m.ProductsModule),
        canActivate: [TranslationGuard],
        data: {
          i18nDomains: [
            'commerceos-products-list-app',
            'commerceos-products-editor-app',
          ],
          isFromDashboard: true,
        },
      }],
    },
  ],
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
  PebFormFieldTextareaModule,
  PebProductPickerModule,
  PebRadioModule,
  PebSelectModule,

  PeFoldersModule,
  PeGridModule,
];

@NgModule({
  declarations: [
    PeAppointmentsAppointmentEditorComponent,
    PeAppointmentsCalendarComponent,
    PeAppointmentsCutomFieldEditorComponent,
    PeAppointmentsCutomFieldsSwitcherComponent,
    PeAppointmentsPickersWrapperComponent,
    PeAppointmentsPickersWrapperStylesComponent,
  ],
  imports: [
    ...angularModules,
    ...apolloModules,
    ...peModules,
  ],
  providers: [
    CreateAppointmentGQL,
    DeleteAppointmentGQL,
    GetAppointmentGQL,
    GetAppointmentsGQL,
    UpdateAppointmentGQL,
    CreateFieldGQL,
    DeleteFieldGQL,
    GetFieldsGQL,
    UpdateFieldGQL,

    CreateAvailabilityGql,
    DeleteAvailabilityGql,
    GetAvailabilitiesGql,
    GetAvailabilityGql,
    UpdateAvailabilityGql,
    GetDefaultAvailabilityGql,
    PeAppointmentsAvailabilityApiService,

    PeAppointmentsCalendarApiService,
    PeAppointmentsCalendarService,
    PeAppointmentsPickerService,
    PeAppointmentsReferenceService,
    PeFoldersActionsService,
    PeFoldersApiService,
    PeMediaService,
    {
      provide: ELEMENT_FACTORIES,
      useValue: {
        document: PebDocumentMakerElement,
        grid: PebGridMakerElement,
        section: PebSectionMakerElement,
        shape: PebShapeMakerElement,
        text: PebTextMakerElement,
      },
    },
    {
      provide: PeCommonItemService,
      useClass: PeAppointmentsCalendarService,
    },
    {
      deps: [HttpLink, PE_APPOINTMENTS_API_PATH, PeAuthService, PeErrorsHandlerService],
      provide: APOLLO_OPTIONS,
      useFactory: apolloInterceptor,
    },
  ],
})
export class PeAppointmentsCalendarModule { }
