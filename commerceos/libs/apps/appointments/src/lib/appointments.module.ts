import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import {
  PebDocumentMakerElement,
  PebGridMakerElement,
  PebSectionMakerElement,
  PebShapeMakerElement, PebTextMakerElement,
} from '@pe/builder-elements';
import { ELEMENT_FACTORIES } from '@pe/builder-renderer';
import { PeBuilderDashboardAccessApiService } from '@pe/dashboard';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';

import { PeAppointmentsRoutingModule } from './appointments-routing.module';
import { PeAppointmentsComponent } from './appointments.component';
import { TokenInterceptor } from './interceptors';
import {
  PeAppointmentsAccessApiService,
  PeAppointmentsNetworksApiService,
  PeAppointmentsSidebarService,
  PeErrorsHandlerService,
} from './services';

const angularModules = [
  CommonModule,
  MatIconModule,
];

const peModules = [
  I18nModule,
  PeFoldersModule,
  PeGridModule,
];

const angularServices = [
  CurrencyPipe,
  TitleCasePipe,
];

const appointmentsServices = [
  PeErrorsHandlerService,

  PeAppointmentsAccessApiService,
  PeAppointmentsNetworksApiService,
  PeAppointmentsSidebarService,
  {
    provide: PeBuilderDashboardAccessApiService,
    useExisting: PeAppointmentsAccessApiService,
  },
];

@NgModule({
  declarations: [PeAppointmentsComponent],
  imports: [
    PeAppointmentsRoutingModule,
    ...angularModules,
    ...peModules,
  ],
  providers: [
    ...angularServices,
    ...appointmentsServices,
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
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
    },
  ],
})
export class PeAppointmentsModule { }
