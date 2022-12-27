import { Directive, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';

import {
  PeProfileCardInterface,
  PeProfileCardConfigInterface,
  ProfileCardType,
  ProfileControlType,
  ProfileButtonControlInterface,
  ProfileMenuControlInterface,
} from '@pe/app-switcher';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';

import { CheckoutInterface } from '../interfaces';
import { RootCheckoutWrapperService, StorageService } from '../services';

@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class BaseSwitcherComponent {

  protected enableManageActions = true;

  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected wrapperService: RootCheckoutWrapperService = this.injector.get(RootCheckoutWrapperService);
  protected router: Router = this.injector.get(Router);
  protected mediaUrlPipe: MediaUrlPipe = this.injector.get(MediaUrlPipe);
  protected storageService: StorageService = this.injector.get(StorageService);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected destroyed$: PeDestroyService = this.injector.get(PeDestroyService);

  currentCheckout$: Observable<CheckoutInterface> = this.storageService.getCheckoutById(this.checkoutUuid)
    .pipe(takeUntil(this.destroyed$), filter(d => !!d));

  defaultCheckout$: Observable<CheckoutInterface> = this.storageService.getDefaultCheckout()
    .pipe(takeUntil(this.destroyed$));

  selectedCheckoutUuid$: BehaviorSubject<string> = new BehaviorSubject(null);
  checkouts$: Observable<CheckoutInterface[]> = this.storageService.getCheckouts()
    .pipe(takeUntil(this.destroyed$), filter(d => !!d));

  list$: Observable<PeProfileCardInterface[]> = this.checkouts$.pipe(
    takeUntil(this.destroyed$),
    map((checkouts: CheckoutInterface[]) => {
      return checkouts.map((checkout: CheckoutInterface) => {
        return {
          name: checkout.name,
          uuid: checkout._id,
          logo: checkout.logo ? this.mediaUrlPipe.transform(checkout.logo, 'images') : null,
          leftControl: {
            type: ProfileControlType.Button,
            title: this.translateService.translate('actions.open'),
            onClick: () => {
              this.openCheckout(checkout);
            },
          } as ProfileButtonControlInterface,
          rightControl: this.enableManageActions ? {
            type: ProfileControlType.Menu,
            icon: 'icon-dots-h-24',
            menuItems: [
              {
                title: this.translateService.translate('actions.edit'),
                onClick: () => {
                  this.openEditCheckout(checkout);
                },
              },
            ].concat(!this.isAllowToDeleteCheckout(checkouts, checkout) ? [] : [
              {
                title: this.translateService.translate('actions.delete'),
                onClick: () => {
                  this.openDeleteCheckout(checkout);
                },
              },
            ]).concat(checkout.default ? [] : [{
              title: this.translateService.translate('actions.set_as_default'),
              onClick: () => {
                this.setCheckoutAsDefault(checkout);
              },
            }]),
          } as ProfileMenuControlInterface : null,
        } as PeProfileCardInterface;
      });
    })
  );

  profileCardConfig$: Observable<PeProfileCardConfigInterface> = this.checkouts$.pipe(
    takeUntil(this.destroyed$),
    filter((checkouts: CheckoutInterface[]) => checkouts && checkouts.length > 0),
    map((checkouts: CheckoutInterface[]) => {
      const defaultCheckout: CheckoutInterface = checkouts.find(c => c.default) || checkouts[0];

      return {
        _id: defaultCheckout._id,
        type: ProfileCardType.App,
        placeholderTitle: defaultCheckout.name,
        cardButtonText: this.translateService.translate('actions.addCheckoutPlus'),
        onCardButtonClick: () => {
          this.openAddCheckout();
        },
        images: defaultCheckout.logo ? [this.mediaUrlPipe.transform(defaultCheckout.logo, 'images')] : [],
      } as PeProfileCardConfigInterface;
    })
  );

  constructor(
    protected injector: Injector,
  ) {
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid']
    || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  abstract openCheckout(checkout: CheckoutInterface): void;

  abstract openAddCheckout(): void;

  abstract openEditCheckout(checkout: CheckoutInterface): void;

  abstract openDeleteCheckout(checkout: CheckoutInterface): void;

  setCheckoutAsDefault(checkout: CheckoutInterface): void {
    this.storageService.setDefaultCheckout(checkout._id).subscribe();
  }

  onProfileCardClick(): void {
    this.currentCheckout$.pipe(take(1)).subscribe((checkout: CheckoutInterface) => {
      this.openEditCheckout(checkout);
    });
  }

  onProfileFromListClick(checkout: CheckoutInterface): void {
    this.selectedCheckoutUuid$.next(checkout._id);
    this.storageService.setDefaultCheckout(checkout._id).subscribe(() => this.onProfileCardClick());
  }

  protected isAllowToDeleteCheckout(checkoutList: CheckoutInterface[], checkout: CheckoutInterface): boolean {
    return checkoutList && checkoutList.length > 1 && !checkout.default;
  }
}
