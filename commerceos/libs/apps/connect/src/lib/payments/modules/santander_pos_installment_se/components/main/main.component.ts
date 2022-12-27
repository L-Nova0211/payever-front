import { Component, Inject, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PaymentMethodEnum } from '../../../../../shared';
import { BaseMainComponent } from '../../../shared/components/base-main.component';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./../../../shared/components/payment-main-wrap/payment-main-wrap-parent.component.scss'],
})
export class SantanderPosInstallmentSeMainComponent extends BaseMainComponent {
  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_SE;

  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;

  constructor(
    protected injector: Injector,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    super(injector);
  }
}
