import { Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { AppSetUpStatusEnum, AppSetUpService, MicroRegistryService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { CheckoutInterface, WelcomeStepEnum } from '../interfaces';
import { EnvService, RootCheckoutWrapperService } from '../services';
import { StorageService } from '../services/storage.service';

const welcomeStepsEnabled = false;

export abstract class BaseCurrentCheckoutResolver implements CanActivate {

  protected envService: EnvService = this.injector.get(EnvService);
  protected router: Router = this.injector.get(Router);
  protected storageService: StorageService = this.injector.get(StorageService);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected appSetUpService: AppSetUpService = this.injector.get(AppSetUpService);
  protected microRegistryService: MicroRegistryService = this.injector.get(MicroRegistryService);
  protected wrapperService: RootCheckoutWrapperService = this.injector.get(RootCheckoutWrapperService);

  constructor(
    protected injector: Injector
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const businessUuid: string = window.location.pathname.split('/')[2];
    const checkoutId: string = route.params['checkoutUuid']; // checkoutId or channelSetId
    let checkoutByChannelsSet: string = null;

    return this.storageService.getCheckoutsOnce().pipe(flatMap((checkouts: CheckoutInterface[]) => {
      if (checkouts.length === 0) {
        this.createDefaultAndNavigateToWelcome(route, businessUuid);

        return of(false);
      }

      return this.storageService.getChannelSetsOnce().pipe(flatMap((data) => {
        const channelSetId = checkoutId;
        const channelsSetFound = data.find(item => item.id === channelSetId);
        checkoutByChannelsSet = channelsSetFound ? channelsSetFound.checkout : null;
        if (checkoutId === 'current' || checkoutId === 'default') {
          return this.storageService.getDefaultCheckoutOnce().pipe(flatMap((checkout) => {
            return this.appSetUpService.getStatusAndStep(businessUuid, 'checkout', this.microRegistryService).pipe(
              map((statusData) => {
                if (statusData.status !== AppSetUpStatusEnum.Completed && welcomeStepsEnabled) {
                  // this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, true);
                  this.navigateToWelcomeScreen(route, businessUuid, checkout._id, statusData.step as WelcomeStepEnum);
                } else {
                  this.navigateToCheckoutHome(route, businessUuid, checkout._id);
                }

                return false;
              })
            );
          }));
        } else if (channelsSetFound) {
          if (checkoutByChannelsSet) {
            this.navigateToCheckoutHome(route, businessUuid, checkoutByChannelsSet);
          } else {
            this.navigateToSwitch(route, businessUuid, checkouts[0]._id);
          }

          return of(false);
        } else {
          /*
          let obs$: Observable<boolean> = of(true);

          // Activate checkout by API only if opened checkout is not active
          const defaultCheckout: CheckoutInterface = checkouts.find((checkout: CheckoutInterface) => checkout.default);
          if (!defaultCheckout || defaultCheckout._id !== checkoutId) {
            obs$ = this.storageService.setDefaultCheckout(checkoutId).pipe(map(() => {
              this.envService.currentCheckoutId = checkoutId;
              // this.store.dispatch(new SetCurrentCheckoutIdAction(checkoutId));
              return true;
            }));
          }

          return obs$;*/
          this.wrapperService.setCheckoutUuid(channelSetId);

          return of(true);
        }
      }));
    }));
  }

  protected createDefaultAndNavigateToWelcome(route: ActivatedRouteSnapshot, businessUuid: string): void {
    // create default checkout
    this.storageService.getUserBusiness().subscribe((business) => {
      this.storageService.addNewCheckout({
          name: business.name,
          logo: null,
        } as CheckoutInterface)
        .subscribe((checkout: CheckoutInterface) => {
          this.navigateToWelcomeScreen(route, businessUuid, checkout._id, null);
        });
    });
  }

  protected abstract navigateToWelcomeScreen(route: ActivatedRouteSnapshot,
    businessUuid: string, checkoutId: string, step: WelcomeStepEnum): void;

  protected abstract navigateToCheckoutHome(route: ActivatedRouteSnapshot,
    businessUuid: string, checkoutId: string): void;

  protected abstract navigateToSwitch(route: ActivatedRouteSnapshot, businessUuid: string, checkoutId: string): void;

  protected abstract navigateBasement(route: ActivatedRouteSnapshot, businessUuid: string): string;
}
