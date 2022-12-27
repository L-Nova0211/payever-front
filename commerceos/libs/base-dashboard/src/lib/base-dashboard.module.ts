import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BrowserModule } from '@pe/browser';
import { TranslateLoaderModule } from '@pe/translate-loader';
import { WallpaperModule } from '@pe/wallpaper';

import { BaseDashboardComponent } from './base-dashboard/base-dashboard.component';
import { FixIOSScrollFreezingDirective } from './base-dashboard/fix-iosscroll.directive';
import { DashboardDataService } from './services/dashboard-data.service';

@NgModule({
  imports: [CommonModule, BrowserModule, WallpaperModule, TranslateLoaderModule],
  exports: [BaseDashboardComponent],
  declarations: [BaseDashboardComponent, FixIOSScrollFreezingDirective],
  providers: [DashboardDataService],
})
export class BaseDashboardModule {}
