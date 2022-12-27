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
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';

import { FormModule, SnackBarModule as NgSnackBarModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';

import { ButtonModule } from '../../../ngkit-modules/button';
import { NavbarModule } from '../../../ngkit-modules/navbar';
import { OverlayBoxModule } from '../../../ngkit-modules/overlay-box';
import { SharedModule } from '../../../shared';
import { PaymentsSharedModule } from '../shared';

import {
  SantanderInvoiceDeAuthenticationComponent,
  SantanderInvoiceDeMainComponent,
} from './components';

export const SantanderInvoiceDeI18nModuleForChild = I18nModule.forChild();

@NgModule({
  declarations: [
    SantanderInvoiceDeAuthenticationComponent,
    SantanderInvoiceDeMainComponent,
  ],
  imports: [
    CommonModule,

    ClipboardModule,
    ButtonModule,
    SantanderInvoiceDeI18nModuleForChild,
    FormModule,
    FormsModule,
    OverlayBoxModule,
    ReactiveFormsModule,
    RouterModule,
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

    PaymentsSharedModule,
    SharedModule,
  ],
  providers: [
    FormBuilder,
  ],
})
export class SantanderInvoiceDeModule {}
