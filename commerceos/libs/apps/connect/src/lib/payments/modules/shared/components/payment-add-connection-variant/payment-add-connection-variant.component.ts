import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { FormScheme, FormAbstractComponent } from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { PaymentMethodEnum } from '../../../../../shared';
import { PaymentsStateService } from '../../../../../shared';

interface ApiKeyFormInterface {
  variant: {
    name: string,
  };
}

@Component({
  selector: 'payment-add-connection-variant',
  templateUrl: './payment-add-connection-variant.component.html',
})
export class PaymentAddConnectionVariantComponent extends FormAbstractComponent<ApiKeyFormInterface> {

  // @Input() name: string = null;
  @Input() paymentMethod: PaymentMethodEnum = null;
  @Output() created: EventEmitter<void> = new EventEmitter();

  formStorageKey = 'payments-add-connection-variant';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  formScheme: FormScheme = {
    fieldsets: {
      variant: [
        {
          name: 'name',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-12 opacity-03 no-border-radius',
            required: true,
          },
        },
      ],
    },
  };

  protected paymentsStateService: PaymentsStateService = this.injector.get(PaymentsStateService);
  protected translateService: TranslateService = this.injector.get(TranslateService);

  get snackBarService(): SnackbarService {
    return this.injector.get(SnackbarService);
  }

  protected createForm(initialData: ApiKeyFormInterface): void {
    setTimeout(() => {
      this.createFormDeffered(this.initialData);
    });
  }

  protected createFormDeffered(initialData: ApiKeyFormInterface): void {
    this.form = this.formBuilder.group({
      variant: this.formBuilder.group({
        name: ['', Validators.required],
      }),
    });

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formsValues: ApiKeyFormInterface) {
    this.snackBarService.toggle(false);
  }

  protected onSuccess() {}
}
