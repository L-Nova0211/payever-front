import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { PebBlogEditorModule } from '@pe/builder-blog-editor';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-services';
import { PebViewerModule } from '@pe/builder-viewer';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFoldersModule } from '@pe/folders';
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

import { PebBlogRouteModule } from './blog.routing';
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
import { PeBlogMaterialModule } from './components/material/material.module';
import { PebBlogGuard } from './guards/blog.guard';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { PebBlogComponent } from './routes/_root/blog-root.component';
import { PebBlogDashboardComponent } from './routes/dashboard/blog-dashboard.component';
import { PebBlogSettingsComponent } from './routes/settings/blog-settings.component';
import { TokenInterceptor } from './services/token.interceptor';




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
    PebBlogRouteModule,
    PeBlogMaterialModule,
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
    PeDataGridModule,
    MatSlideToggleModule,
    OverlayWidgetModule,
    i18n,
    PebBlogEditorModule,
    HttpClientModule,
  ],
  declarations: [
    PebBlogComponent,
    PebBlogDashboardComponent,
    PebBlogSettingsComponent,
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
    PebBlogGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UploadInterceptorService,
      multi: true,
      deps: [
        BackgroundActivityService,
        PEB_EDITOR_API_PATH,
      ],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
})
export class PebBlogModule { }
