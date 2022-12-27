import { Component, Injector } from '@angular/core';
import { filter, take, takeUntil } from 'rxjs/operators';

import { MediaUrlPipe } from '@pe/media';

import { CheckoutInterface } from '../../interfaces';
import { BaseSwitcherComponent } from '../base-switcher.component';

@Component({
  selector: 'checkout-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.scss'],
  providers: [MediaUrlPipe], // TODO: Make it providable by relative ng-kit module
})
export class SwitcherComponent extends BaseSwitcherComponent {

  isModalOpen: boolean;
  isCreateMode: boolean;
  checkoutsWithLogoErrors: string[] = [];

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  openCheckout(checkout: CheckoutInterface): void {
    this.wrapperService.showCheckout(false);
    this.router.navigate(['business', this.storageService.businessUuid, 'checkout', checkout._id]);
    this.wrapperService.setCheckoutUuid(checkout._id);
    this.wrapperService.showCheckout(true);
  }

  openAddCheckout(): void {
    this.isCreateMode = true;
  }

  openEditCheckout(checkout: CheckoutInterface): void {
    this.router.navigate([`../../${checkout._id}/panel-checkout`], { relativeTo: this.activatedRoute });
  }

  openDeleteCheckout(checkout: CheckoutInterface): void {
    this.router.navigate([`../../${checkout._id}/delete`], { relativeTo: this.activatedRoute });
  }

  setCheckoutAsDefault(checkout: CheckoutInterface): void {
    this.storageService.setDefaultCheckout(checkout._id).subscribe();
  }

  onProfileCardClick(): void {
    this.profileCardConfig$.pipe(take(1)).subscribe((checkout: CheckoutInterface) => {
      this.openEditCheckout(checkout);
    });
  }

  resetCheckout() {
    this.isModalOpen = false;
    this.currentCheckout$ = this.storageService.getCheckoutById(this.checkoutUuid)
      .pipe(takeUntil(this.destroyed$), filter(d => !!d));
    this.checkouts$ = this.storageService.getCheckouts()
      .pipe(takeUntil(this.destroyed$), filter(d => !!d));
    this.storageService.emitUpdateCheckoutSubject();
  }

  openAddCheckoutModal() {
    this.isCreateMode = true;
    this.isModalOpen = true;
  }

  openEditCheckoutModal(checkout: CheckoutInterface) {
    this.selectedCheckoutUuid$.next(checkout._id);
    this.isCreateMode = false;
    this.isModalOpen = true;
  }

  openSavedCheckout() {
    this.storageService.setDefaultCheckout(this.selectedCheckoutUuid$.value).subscribe(() => this.onProfileCardClick());
  }

  hasCheckoutLogoErrors(checkoutId: string): boolean {
    return this.checkoutsWithLogoErrors.includes(checkoutId);
  }
}
