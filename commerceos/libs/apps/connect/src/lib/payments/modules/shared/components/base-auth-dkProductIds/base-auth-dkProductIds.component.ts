import { Directive } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { isEqual } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';

import {
  AddonType,
  InputType,
  FormScheme,
} from '@pe/forms';

import { SantanderDkStoreProductDataInterface as ProductDataInterface } from '../../../../../shared';
import { BaseAuthComponent } from '../../../shared/components/base-auth/base-auth.component';

interface FormInterface {
  credentials: {
    storeId: string;
  };
}

@Directive()
export abstract class SantanderDkCredentialsStoreProductData extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'storeId',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            required: true,
          }, {
            type: InputType.Text,
          }),
          addonAppend: {
            addonType: AddonType.Button,
            noDefaultClass: true,
            className: 'mat-raised-button mat-muted-light mat-button-rounded mat-button-xs',
            text: this.translateService.translate('categories.payments.actions.get_products'),
            onClick: () => {
              this.getProducts();
            },
          },
        },
      ],
    },
  };

  startProductIds: string[] = [];
  startStoreId: string;
  lastRequestStoreId: string;

  productIds: string[] = [];
  isEmailNotificationAllowed: boolean;
  products$: BehaviorSubject<ProductDataInterface[]> = new BehaviorSubject<ProductDataInterface[]>(null);

  createFormDeferred(initialData: FormInterface) {
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        storeId: [credentials.storeId, Validators.required],
      }),
    });

    this.afterCreateFormDeferred();

    this.startStoreId = this.getStoreId();
    this.productIds = (credentials.productIds as any || []).map(id => String(id));
    this.startProductIds = this.productIds;
    this.isEmailNotificationAllowed = Boolean(credentials.isEmailNotificationAllowed);

    if (this.getStoreId()) {
      this.getProducts();
    }
  }

  isStartValueChanged(): boolean {
    return this.getStoreId() && (this.startStoreId !== this.getStoreId()
    || !isEqual(this.productIds.sort(), this.startProductIds.sort()));
  }

  onSuccess() {
    if (this.isNeedGetProducts()) {
      this.getProducts();
    } else {
      if (!this.productIds.length) {
        this.showStepError(this.translateService.translate(
        'categories.payments.auth.dk_products.errors.no_one_product_selected'));
      }
    }
  }

  getStoreId(): string {
    return this.form.get('credentials').get('storeId').value;
  }

  getProducts(): void {
    if (!this.isLoading$.getValue()) {
      if (!this.getStoreId()) {
        this.showStepError(this.translateService.translate(
        'categories.payments.auth.dk_products.errors.empty_store_id'));
      }
    }
  }

  onProductChecked(event: MatCheckboxChange, productId: string): void {
    this.productIds = this.productIds.filter(id => id !== String(productId));
    if (event.checked) {
      this.productIds.push(String(productId));
    }
  }

  isProductChecked(productId: string): boolean {
    return this.productIds.indexOf(String(productId)) >= 0;
  }

  isNeedGetProducts(): boolean {
    return !this.products$.getValue() || this.lastRequestStoreId !== this.getStoreId();
  }

  protected onClearCredentials(): void {
    super.onClearCredentials();
    this.products$.next(null);
  }

  private filterSelectedProducts(): void {
    const existingIds = this.products$.getValue().map(info => String(info.Id));
    this.productIds = this.productIds.filter(productId => existingIds.indexOf(productId) >= 0);
  }
}
