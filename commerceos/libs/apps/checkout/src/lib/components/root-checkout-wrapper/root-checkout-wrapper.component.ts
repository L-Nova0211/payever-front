import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CheckoutMicroService } from '@pe/common';

import { RootCheckoutWrapperService } from '../../services';

@Component({
  selector: 'root-checkout-wrapper',
  templateUrl: './root-checkout-wrapper.component.html',
  styleUrls: ['./root-checkout-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootCheckoutWrapperComponent {

  dialogStyle: any = null;

  isReady$ = this.wrapperService.isCustomElementReady$;
  isVisible$ = this.wrapperService.checkoutVisible$;

  readonly bootstrapScriptUrl$ = this.checkoutMicroService.microUrl$;

  constructor(
    public wrapperService: RootCheckoutWrapperService,
    private checkoutMicroService: CheckoutMicroService,
  ) {}
}
