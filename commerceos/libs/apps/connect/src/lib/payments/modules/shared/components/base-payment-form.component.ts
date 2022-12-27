import { OnDestroy, Directive } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import {
  ErrorBag, ErrorBagDeepData, FormAbstractComponent, SnackBarService,
} from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { PaymentMethodEnum } from '../../../../shared';
import { PaymentsStateService, PaymentWithVariantInterface, StepEnum, StepInterface } from '../../../../shared';
import { StepsHelperService } from '../services';

@Directive()
export abstract class BasePaymentFormComponent<T> extends FormAbstractComponent<T> implements OnDestroy {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  errorBag: ErrorBag = this.injector.get(ErrorBag);
  errorsNonFlat$: Observable<ErrorBagDeepData> = this.errorBag.errors$;

  // TODO Following code is copy of BasePaymentComponent()
  // We need to find way to inherit to avoid copypaste

  abstract readonly paymentMethod: PaymentMethodEnum;
  isReloadingPayment$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isReloadingPaymentDone$: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  payment$: BehaviorSubject<PaymentWithVariantInterface> = new BehaviorSubject<PaymentWithVariantInterface>(null);
  paymentReadyFirst$: Observable<PaymentWithVariantInterface> =
  this.payment$.asObservable().pipe(filter(data => !!data), take(1));

  protected paymentsStateService: PaymentsStateService = this.injector.get(PaymentsStateService);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected stepsHelperService: StepsHelperService = this.injector.get(StepsHelperService);

  abstract createFormDeferred(initialData: T): void;

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.flushDataStorage();
  }

  get snackBarService(): SnackBarService {
    return this.injector.get(SnackBarService);
  }

  createForm(initialData: T) {
    this.paymentReadyFirst$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      // Has do add timer() to avoid `ExpressionChangedAfterItHasBeenCheckedError:
      // Expression has changed after it was checked.`
      // It happens when we open whis page second time
      timer(0).pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.createFormDeferred(initialData);
      });
    });
  }

  get payment(): PaymentWithVariantInterface {
    return this.payment$.getValue();
  }

  getStep(stepType: StepEnum): StepInterface {
    return this.stepsHelperService.getStep(this.payment, stepType);
  }

  getNonFilledSteps(): StepInterface[] {
    return this.stepsHelperService.getNonFilledSteps(this.payment);
  }

  hasSectionAccount(): boolean {
    return this.stepsHelperService.hasSectionAccount(this.payment);
  }

  hasSectionAccountBody(): boolean {
    return this.stepsHelperService.hasSectionAccountBody(this.payment);
  }

  hasSectionExternalRegister(): boolean {
    return this.stepsHelperService.hasSectionExternalRegister(this.payment);
  }

  hasSectionDocuments(): boolean {
    return this.stepsHelperService.hasSectionDocuments(this.payment);
  }

  hasSectionAuthentication(paymentIndex: number): boolean {
    return this.stepsHelperService.hasSectionAuthentication(this.payment, paymentIndex);
  }

  hasSectionSettings(paymentIndex: number): boolean {
    return this.stepsHelperService.hasSectionSettings(this.payment, paymentIndex);
  }

  isStatusPending(): boolean {
    return this.stepsHelperService.isStatusPending(this.payment);
  }

  isVariantStatusConnected(paymentIndex: number): boolean {
    return this.stepsHelperService.isVariantStatusConnected(this.payment, paymentIndex);
  }

  isSomeStatusConnected(): boolean {
    return this.stepsHelperService.isSomeStatusConnected(this.payment);
  }

  isAllStatusConnected(): boolean {
    return this.stepsHelperService.isAllStatusConnected(this.payment);
  }

  protected handleError(error: any, showSnack?: boolean): void {
    this.paymentsStateService.handleError(error, showSnack);
  }

  protected onUpdateFormData(formValues: any): void {
  }

  protected showStepError(error: string): void {
    return this.stepsHelperService.showStepError(error);
  }
}
