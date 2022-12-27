import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxsModule } from '@ngxs/store';

import { BaseModule } from '@pe/base';
import { PebRendererModule } from '@pe/builder-renderer';
import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PebViewerModule } from '@pe/builder-viewer';
import { PePreloaderService, PreloaderState } from '@pe/common';
import { PeBuilderDashboardAccessApiService } from '@pe/dashboard';
import { PeDomainsModule } from '@pe/domains';
import { PeFoldersActionsService, PeFoldersApiService, PeFoldersModule } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { I18nModule, TranslateService } from '@pe/i18n';
import { MediaModule, MediaUrlPipe, PeMediaService } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  PebButtonModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebLogoPickerModule,
  PeListModule,
} from '@pe/ui';

import {
  PeSubscriptionsConnectComponent,
  PeSubscriptionsNetworkEditorComponent,
  PeSubscriptionsSettingsComponent,
} from './components';
import { PeSubscriptionsPlanResolver } from './resolvers';
import {
  PeErrorsHandlerService,
  PeSubscriptionsAccessApiService,
  PeSubscriptionsApiService,
  PeSubscriptionsConnectionApiService,
  PeSubscriptionsGridService,
  PeSubscriptionsSidebarService,
} from './services';
import { PeSubscriptionsRoutingModule } from './subscriptions-routing.module';
import { PeSubscriptionsComponent } from './subscriptions.component';

const angularModules = [
  ClipboardModule,
  CommonModule,
  FormsModule,
  MatIconModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  NgxsModule.forFeature([PeGridState, PreloaderState]),
  ReactiveFormsModule,
];

const peModules = [
  BaseModule,
  I18nModule,
  MediaModule.forRoot({}),
  PebRendererModule,
  PebShopEditorModule,
  PebViewerModule,
  PebButtonModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebLogoPickerModule,
  PeDomainsModule,
  PeFoldersModule,
  PeGridModule,
  PeListModule,
];

const peServices = [
  CurrencyPipe,
  MediaUrlPipe,
  PeFoldersActionsService,
  PeFoldersApiService,
  PeMediaService,
  PeOverlayWidgetService,
  PePreloaderService,
  TranslateService,
];

const subscriptionsServices = [
  PeErrorsHandlerService,
  PeSubscriptionsAccessApiService,
  PeSubscriptionsApiService,
  PeSubscriptionsConnectionApiService,
  PeSubscriptionsGridService,
  PeSubscriptionsPlanResolver,
  PeSubscriptionsSidebarService,
  {
    provide: PeBuilderDashboardAccessApiService,
    useExisting: PeSubscriptionsAccessApiService,
  },
];

@NgModule({
  declarations: [
    PeSubscriptionsComponent,
    PeSubscriptionsConnectComponent,
    PeSubscriptionsNetworkEditorComponent,
    PeSubscriptionsSettingsComponent,
  ],
  imports: [
    PeSubscriptionsRoutingModule,

    ...angularModules,
    ...peModules,
  ],
  providers: [
    ...peServices,
    ...subscriptionsServices,
  ],
})
export class PeSubscriptionsModule { }
