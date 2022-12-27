import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { SharedModule as ConnectAppSharedModule } from '@pe/apps/connect';
import { PebEditorApi, PebEditorWs } from '@pe/builder-api';
import { PebEditorState } from '@pe/builder-core';
import { PebClipboardActionModule, PebInsertActionModule } from '@pe/builder-main-editor';
import { PebRTree } from '@pe/builder-renderer';
import { PebEditorStore, PebEditorThemeService, SnackbarErrorService } from '@pe/builder-services';
import { PebViewerModule } from '@pe/builder-viewer';
import { PE_ENV } from '@pe/common';
import { PeFoldersModule } from '@pe/folders';
import { ThirdPartyFormModule } from '@pe/forms';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
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
import { PeSiteBuilderEditComponent } from './components/builder-edit/builder-edit.component';
import { PebSiteBuilderInsertComponent } from './components/builder-insert/builder-insert.component';
import { PeSiteMaterialModule } from './components/material/material.module';
import { PeQrPrintModule } from './components/qr-print/qr-print.module';
import { PebSiteGuard } from './guards/site.guard';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { PebSiteComponent } from './routes/_root/site.component';
import { PebSiteDashboardComponent } from './routes/dashboard/site-dashboard.component';
import { PebSiteSettingsComponent } from './routes/settings/site-settings.component';
import { PebSiteRouteModule } from './site.routing';

import { PebControlsService, PebMoveService, PebPointerEventsService, PebRadiusMoveService, PebRadiusService, PebResizeService } from '@pe/builder-controls';

export const PebViewerModuleForRoot = PebViewerModule.withConfig({});
export const i18n = I18nModule.forRoot();

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PebButtonToggleModule,
    PebFormBackgroundModule,
    MatInputModule,
    PebFormFieldInputModule,
    PebExpandablePanelModule,
    PebMessagesModule,
    PebLogoPickerModule,
    MatFormFieldModule,
    MatIconModule,
    PebSocialSharingImageModule,
    PebFormFieldTextareaModule,
    PebButtonModule,
    OverlayWidgetModule,
    PebSiteRouteModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    NgScrollbarModule,
    ClipboardModule,
    PeSiteMaterialModule,
    PeGridModule,
    PeFoldersModule,
    MatSnackBarModule,
    PebViewerModuleForRoot,
    i18n,
    PeQrPrintModule,
    ThirdPartyFormModule,
    ConnectAppSharedModule,
    PebClipboardActionModule.forChild(),
    PebInsertActionModule.forChild(),
  ],
  providers: [
    PebRadiusMoveService,
    PebSiteGuard,
    SnackbarService,
    PebEditorStore,
    PebControlsService,
    PebRadiusService,
    PebPointerEventsService,
    PebResizeService,
    PebMoveService,
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
  declarations: [
    AbbreviationPipe,
    PeSettingsFacebookPixelComponent,
    PeSettingsGoogleAnalyticsComponent,
    PebSiteComponent,
    PebSiteSettingsComponent,
    PebSiteDashboardComponent,
    PeSettingsPayeverDomainComponent,
    PeSettingsConnectExistingComponent,
    PeSettingsCreateAppComponent,
    PeSettingsCustomerPrivacyComponent,
    PeSettingsPasswordProtectionComponent,
    PeSettingsPersonalDomainComponent,
    PeSettingsSocialImageComponent,
    PeSettingsSpamProtectionComponent,
    PebSiteBuilderInsertComponent,
    PeSiteBuilderEditComponent,
  ],
})
export class PebSiteModule {}
