import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ActionAuthorizeComponent } from './components/actions/authorize/authorize.component';
import { ActionCancelTransactionComponent } from './components/actions/cancel/cancel.component';
import { ActionCaptureComponent } from './components/actions/capture/capture.component';
import { ActionChangeAmountComponent } from './components/actions/change-amount/change-amount.component';
import { ActionChangeDeliveryComponent } from './components/actions/change-delivery/change-delivery.component';
import { ActionChangeReferenceComponent } from './components/actions/change-reference/change-reference.component';
import { ActionCreditAnswerComponent } from './components/actions/credit-answer/credit-answer.component';
import { ActionDownloadSlipComponent } from './components/actions/download-slip/download-slip.component';
import { ActionEditComponent } from './components/actions/edit/edit.component';
import { ActionPaidComponent } from './components/actions/paid/paid.component';
import { ActionRefundTransactionComponent } from './components/actions/refund/refund.component';
import { ActionShippingGoodsComponent } from './components/actions/shipping-goods/shipping-goods.component';
import { ActionUploadComponent } from './components/actions/upload/upload.component';
import { ActionVerifyComponent } from './components/actions/verify/verify.component';
import { ActionVoidComponent } from './components/actions/void/void.component';
import { TransactionsDetailsComponent } from './containers';

const routes: Routes = [
  {
    path: '',
    component: TransactionsDetailsComponent,
    children: [
      {
        path: 'authorize/:uuid',
        component: ActionAuthorizeComponent,
        outlet: 'actions',
      },
      {
        path: 'cancel/:uuid',
        component: ActionCancelTransactionComponent,
        outlet: 'actions',
      },
      {
        path: 'credit_response/:uuid',
        component: ActionCreditAnswerComponent,
        outlet: 'actions',
      },
      {
        path: 'refund/:uuid',
        component: ActionRefundTransactionComponent,
        outlet: 'actions',
      },
      {
        path: 'shipping_goods/:uuid',
        component: ActionShippingGoodsComponent,
        outlet: 'actions',
      },
      {
        path: 'download_shipping_slip/:uuid',
        component: ActionDownloadSlipComponent,
        outlet: 'actions',
      },
      {
        path: 'change_amount/:uuid',
        component: ActionChangeAmountComponent,
        outlet: 'actions',
      },
      {
        path: 'edit_reference/:uuid',
        component: ActionChangeReferenceComponent,
        outlet: 'actions',
      },
      {
        path: 'edit_delivery/:uuid',
        component: ActionChangeDeliveryComponent,
        outlet: 'actions',
      },
      {
        path: 'capture/:uuid',
        component: ActionCaptureComponent,
        outlet: 'actions',
      },
      {
        path: 'edit/:uuid',
        component: ActionEditComponent,
        outlet: 'actions',
      },
      {
        path: 'paid/:uuid',
        component: ActionPaidComponent,
        outlet: 'actions',
      },
      {
        path: 'verify/:uuid',
        component: ActionVerifyComponent,
        outlet: 'actions',
      },
      {
        path: 'upload/:uuid',
        component: ActionUploadComponent,
        outlet: 'actions',
      },
      {
        path: 'void/:uuid',
        component: ActionVoidComponent,
        outlet: 'actions',
      },
    ],
  },
];

export const RouterWithChild: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterWithChild],
  exports: [RouterModule],
})
export class TransactionsDetailsRoutingModule {}
