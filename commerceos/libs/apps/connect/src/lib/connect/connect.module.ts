import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { InViewportModule } from 'ng-in-viewport';
import { ClipboardModule } from 'ngx-clipboard';
import { EllipsisModule } from 'ngx-ellipsis';
import { SwiperModule } from 'ngx-swiper-wrapper';

import { AuthModule } from '@pe/auth';
import { MicroModule, PePreloaderService, PreloaderState } from '@pe/common';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeFoldersModule } from '@pe/folders';
import { AddressModule, FormModule, ThirdPartyFormModule } from '@pe/forms';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { OverlayWidgetModule, PeOverlayWidgetService, PE_OVERLAY_COMPONENT, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeSidebarModule } from '@pe/sidebar';
import { SnackbarModule } from '@pe/snackbar';

import { CommunicationsModule } from '../communications';
import { ButtonModule, NavbarModule, OverlayBoxModule } from '../ngkit-modules';
import { ThirdPartyGeneratorModule } from '../ngkit-modules';
import { PaymentsModule } from '../payments';
import { SharedModule } from '../shared';
import { ShopsystemsModule } from '../shopsystems';

import {
  MainLayoutComponent,
  ListLayoutComponent,
  ListCommonComponent,
  BackToMicroComponent,
  ConfigureThirdPartyComponent,
  ConfigureQrComponent,
  ConfigureDevicePaymentsComponent,
  InstallIntegrationComponent,
  IntegrationActionMenuComponent,
  IntegrationButtonComponent,
  IntegrationInstalledComponent,
  ListSpecificComponent,
  SmallCloseIconComponent,
  IntegrationFullPageComponent,
  IntegrationWriteReviewComponent,
  IntegrationAllReviewsComponent,
  IntegrationVersionHistoryComponent,
  IntegrationTitleComponent,
  IntegrationNewsComponent,
  IntegrationInformationComponent,
  IntegrationSupportedComponent,
  IntegrationMoreComponent,
  IntegrationRatingStarsComponent,
  IntegrationRatingsReviewsComponent,
  IntegrationRatingLinesComponent,
} from './components';
import { ClosePopupTpmComponent } from './components/close-popup-tpm/close-popup-tpm.component';
import { IntegrationAppComponent } from './components/integration-app/integration-app.component';
import { ConnectRoutingModule } from './connect-routing.module';
import { IntegrationRedirectGuard } from './guards';

export const ConnectI18nModuleForChild = I18nModule.forChild();
export const NgxsFeatureModule = NgxsModule.forFeature([PreloaderState]);

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    EllipsisModule,
    PeDataGridModule,
    AuthModule,
    AddressModule,
    ConnectI18nModuleForChild,
    NgxsFeatureModule,
    FormModule,
    FormsModule,
    OverlayBoxModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    ThirdPartyGeneratorModule,
    ThirdPartyFormModule,
    ButtonModule,
    MediaModule,
    MicroModule,
    NavbarModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatMenuModule,
    SharedModule,
    SwiperModule,
    MatDialogModule,
    InViewportModule,
    PeSidebarModule,
    PeFiltersModule,
    OverlayWidgetModule,
    SnackbarModule,
    PeGridModule,
    PeFoldersModule,

    PaymentsModule,
    ShopsystemsModule,
    CommunicationsModule,

    ConnectRoutingModule,
  ],
  declarations: [
    MainLayoutComponent,
    ListLayoutComponent,
    ListCommonComponent,
    BackToMicroComponent,
    ConfigureThirdPartyComponent,
    ConfigureQrComponent,
    ConfigureDevicePaymentsComponent,
    InstallIntegrationComponent,
    IntegrationButtonComponent,
    IntegrationInstalledComponent,
    ListSpecificComponent,
    SmallCloseIconComponent,
    IntegrationActionMenuComponent,
    IntegrationFullPageComponent,
    IntegrationTitleComponent,
    IntegrationAppComponent,
    IntegrationRatingStarsComponent,
    IntegrationNewsComponent,
    IntegrationInformationComponent,
    IntegrationSupportedComponent,
    IntegrationMoreComponent,
    IntegrationRatingsReviewsComponent,
    IntegrationRatingLinesComponent,
    IntegrationWriteReviewComponent,
    IntegrationAllReviewsComponent,
    IntegrationVersionHistoryComponent,
    ClosePopupTpmComponent,
  ],
  providers: [
    FormBuilder,
    IntegrationRedirectGuard,
    PeOverlayWidgetService,
    PePreloaderService,
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: PE_OVERLAY_COMPONENT,
      useClass: ConfigureThirdPartyComponent,
    },
  ],
  exports: [
    ConfigureThirdPartyComponent,
  ],
})
export class ConnectModule {}
