import { Injectable, Injector } from '@angular/core';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import {
  PaymentsStateService, PaymentWithVariantInterface, STEP_UPLOAD_TYPES, StepEnum, StepInterface,
} from '../../../../shared';

@Injectable()
export class StepsHelperService {

  protected paymentsStateService: PaymentsStateService = this.injector.get(PaymentsStateService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  constructor(protected injector: Injector) {}

  getStep(payment: PaymentWithVariantInterface, stepType: StepEnum): StepInterface {
    return payment && payment.variants && payment.missing_steps.missing_steps.find(step => step.type === stepType);
  }

  getNonFilledSteps(payment: PaymentWithVariantInterface): StepInterface[] {
    return payment.missing_steps.missing_steps.filter((step) => {
      if (payment && payment.variants[0] && step.type === StepEnum.additionalInfo) {
        return !step.filled || payment.variants.filter(variant => variant.status === 'new').length > 0;
      }

      return !step.filled;
    });
  }

  hasSectionAccount(payment: PaymentWithVariantInterface): boolean {
    // return !this.isStatusConnected() || !!this.getStep(StepEnum.additionalInfo);
    // return !this.isAllStatusConnected(payment) || this.hasSectionAccountBody(payment);
    return this.hasSectionAccountBody(payment);
  }

  hasSectionAccountBody(payment: PaymentWithVariantInterface): boolean {
    // return this.getStep(StepEnum.additionalInfo) && (!this.getStep(StepEnum.additionalInfo).filled || this.payment.variants[0].status === 'new');
    return this.getStep(payment, StepEnum.additionalInfo) && (
      // !this.getStep(StepEnum.additionalInfo).filled || this.payment.variants.filter(variant => variant.default && variant.status === 'new').length > 0
      !this.getStep(payment, StepEnum.additionalInfo).filled ||
      payment.variants.filter(variant => variant.status === 'new').length > 0
    );
  }

  hasSectionExternalRegister(payment: PaymentWithVariantInterface): boolean {
    // return this.getStep(StepEnum.missingCredentials) && this.payment.extended.status === 'new';
    return this.getStep(payment, StepEnum._missingCredentials) && payment.variants.filter(variant => !variant.credentials_valid && variant.status === 'new').length > 0;
  }

  isSectionExternalRegisterFilled(payment: PaymentWithVariantInterface): boolean {
    // return this.stateService.isSectionExternalRegisterFilled(this.payment.variant);
    return this.getStep(payment,StepEnum._missingCredentials) && this.paymentsStateService.isSectionExternalRegisterFilled(payment.option);
  }

  hasSectionDocuments(payment: PaymentWithVariantInterface): boolean {
    return !!STEP_UPLOAD_TYPES.find(uploadType =>
      !!this.getStep(payment, uploadType)) && !this.isAllStatusConnected(payment);
  }

  isSectionDocumentsFilled(payment: PaymentWithVariantInterface): boolean {
    // TODO Also we should check payload (is submitted) but it's too complicated
    return !STEP_UPLOAD_TYPES.find(uploadType =>
      this.getStep(payment, uploadType) && !this.getStep(payment, uploadType).filled);
  }

  hasSectionAuthentication(payment: PaymentWithVariantInterface, paymentIndex: number): boolean {
    // return !!this.getStep(StepEnum.missingCredentials);
    const variant = payment.variants[paymentIndex];

    return variant ? !variant.credentials_valid : false;
  }

  hasSectionSettings(payment: PaymentWithVariantInterface, paymentIndex: number): boolean {
    // return this.isStatusConnected();
    return this.isVariantStatusConnected(payment, paymentIndex);
  }

  hasSectionExternalAuthentication(payment: PaymentWithVariantInterface): boolean {
    return !!this.getStep(payment, StepEnum.missingExternalAuthentication);
  }

  hasSectionExternalRegistration(payment: PaymentWithVariantInterface, paymentIndex: number): boolean {
    // return !!this.getStep(StepEnum.registerUrl) && !this.isStatusConnected();
    return !!this.getStep(payment, StepEnum.registerUrl) && !this.isVariantStatusConnected(payment, paymentIndex);
  }

  isStatusPending(payment: PaymentWithVariantInterface): boolean {
    // TODO This one probably not correct
    // return this.getNonFilledSteps().length === 1 &&
    //   this.getStep(StepEnum.missingCredentials) &&
    //   !this.getStep(StepEnum.missingCredentials).filled;
    return payment.variants.filter((variant) => {
      return variant.default && !variant.credentials_valid &&
        this.getNonFilledSteps(payment).length === 1 &&
        this.getStep(payment, StepEnum._missingCredentials);
    }).length > 0;
  }

  /*
  isStatusConnected(): boolean {
    return (!!this.getStep(StepEnum.missingCredentials) && this.getStep(StepEnum.missingCredentials).filled) ||
           (!!this.getStep(StepEnum.missingExternalAuthentication) && this.getStep(StepEnum.missingExternalAuthentication).filled);
  }
  */

  isVariantStatusConnected(payment: PaymentWithVariantInterface, paymentIndex: number): boolean {
    return payment.variants[paymentIndex] && (payment.variants[paymentIndex].credentials_valid ||
      this.isFilledExternalAuthentication(payment));
  }

  isSomeStatusConnected(payment: PaymentWithVariantInterface): boolean {
    return payment.variants.filter((variant) => {
      return variant.credentials_valid;
    }).length > 0 || this.isFilledExternalAuthentication(payment);
  }

  isAllStatusConnected(payment: PaymentWithVariantInterface): boolean {
    return payment.variants.filter((variant) => {
      return variant.credentials_valid;
    }).length === payment.variants.length || this.isFilledExternalAuthentication(payment);
  }

  showStepError(error: string): void {
    const snackBarService: SnackbarService = this.injector.get(SnackbarService);
    snackBarService.toggle(true, {
      content: error || this.translateService.translate('errors.unknown_error'),
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  private isFilledExternalAuthentication(payment: PaymentWithVariantInterface): boolean {
    return !!this.getStep(payment, StepEnum.missingExternalAuthentication) &&
    this.getStep(payment, StepEnum.missingExternalAuthentication).filled;
  }
}

