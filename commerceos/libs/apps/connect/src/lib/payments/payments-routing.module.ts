import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PayexCreditcardModule } from './modules/payex_creditcard/payex_creditcard.module';
import { PayexFakturaModule } from './modules/payex_faktura/payex_faktura.module';
import { SantanderCcpInstallmentModule } from './modules/santander_ccp_installment/santander_ccp_installment.module';
import { SantanderInstallmentSeModule } from './modules/santander_installment_se/santander_installment_se.module';
import { SantanderPosInstallmentModule } from './modules/santander_pos_installment/santander_pos_installment.module';
import {
  SantanderPosInstallmentSeModule,
} from './modules/santander_pos_installment_se/santander_pos_installment_se.module';

// https://github.com/ng-packagr/ng-packagr/issues/1285#issuecomment-527196671
export function GetSantanderPosInstallmentModule() {
  return SantanderPosInstallmentModule;
}
export function GetSantanderCcpInstallmentModule() {
  return SantanderCcpInstallmentModule;
}
export function GetSantanderInstallmentSeModule() {
  return SantanderInstallmentSeModule;
}
export function GetSantanderPosInstallmentSeModule() {
  return SantanderPosInstallmentSeModule;
}
export function GetPayexCreditcardModule() {
  return PayexCreditcardModule;
}
export function GetPayexFakturaModule() {
  return PayexFakturaModule;
}

// paymill CC and direct debit are not used anymore

const routes: Routes = [
  {
    path: `santander_pos_installment`,
    loadChildren: GetSantanderPosInstallmentModule,
  },
  {
    path: `santander_ccp_installment`,
    loadChildren: GetSantanderCcpInstallmentModule,
  },
  {
    path: `santander_installment_se`,
    loadChildren: GetSantanderInstallmentSeModule,
  },
  {
    path: `santander_pos_installment_se`,
    loadChildren: GetSantanderPosInstallmentSeModule,
  },
  {
    path: `payex_creditcard`,
    loadChildren: GetPayexCreditcardModule,
  },
  {
    path: `payex_faktura`,
    loadChildren: GetPayexFakturaModule,
  },
];

export const PaymentsRouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [PaymentsRouterModuleForChild],
  exports: [RouterModule],
})
export class PaymentsRoutingModule {}
