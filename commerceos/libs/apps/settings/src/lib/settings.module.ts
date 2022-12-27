import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HammerModule } from '@angular/platform-browser';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { AuthModule } from '@pe/auth';
import { EnvService, PE_ENV } from '@pe/common';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule, PE_TRANSLATION_API_URL } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { OverlayWidgetModule, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebListInfoModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSelectModule,
  PebSocialSharingImageModule,
  PeInputPickerModule,
  PePickerModule,
  PeUploaderModule,
} from '@pe/ui';

import { ComponentModule } from './components';
import { WelcomeDialogComponent } from './components/dialogs/welcome-dialog/welcome-dialog.component';
import { PebBusinessGuard, SettingsAccessGuard } from './guards';
import { COS_ENV } from './misc/constants';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { LoadingResolver } from './resolvers';
import { PebSettingsComponent } from './routes/_root/settings-root.component';
import { AppearanceModule } from './routes/appearance/appearance.module';
import { BillingComponent } from './routes/billing/billing.component';
import { BusinessDetailComponent } from './routes/business-detail/business-detail.component';
import { BusinessInfoComponent } from './routes/business-info/business-info.component';
import { GeneralComponent } from './routes/general/general.component';
import { PoliciesComponent } from './routes/policies/policies.component';
import {
  ApiService,
  BackRoutingService,
  BusinessEnvService,
  EnvironmentConfigService,
  PlatformService,
  FormTranslationsService,
  BackgroundService,
  SettingsSidebarService,
  CoreConfigService,
} from './services';
import { InfoBoxService } from './services/info-box.service';
import { TokenInterceptor } from './services/interceptor';
import { SettingsAppComponent } from './settings-app.component';
import { SettingsRoutingModule } from './settings-routing.module';

export const auth = AuthModule.forRoot();
export const media = MediaModule.forRoot();
export const i18n = I18nModule.forRoot();
export const ngxWebStorage = NgxWebstorageModule.forRoot();

// @dynamic
@NgModule({
  declarations: [
    SettingsAppComponent,
    PebSettingsComponent,
    PoliciesComponent,
    BusinessInfoComponent,
    BusinessDetailComponent,
    GeneralComponent,
    WelcomeDialogComponent,
    BillingComponent,
  ],
  imports: [
    auth,
    SettingsRoutingModule,
    i18n,
    PePlatformHeaderModule,
    ngxWebStorage,
    HammerModule,
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
    OverlayWidgetModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    NgScrollbarModule,
    MatFormFieldModule,
    MatMenuModule,
    PeGridModule,
    PeFoldersModule,
    MatSlideToggleModule,
    PebListInfoModule,
    PebSelectModule,
    PePickerModule,
    AppearanceModule,
    MatGoogleMapsAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    ComponentModule,
    HttpClientModule,
    MatExpansionModule,
    MatListModule,
    media,
    PeInputPickerModule,
    MatSnackBarModule,
    ConfirmationScreenModule,
    PeUploaderModule,
  ],
  providers: [
    SnackbarService,
    SettingsSidebarService,
    BusinessEnvService,
    InfoBoxService,
    BackRoutingService,
    FormTranslationsService,
    AbbreviationPipe,
    PebBusinessGuard,
    SettingsAccessGuard,
    LoadingResolver,
    PeOverlayWidgetService,
    CoreConfigService,
    BackgroundService,
    ApiService,
    {
      provide: EnvService,
      useExisting: BusinessEnvService,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: PE_TRANSLATION_API_URL,
      deps: [COS_ENV],
      useFactory: env => env.custom.translation,
    },
    {
      provide: EnvironmentConfigService,
      deps: [PE_ENV],
      useFactory (env) {
        const service = new EnvironmentConfigService();
        service.addConfig(env);

        return service;
      },
    },
    PlatformService,
  ],
})
export class SettingsModule {
  constructor(
    backRouting: BackRoutingService,
  ) {
    backRouting.handle();
  }
}
