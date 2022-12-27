import {
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  Injectable,
  ViewContainerRef,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { CheckoutMicroService } from '@pe/common';

import { PebClientCheckoutComponent } from '../checkout.component';

import { PebClientCheckoutMicroLoaderService } from './micro.service';

@Injectable()
export class PebClientCheckoutService {
  checkoutComponent: ComponentRef<PebClientCheckoutComponent>;
  containerRef: ViewContainerRef;

  constructor(
    private microLoader: PebClientCheckoutMicroLoaderService,
    private checkoutMicroService: CheckoutMicroService,
    @Inject(ComponentFactoryResolver) private factoryResolver: ComponentFactoryResolver,
  ) {}

  addCheckoutComponent(containerRef: ViewContainerRef): Observable<any> {
    return this.checkoutMicroService.microUrl$.pipe(
      switchMap(url => this.microLoader.loadMicroByScriptUrl(url).pipe(
        catchError(() => of(null)),
        tap(() => {
          const factory = this.factoryResolver.resolveComponentFactory(
            PebClientCheckoutComponent,
          );
          this.checkoutComponent = factory.create(containerRef.injector);
          containerRef.insert(this.checkoutComponent.hostView);
        }),
      )),
    );
  }

  resetCheckoutComponent() {
    this.checkoutComponent.destroy();
    this.containerRef.clear();
    const factory = this.factoryResolver.resolveComponentFactory(
      PebClientCheckoutComponent,
    );
    this.checkoutComponent = factory.create(this.containerRef.injector);
    this.containerRef.insert(this.checkoutComponent.hostView);
  }

  showCheckoutWrapper(config = {}): void {
    this.checkoutComponent?.instance.hidden$.next(false);
    if (this.checkoutComponent) {
      this.checkoutComponent?.instance.params$.next(JSON.stringify({
        ...this.checkoutComponent?.instance.defaultConfig || {},
        ...config,
        generatePaymentCode: true,
      }));
      this.checkoutComponent.changeDetectorRef.detectChanges();
    }
    window && window.scrollTo(0, 0);
  }

  showAmountCheckoutWrapper(config = {}): void {
    this.checkoutComponent?.instance.amountHidden$.next(false);
    if (this.checkoutComponent) {
      this.checkoutComponent?.instance.amountParams$.next(JSON.stringify({
        ...this.checkoutComponent?.instance.defaultConfig || {},
        ...config,
        generatePaymentCode: true,
      }));
      this.checkoutComponent.changeDetectorRef.detectChanges();
    }
    window && window.scrollTo(0, 0);
  }

  showCartCheckout(): void {
    this.checkoutComponent?.instance.hidden$.next(false);
  }

  hideCartCheckout(): void {
    this.checkoutComponent?.instance.hidden$.next(true);
  }

  hideAmountCheckout(): void {
    this.checkoutComponent?.instance.amountHidden$.next(true);
  }
}
