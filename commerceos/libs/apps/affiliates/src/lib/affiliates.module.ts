import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxsModule } from '@ngxs/store';
import { TextMaskModule } from 'angular2-text-mask';

import { BaseModule } from '@pe/base';
import { PebRendererModule } from '@pe/builder-renderer';
import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PebViewerModule } from '@pe/builder-viewer';
import { PePreloaderService, PreloaderState } from '@pe/common';
import { PeBuilderDashboardAccessApiService } from '@pe/dashboard';
import { PeDomainsModule } from '@pe/domains';
import {
  PeFoldersActionsService,
  PeFoldersApiService,
} from '@pe/folders';
import { PeGridState } from '@pe/grid';
import { CurrencyPipe, TranslateService } from '@pe/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';

import { PeAffiliatesRoutingModule } from './affiliates-routing.module';
import { PeAffiliatesComponent } from './affiliates.component';
import {
  PeAffiliatesBankAccountsEditorComponent,
  PeAffiliatesConnectComponent,
  PeAffiliatesProgramEditorComponent,
  PeAffiliatesNetworkEditorComponent,
  PeAffiliatesSettingsComponent,
  PeDatepickerComponent,
} from './components';
import { PeAffiliatesProgramResolver } from './resolvers';
import {
  PeAffiliatesAccessApiService,
  PeAffiliatesApiService,
  PeAffiliatesConnectionApiService,
  PeAffiliatesGridService,
  PeAffiliatesSidebarService,
  PeErrorsHandlerService,
} from './services';
import { SharedModule } from './shared/shared.module';

const angularModules = [
  ClipboardModule,
  CommonModule,
  FormsModule,
  MatDatepickerModule,
  MatIconModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  NgxsModule.forFeature([PeGridState, PreloaderState]),
  ReactiveFormsModule,
  TextMaskModule,
];

const peModules = [
  BaseModule,
  MediaModule.forRoot({}),
  PebRendererModule,
  PebShopEditorModule,
  PebViewerModule,
  PeDomainsModule,
];

const peServices = [
  CurrencyPipe,
  MediaUrlPipe,
  PeFoldersActionsService,
  PeFoldersApiService,
  PeOverlayWidgetService,
  PePreloaderService,
  TranslateService,
];

const affiliatesServices = [
  PeErrorsHandlerService,
  PeAffiliatesAccessApiService,
  PeAffiliatesApiService,
  PeAffiliatesConnectionApiService,
  PeAffiliatesGridService,
  PeAffiliatesProgramResolver,
  PeAffiliatesSidebarService,
  {
    provide: PeBuilderDashboardAccessApiService,
    useExisting: PeAffiliatesAccessApiService,
  },
];

@NgModule({
  declarations: [
    PeAffiliatesComponent,
    PeAffiliatesConnectComponent,
    PeAffiliatesProgramEditorComponent,
    PeAffiliatesNetworkEditorComponent,
    PeAffiliatesSettingsComponent,

    PeDatepickerComponent,

    PeAffiliatesBankAccountsEditorComponent,
  ],
  imports: [
    PeAffiliatesRoutingModule,
    SharedModule,

    ...angularModules,
    ...peModules,
  ],
  providers: [
    ...peServices,
    ...affiliatesServices,
  ],
})
export class PeAffiliatesModule { }
