import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
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

import { AuthModule } from '@pe/auth';
import { FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { SnackbarModule } from '@pe/snackbar';

import { ButtonModule } from '../ngkit-modules/button';
import { NavbarModule } from '../ngkit-modules/navbar';
import { OverlayBoxModule } from '../ngkit-modules/overlay-box';
import { SharedModule } from '../shared/shared.module';

import { CashModule } from './modules/cash';
import { PayexCreditcardModule } from './modules/payex_creditcard';
import { PayexFakturaModule } from './modules/payex_faktura';
import { SantanderCcpInstallmentModule } from './modules/santander_ccp_installment';
import { SantanderInstallmentSeModule } from './modules/santander_installment_se';
import { SantanderPosInstallmentModule } from './modules/santander_pos_installment';
import { SantanderPosInstallmentSeModule } from './modules/santander_pos_installment_se';

export const PaymentsI18nModuleForChild = I18nModule.forChild();

const modalsModules = [
  SantanderPosInstallmentModule,
  SantanderCcpInstallmentModule,
  SantanderInstallmentSeModule,
  SantanderPosInstallmentSeModule,
  PayexCreditcardModule,
  PayexFakturaModule,
  CashModule,
];

@NgModule({
  imports: [
    CommonModule,

    AuthModule,
    ClipboardModule,
    PaymentsI18nModuleForChild,
    FormModule,
    FormsModule,
    SnackbarModule,
    ButtonModule,
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

    SharedModule,

    ...modalsModules,
  ],
  providers: [
    FormBuilder,
  ],
  exports: [
    ...modalsModules,
  ],
})
export class PaymentsModule {
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
    };
  }
}
