import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { BusinessFormModule } from '@pe/business-form';
import { AppType } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { PeMessageModule } from '@pe/message';
import { NotificationModule } from '@pe/notifications';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { SearchDashboardModule } from '@pe/search-dashboard';
import { TranslateLoaderModule } from '@pe/translate-loader';

import { AddBusinessOverlayComponent } from './add-business-overlay/add-business-overlay.component';
import { HeaderComponent } from './header.component';
import { PeHeaderService } from './services/header.service';


export let HeaderInjector: Injector;

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    RouterModule,
    NotificationModule,
    BusinessFormModule,
    SearchDashboardModule,
    PeMessageModule.forFeature(AppType.MessageEmbed),
    I18nModule,
    TranslateLoaderModule,
  ],
  providers: [
    PeHeaderService,
  ],
  declarations: [
    HeaderComponent,
    AddBusinessOverlayComponent,
  ],
  exports: [HeaderComponent],
})
export class PeHeaderModule {
  constructor(private injector: Injector) {
    HeaderInjector = this.injector;
  }
}
