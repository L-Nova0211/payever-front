import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable() // TODO Reseach can we remove?
export class PlatformHeaderLoaderGuard { // extends BasePlatformHeaderLoaderGuard {

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    return true;
  }
/*
  app: AppType;

  constructor(injector: Injector) {
    super(injector);
  }

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<boolean> {
    this.app = this.getHeaderAppName(activatedRouteSnapshot) as AppType;
    return super.canActivate(activatedRouteSnapshot);
  }

  protected getHeaderAppName(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return activatedRouteSnapshot.params['app'] || activatedRouteSnapshot.children[0].params['app'];
  }

  protected getHeaderAppInputData(activatedRouteSnapshot: ActivatedRouteSnapshot): any {
    const appId: string = this.getAppId(activatedRouteSnapshot);
    const businessId: string = this.getBusinessId(activatedRouteSnapshot);
    const data: any = {
      business: businessId,
      activeView: 'checkout'
    };

    switch (this.app) {
      case 'pos':
        data.terminal = appId;
        break;
      case 'shop': {
        data.shop = appId;
        break;
      }
      case 'marketing': {
        // NOTE: do nothing for marketing, because Checkout cretaes header himself if it is opened from Marketing
        break;
      }
      default:
        break;
    }

    return data;
  }

  protected needShowHeaderOfAnotherApp(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
    // NOTE: if Checkout is opened from Marketing, 
    it creates header himself and no need to load Marketing micro header app
    if (this.app === 'marketing') {
      return false;
    } else {
      return !!this.getHeaderAppName(activatedRouteSnapshot);
    }
  }

  protected getBusinessId(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return activatedRouteSnapshot.params['businessUuid'] || activatedRouteSnapshot.parent.params['businessUuid'];
  }

  protected getAppRootTagName(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return 'checkout-root';
  }

  private getAppId(activatedRouteSnapshot: ActivatedRouteSnapshot): string {
    return activatedRouteSnapshot.params['appId'] || activatedRouteSnapshot.children[0].params['appId'];
  }
*/
}
