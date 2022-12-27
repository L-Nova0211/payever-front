import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PaymentMethodEnum } from '../../../../../shared';
import { BasePaymentComponent } from '../base-payment.component';

@Component({
  selector: 'payment-external-authentication',
  templateUrl: './payment-external-authentication.component.html',
  styleUrls: ['./payment-external-authentication.component.scss'],
})
export class PaymentExternalAuthenticationComponent extends BasePaymentComponent implements OnInit {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() paymentIndex = 0;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);

  ngOnInit(): void {
    if (this.paymentsStateService.isExternalAuthSuccess(this.activatedRoute.snapshot.queryParams)) {
      this.isLoading$.next(true);
    }
  }

  onSubmit(): void {
  }
}
