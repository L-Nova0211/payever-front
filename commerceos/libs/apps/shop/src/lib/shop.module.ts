import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { SharedModule as ConnectAppSharedModule } from '@pe/apps/connect';
import { PebEditorApi, PebEditorWs } from '@pe/builder-api';
import { PebControlsService, PebPointerEventsService, PebResizeService, PebRadiusService, PebRadiusMoveService } from '@pe/builder-controls';
import { PebMoveService } from '@pe/builder-controls';
import { PebEditorState } from '@pe/builder-core';
import { PebClipboardActionModule, PebInsertActionModule } from '@pe/builder-main-editor';
import { PebRTree } from '@pe/builder-renderer';
import { PebEditorStore, PebEditorThemeService, SnackbarErrorService } from '@pe/builder-services';
import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PebViewerModule } from '@pe/builder-viewer';
import { PE_ENV } from '@pe/common';
import { PeFoldersModule } from '@pe/folders';
import { ThirdPartyFormModule } from '@pe/forms';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSocialSharingImageModule,
} from '@pe/ui';

import {
  PeSettingsConnectExistingComponent,
  PeSettingsCreateAppComponent,
  PeSettingsCustomerPrivacyComponent,
  PeSettingsFacebookPixelComponent,
  PeSettingsGoogleAnalyticsComponent,
  PeSettingsPasswordProtectionComponent,
  PeSettingsPayeverDomainComponent,
  PeSettingsPersonalDomainComponent,
  PeSettingsSocialImageComponent,
  PeSettingsSpamProtectionComponent,
} from './components';
import { PeShopMaterialComponent } from './components/material/material.component';
import { PeQrPrintModule } from './components/qr-print/qr-print.module';
import { PebShopGuard } from './guards/shop.guard';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { PebShopComponent } from './routes/_root/shop-root.component';
import { PebShopDashboardComponent } from './routes/dashboard/shop-dashboard.component';
import { PebShopSettingsComponent } from './routes/settings/shop-settings.component';
import { PebShopRouteModule } from './shop.routing';

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const pebViewerModuleForRoot = PebViewerModule.withConfig({});
export const i18n = I18nModule.forRoot();


@NgModule({
  imports: [
    ClipboardModule,
    PebSocialSharingImageModule,
    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebFormFieldTextareaModule,
    PebMessagesModule,
    PebButtonModule,
    PebLogoPickerModule,
    PebShopRouteModule,
    OverlayWidgetModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,

    pebViewerModuleForRoot,
    NgScrollbarModule,
    MatFormFieldModule,
    MatInputModule,
    PeGridModule,
    PeFoldersModule,
    MatSlideToggleModule,
    OverlayWidgetModule,
    PebShopEditorModule,
    i18n,
    PeQrPrintModule,
    ThirdPartyFormModule,
    ConnectAppSharedModule,
    PebClipboardActionModule.forChild(),
    PebInsertActionModule.forChild(),
  ],
  declarations: [
    PeShopMaterialComponent,
    PebShopComponent,
    PebShopDashboardComponent,
    PebShopSettingsComponent,
    PeSettingsPayeverDomainComponent,
    PeSettingsConnectExistingComponent,
    PeSettingsCreateAppComponent,
    PeSettingsCustomerPrivacyComponent,
    PeSettingsFacebookPixelComponent,
    PeSettingsGoogleAnalyticsComponent,
    PeSettingsPasswordProtectionComponent,
    PeSettingsPersonalDomainComponent,
    PeSettingsSocialImageComponent,
    PeSettingsSpamProtectionComponent,
    AbbreviationPipe,
  ],
  providers: [
    PebControlsService,
    PebRadiusService,
    PebRadiusMoveService,
    PebEditorStore,
    PebMoveService,
    PebPointerEventsService,
    PebResizeService,
    PebShopGuard,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 250 },
    },
    {
      provide: PebRTree,
      useClass: PebRTree,
      deps: [PebEditorState],
    },
    {
      provide: PebEditorThemeService,
      useClass: PebEditorThemeService,
      deps: [
        PebEditorApi,
        SnackbarErrorService,
        PebEditorWs,
        PE_ENV,
      ],
    },
  ],
})
export class PebShopModule { }
