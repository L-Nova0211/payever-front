import { Component, Injector, Input, ViewEncapsulation } from '@angular/core';

import { MediaUrlPipe } from '@pe/media';

import { PaymentMethodEnum } from '../../../../../shared';
import { BasePaymentDocumentsComponent } from '../base-payment-documents.component';

@Component({
  selector: 'payment-documents',
  templateUrl: './payment-documents.component.html',
  styleUrls: ['./payment-documents.component.scss'],
  providers: [ MediaUrlPipe ],
  encapsulation: ViewEncapsulation.None,
})
export class PaymentDocumentsComponent extends BasePaymentDocumentsComponent {

  @Input() paymentMethod: PaymentMethodEnum;

  constructor(
    public injector: Injector
  ) {
    super(injector);
  }
}
