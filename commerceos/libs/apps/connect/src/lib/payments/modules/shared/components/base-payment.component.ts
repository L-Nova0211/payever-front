import { OnDestroy, Injector, Directive } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { SnackBarService } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

import { PaymentMethodEnum } from '../../../../shared';
import {
  PaymentsStateService,
  StepEnum,
  StepInterface,
  PaymentWithVariantInterface,
} from '../../../../shared';
import { StepsHelperService } from '../services';

@Directive()
export abstract class BasePaymentComponent implements OnDestroy {

  abstract readonly paymentMethod: PaymentMethodEnum;
  isReloadingPayment$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isReloadingPaymentDone$: BehaviorSubject<void> = new BehaviorSubject<void>(null);
  payment$: BehaviorSubject<PaymentWithVariantInterface> = new BehaviorSubject<PaymentWithVariantInterface>(null);
  paymentReadyFirst$: Observable<PaymentWithVariantInterface> =
  this.payment$.asObservable().pipe(filter(data => !!data), take(1));

  protected paymentsStateService: PaymentsStateService = this.injector.get(PaymentsStateService);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected stepsHelperService: StepsHelperService = this.injector.get(StepsHelperService);

  protected destroyed$: Subject<boolean> = new Subject();

  constructor(protected injector: Injector) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get snackBarService(): SnackBarService {
    return this.injector.get(SnackBarService);
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

  isSectionExternalRegisterFilled(): boolean {
    return this.stepsHelperService.isSectionExternalRegisterFilled(this.payment);
  }

  hasSectionDocuments(): boolean {
    return this.stepsHelperService.hasSectionDocuments(this.payment);
  }

  isSectionDocumentsFilled(): boolean {
    return this.stepsHelperService.isSectionDocumentsFilled(this.payment);
  }

  hasSectionAuthentication(paymentIndex: number): boolean {
    return this.stepsHelperService.hasSectionAuthentication(this.payment, paymentIndex);
  }

  hasSectionSettings(paymentIndex: number): boolean {
    return this.stepsHelperService.hasSectionSettings(this.payment, paymentIndex);
  }

  hasSectionExternalAuthentication(): boolean {
    return this.stepsHelperService.hasSectionExternalAuthentication(this.payment);
  }

  hasSectionExternalRegistration(paymentIndex: number): boolean {
    return this.stepsHelperService.hasSectionExternalRegistration(this.payment, paymentIndex);
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

  protected showStepError(error: string): void {
    return this.stepsHelperService.showStepError(error);
  }
}
