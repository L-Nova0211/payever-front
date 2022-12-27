import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import { ActionTypeEnum } from '../../../../shared/interfaces/action.type';
import { ActionRequestInterface } from '../../../../shared/interfaces/detail.interface';

@Component({
  selector: 'pe-change-amount-action',
  templateUrl: './change-amount.component.html',
  styleUrls: ['../actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionChangeAmountComponent extends AbstractAction implements OnInit{
  currencySymbol = '';
  form: FormGroup = null;

  private initialAmount: number = null;
  private editMode = false;
  private increaseAmountDisabled = false;

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getData();
  }

  change(): void {
    return;
  }

  onSubmit(): void {
    const amount: number = this.form.get('amount').value;
    if (String(amount) === '' || amount <= 0) {
      this.form.get('amount').setErrors({
        invalid: this.translateService.translate('transactions.form.change_amount.errors.must_be_positibe_number'),
      });
    } else if (this.increaseAmountDisabled && this.initialAmount && amount >= this.initialAmount) {
      this.form.get('amount').setErrors({
        invalid: this.translateService.translate('transactions.form.change_amount.errors.must_be_less_than', {
          amount: this.initialAmount,
        }),
      });
    } else {
      if (this.editMode) {
        this.sendAction( amount as any, ActionTypeEnum.Edit, 'amount', false);
      } else {
        const data: ActionRequestInterface = {};
        if (amount) {
          data.amount = amount;
        }
        this.sendAction(data, ActionTypeEnum.Change_Amount, 'payment_change_amount', false);
      }
    }
  }

  createForm(): void {
    this.initialAmount = Number(this.order.transaction.amount);

    this.editMode = this.order._isSantanderPosDeFactInvoice || this.order._isSantanderPosDe;
    this.increaseAmountDisabled = this.editMode;

    this.form = this.formBuilder.group({
      amount: this.order.transaction.amount,
    });
  }
}
