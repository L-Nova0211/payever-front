import { CommonModule, CurrencyPipe } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { WebcamModule } from 'ngx-webcam';

import { CheckoutWrapperElementsModule } from '@pe/checkout-wrapper-main';
import { WrapperAndPaymentsApiModule } from '@pe/checkout-wrapper-sdk-api';
import {
  CheckoutMicroService,
  CheckoutSharedService,
  ECMAScriptSupportService,
  MicroModule,
} from '@pe/common';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { SecondFactorCodeModule } from '@pe/second-factor-code';
import {
  PeAuthCodeModule,
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebDateTimePickerModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
} from '@pe/ui';


import { ApiService } from '../services/api.service';
import { SettingsService } from '../services/settings.service';
import { SharedModule } from '../shared/shared.module';
import { TokenInterceptor } from '../token.interceptor';

import {
  ActionCancelTransactionComponent,
  ActionSubmitComponent,
  ActionRefundTransactionComponent,
  RefundProductPickerComponent,
  RefundProductPickerStylesComponent,
  ActionShippingGoodsComponent,
  AmountComponent,
  ShippingVerifyComponent,
  ShippingOptionsComponent,
  ReturnOptionsComponent,
  ActionDownloadSlipComponent,
  ActionEditComponent,
  EditActionStylesComponent,
  ActionChangeAmountComponent,
  ActionChangeReferenceComponent,
  ActionCaptureComponent,
  ActionAuthorizeComponent,
  ActionCreditAnswerComponent,
  ActionPaidComponent,
  ActionVerifyComponent,
  ActionVerifyByIdComponent,
  ActionVerifySimpleComponent,
  ActionVerifyDigitCodeComponent,
  ActionVoidComponent,
  ActionUploadComponent,
  ActionChangeDeliveryComponent,
  ImageCaptureComponent,
  ActionVerifyFieldsComponent,
  ActionsListComponent,
  MoreActionsComponent,
} from './components/actions';
import {
  ActionableTextSectionComponent,
  GeneralSectionComponent,
  OrderSectionComponent,
  ShippingSectionComponent,
  BillingSectionComponent,
  PaymentSectionComponent,
  SellerSectionComponent,
  TimelineSectionComponent,
  DetailsSectionComponent,
  ProductsSectionComponent,
 } from './components/sections';
import { ActionsListContainerComponent, TransactionsDetailsComponent } from './containers';
import { ActionContainerComponent } from './containers/action/action.component';
import { TransactionsDetailsRoutingModule } from './details-routing.module';
import {
  ActionsListService,
  DetailService,
  SectionsService,
} from './services';


const maskConfig: Partial<IConfig> = {
  validation: false,
};


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormModule,
    TransactionsDetailsRoutingModule,
    MatExpansionModule,
    MatButtonModule,
    MatSelectModule,
    MatMenuModule,
    SharedModule,
    WebcamModule,
    CheckoutWrapperElementsModule,
    I18nModule,
    WrapperAndPaymentsApiModule,
    SecondFactorCodeModule,
    PebFormFieldInputModule,
    PebButtonToggleModule,
    PebButtonModule,
    MatAutocompleteModule,
    MicroModule,
    PebDateTimePickerModule,
    PebFormBackgroundModule,
    PebCheckboxModule,
    PebMessagesModule,
    PeAuthCodeModule,
    NgxMaskModule.forRoot(maskConfig),
    ConfirmationScreenModule,
  ],
  declarations: [
    TransactionsDetailsComponent,
    GeneralSectionComponent,
    OrderSectionComponent,
    ShippingSectionComponent,
    BillingSectionComponent,
    PaymentSectionComponent,
    SellerSectionComponent,
    TimelineSectionComponent,
    DetailsSectionComponent,
    ProductsSectionComponent,
    ActionCancelTransactionComponent,
    ActionSubmitComponent,
    ActionsListComponent,
    ActionRefundTransactionComponent,
    RefundProductPickerComponent,
    RefundProductPickerStylesComponent,
    ActionShippingGoodsComponent,
    AmountComponent,
    ShippingVerifyComponent,
    ReturnOptionsComponent,
    ShippingOptionsComponent,
    ActionDownloadSlipComponent,
    ActionEditComponent,
    EditActionStylesComponent,
    MoreActionsComponent,
    ActionChangeAmountComponent,
    ActionChangeReferenceComponent,
    ActionCaptureComponent,
    ActionAuthorizeComponent,
    ActionCreditAnswerComponent,
    ActionPaidComponent,
    ActionVerifyComponent,
    ActionVerifyByIdComponent,
    ActionVerifySimpleComponent,
    ActionVerifyDigitCodeComponent,
    ActionVoidComponent,
    ActionUploadComponent,
    ActionChangeDeliveryComponent,
    ImageCaptureComponent,
    ActionVerifyFieldsComponent,
    ActionsListContainerComponent,
    ActionContainerComponent,
    ActionableTextSectionComponent,
  ],
  providers: [
    ApiService,
    SettingsService,
    SectionsService,
    DetailService,
    CurrencyPipe,
    ECMAScriptSupportService,
    CheckoutMicroService,
    CheckoutSharedService,
    ActionsListService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
})

export class TransactionsDetailsModule {

}
