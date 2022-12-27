import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { WelcomeStepEnum } from '../interfaces';

import { BaseCurrentCheckoutResolver } from './base-current-checkout.resolver';

@Injectable()
export class CurrentCheckoutModalResolver extends BaseCurrentCheckoutResolver {

  constructor(injector: Injector) {
    super(injector);
  }

  protected navigateToWelcomeScreen(route: ActivatedRouteSnapshot,
    businessUuid: string, checkoutId: string, step: WelcomeStepEnum): void {
    // TODO Not sure that it's correct
    const page = step === WelcomeStepEnum.Payments ? '/payments' : step === WelcomeStepEnum.Details ? '/details' : '';
    this.router.navigate([`business/${businessUuid}/checkout/${checkoutId}/welcome${page}`], { replaceUrl: true });
  }

  protected navigateToCheckoutHome(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void {
    const routeName: string = route.data['routeName'] || 'view';

    this.router.navigate([`${this.navigateBasement(route, businessUuid)}/${checkoutId}/${routeName}`],
    { replaceUrl: true });
  }

  protected navigateToSwitch(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void {
    this.router.navigate([`${this.navigateBasement(route, businessUuid)}/switch`], { replaceUrl: true });
  }

  protected navigateBasement(route: ActivatedRouteSnapshot, businessUuid: string): string {
    const app: string = route.params['app'];
    const appId: string = route.params['appId'];
    const channelSetId: string = route.params['channelSetId'];

    return `business/${businessUuid}/checkout/modal/${app}/${appId}/${channelSetId}`;
  }
}
