import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { WelcomeStepEnum } from '../interfaces';

import { BaseCurrentCheckoutResolver } from './base-current-checkout.resolver';

@Injectable()
export class CurrentCheckoutResolver extends BaseCurrentCheckoutResolver {

  constructor(injector: Injector) {
    super(injector);
  }

  protected navigateToWelcomeScreen(route: ActivatedRouteSnapshot, businessUuid: string,
    checkoutId: string, step: WelcomeStepEnum): void {
    const page = step === WelcomeStepEnum.Payments ? '/payments' : step === WelcomeStepEnum.Details ? '/details' : '';
    this.router.navigate([`business/${businessUuid}/checkout/${checkoutId}/welcome${page}`], { replaceUrl: true });
  }

  protected navigateToCheckoutHome(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void {
    this.router.navigate([`business/${businessUuid}/checkout/${checkoutId}`], { replaceUrl: true });
  }

  protected navigateToSwitch(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void {
    this.router.navigate([`business/${businessUuid}/checkout/${checkoutId}`], { replaceUrl: true }); // TODO
  }

  protected navigateBasement(route: ActivatedRouteSnapshot, businessUuid: string): string {
    return `business/${businessUuid}/checkout`;
  }
}
