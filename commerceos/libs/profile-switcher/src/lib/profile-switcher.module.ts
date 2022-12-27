import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BaseModule } from '@pe/base';
import { BrowserModule } from '@pe/browser';
import { BusinessFormModule } from '@pe/business-form';
import { FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import {
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PeSearchAnimatedModule,
} from '@pe/ui';

import { ProfileSpinnerComponent } from './profile-spinner/profile-spinner.component';
import { ProfileSwitcherRoutingModule } from './profile-switcher-routing.module';
import { PeSwitcherComponent } from './switcher/switcher.component';

@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    BrowserModule,
    ProfileSwitcherRoutingModule,
    I18nModule.forChild(),
    BusinessFormModule,
    MatExpansionModule,
    FormModule,
    FormsModule,
    ScrollingModule,
    PebExpandablePanelModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PeSearchAnimatedModule,

  ],
  declarations: [ProfileSpinnerComponent, PeSwitcherComponent],
})
export class ProfileSwitcherModule {}
