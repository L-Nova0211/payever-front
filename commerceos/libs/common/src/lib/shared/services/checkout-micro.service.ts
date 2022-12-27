import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '../../environment-config';

import { CheckoutSharedService } from './checkout-shared.service';
import { ECMAScriptSupportService } from './ecmascript-support.service';


@Injectable()
export class CheckoutMicroService {

  private microCheckoutVersionVar = 'MICRO_CHECKOUT_XXXXX';
  private version = 'MICRO_CHECKOUT_VERSION' === this.microCheckoutVersionVar.replace('XXXXX', 'VERSION') ?
    'latest' : 'MICRO_CHECKOUT_VERSION';

  microUrl$ = this.checkoutSharedService.locale$.pipe(
    map(locale => {
      const esVersion = this.ecmaScriptSupportService.isEs6Supported ? '2015' : '5';

      return `${this.env.frontend.checkoutWrapper}/wrapper/${locale}/${this.version}/micro-es${esVersion}.js`;
    }),
  );

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private ecmaScriptSupportService: ECMAScriptSupportService,
    private checkoutSharedService: CheckoutSharedService,
  ) {}
}
