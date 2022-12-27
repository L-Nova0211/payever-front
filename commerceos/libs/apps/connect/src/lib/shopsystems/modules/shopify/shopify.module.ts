import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MomentModule } from 'angular2-moment';
import { ClipboardModule } from 'ngx-clipboard';

import { FormModule, SnackBarModule as NgSnackBarModule, ThirdPartyFormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';

import { ThirdPartyGeneratorModule } from '../../../ngkit-modules';
import { ButtonModule } from '../../../ngkit-modules/button';
import { NavbarModule } from '../../../ngkit-modules/navbar';
import { OverlayBoxModule } from '../../../ngkit-modules/overlay-box';
import { SharedModule as BaseSharedModule } from '../../../shared';
import { ShopsystemsSharedModule } from '../shared';

import {
  ShopifyMainComponent,
} from './components';

export const ShopifyI18nModuleForChild = I18nModule.forChild();

@NgModule({
  declarations: [
    ShopifyMainComponent,
  ],
  imports: [
    CommonModule,

    ClipboardModule,
    ButtonModule,
    ShopifyI18nModuleForChild,
    MomentModule,
    FormModule,
    FormsModule,
    OverlayBoxModule,
    ReactiveFormsModule,
    HttpClientModule,

    NavbarModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    NgSnackBarModule,
    ThirdPartyGeneratorModule,
    ThirdPartyFormModule,

    BaseSharedModule,
    ShopsystemsSharedModule,
  ],
  providers: [
    FormBuilder,
  ],
  exports: [
    ShopifyMainComponent,
  ],
})
export class ShopifyModule {}
