import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthModule } from '@pe/auth';
import { BaseModule } from '@pe/base';
import { BrowserModule } from '@pe/browser';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';


import { SearchOverlayComponent } from './components/search-overlay/search-overlay.component';
import { SearchBoxService } from './services/search-box.service';
import { SearchOverlayService } from './services/search-overlay.service';
(window as any)?.PayeverStatic?.IconLoader?.loadIcons([
  'apps',
  'payment-plugins',
  'transactions',
  'dashboard',
  'notification',
  'shipping',
  'social',
]);

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MediaModule,
    OverlayModule,
    I18nModule.forChild(),
    AuthModule,
    BrowserModule,
    FormsModule,
    BaseModule,
  ],
  declarations: [
    SearchOverlayComponent,
  ],
  providers: [SearchBoxService,SearchOverlayService],
})
export class SearchDashboardModule {}
