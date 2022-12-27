import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { PeBusinessSwitcherComponent } from './components/business-switcher/business-switcher.component';
import { PeMainMenuComponent } from './components/main-menu/main-menu.component';
import { PeMessagesComponent } from './components/messages/messages.component';
import { PeNotificationsComponent } from './components/notifications/notifications.component';
import { PeSearchComponent } from './components/search/search.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { PeUserAvatarComponent } from './components/user-avatar/user-avatar.component';
import { PeAppPlatformHeaderComponent } from './root/app-platform-header/app-platform-header.component';
import { PeDashboardPlatformHeaderComponent } from './root/dashboard-platform-header/dashboard-platform-header.component';
import { PePlatformHeaderComponent } from './root/platform-header.component';

const components = [
  PeUserAvatarComponent,
  PeSearchComponent,
  PeNotificationsComponent,
  PeMainMenuComponent,
  PeBusinessSwitcherComponent,
  PeMessagesComponent,
];

@NgModule({
  imports: [CommonModule, RouterModule, MatMenuModule, MatIconModule, MatProgressSpinnerModule],
  declarations: [
    PeAppPlatformHeaderComponent,
    PeDashboardPlatformHeaderComponent,
    PePlatformHeaderComponent,
    ...components,
    SkeletonComponent,
  ],
  exports: [PeAppPlatformHeaderComponent, PeDashboardPlatformHeaderComponent, PePlatformHeaderComponent, ...components],
})
export class PePlatformHeaderModule {}
