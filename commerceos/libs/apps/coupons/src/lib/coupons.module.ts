import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxsModule } from '@ngxs/store';
import { TextMaskModule } from 'angular2-text-mask';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PePreloaderService, PreloaderState } from '@pe/common';
import { PeFolderEditorModule, PeFoldersActionsService, PeFoldersApiService, PeFoldersModule } from '@pe/folders';
import { PeGridModule, PeGridSidenavService, PeGridState } from '@pe/grid';
import { I18nModule, TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebDateTimePickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
  PebSelectModule,
  PeListModule,
  PeSearchModule,
  PeSubscriptModule,
} from '@pe/ui';

import {
  PeCouponEditorComponent,
  PeCouponsComponent,
  PeCouponsDatepickerComponent,
  PeCouponsGridComponent,
} from './components';
import { PeCouponsRoutingModule } from './coupons-routing.module';
import { CouponsResolver } from './resolver/coupons.resolver'
import {
  PeCouponsApiService,
  PeCouponsChannelService,
  PeCouponsEnvService,
  PeCouponsGridService,
} from './services';

const angularModules = [
  CommonModule,
  FormsModule,
  MatAutocompleteModule,
  MatDatepickerModule,
  MatDialogModule,
  MatIconModule,
  MatMomentDateModule,
  MatNativeDateModule,
  MatSelectModule,
  NgScrollbarModule,
  NgxsModule.forFeature([PeGridState, PreloaderState]),
  OverlayModule,
  ReactiveFormsModule,
  TextMaskModule,
]

const peModules = [
  I18nModule,
  PeGridModule,
  PeFolderEditorModule,
  PeFoldersModule,

  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebDateTimePickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
  PebSelectModule,
  PeListModule,
  PeSearchModule,
  PeSubscriptModule,

  PeCouponsRoutingModule,
];

const peServices = [
  PeFoldersActionsService,
  PeFoldersApiService,
  PeGridSidenavService,
  PeOverlayWidgetService,
  PePreloaderService,
  TranslateService,
];

const couponsServices = [
  PeCouponsApiService,
  PeCouponsChannelService,
  PeCouponsEnvService,
  PeCouponsGridService,
];

@NgModule({
  imports: [
    ...angularModules,
    ...peModules,
  ],
  exports: [PeCouponsComponent],
  declarations: [
    PeCouponEditorComponent,
    PeCouponsComponent,
    PeCouponsDatepickerComponent,
    PeCouponsGridComponent,
  ],
  bootstrap: [PeCouponsComponent],
  providers: [
    ...couponsServices,
    ...peServices,
    CouponsResolver,
  ],
})
export class PeCouponsModule { }
