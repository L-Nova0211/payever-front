import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { I18nModule } from '@pe/i18n';

import { DropdownComponent } from './dropdown/dropdown.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationComponent } from './notification/notification.component';
import { authTokenFactory, PE_AUTH_TOKEN } from './token';


@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    RouterModule,
    MatIconModule,
    ScrollingModule,
    PortalModule,
    OverlayModule,
  ],
  declarations: [
    NotificationComponent,
    NotificationListComponent,
    DropdownComponent,
  ],
  exports: [
    NotificationComponent,
    NotificationListComponent,
    DropdownComponent,
  ],
  providers: [
    {
      // TODO: remove after Auth will be implemented and use `@ngxs/store` instead
      provide: PE_AUTH_TOKEN,
      deps: [PeAuthService],
      useFactory: authTokenFactory,
    },
  ],
})
export class NotificationModule {
}
