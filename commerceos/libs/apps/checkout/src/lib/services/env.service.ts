import { Injectable } from '@angular/core';

@Injectable()
export class EnvService {

  readonly currentCheckoutLocalStorageKey: string = 'pe-current-checkout';

  businessId: string;
  // currentCheckoutId: string;

  // get currentCheckoutId(): string {
  //   return this
  // }

  get currentCheckoutIdFromLocalStorage(): string {
    return localStorage.getItem(`${this.currentCheckoutLocalStorageKey}${this.businessId}`);
  }

  set currentCheckoutIdFromLocalStorage(checkotuId: string) {
    localStorage.setItem(`${this.currentCheckoutLocalStorageKey}${this.businessId}`, checkotuId);
  }

}
