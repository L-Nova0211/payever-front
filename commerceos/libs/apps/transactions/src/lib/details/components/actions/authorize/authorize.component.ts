/* eslint-disable no-underscore-dangle */
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';

import { PeDateTimePickerService } from '@pe/ui';

import { AbstractAction, ActionTypeEnum, DetailInterface, paymentsHaveAuthorizeAllowed } from '../../../../shared';

@Component({
  selector: 'pe-authorize-action',
  templateUrl: './authorize.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionAuthorizeComponent extends AbstractAction implements OnInit {
  form: FormGroup = null;
  doneBtnTitle = this.translateService.translate('transactions.form.invoice.actions.transfer');

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder,
    private dateTimePicker: PeDateTimePickerService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getData();
  }

  onSubmit(): void {
    const dataKey: string = paymentsHaveAuthorizeAllowed.indexOf(this.order?.payment_option?.type) >= 0 ? 'payment_authorize' : 'transfer';

    this.sendAction(
      this.form.value,
      ActionTypeEnum.Authorize,
      dataKey,
      false
    );
  }

  getData(reset = false): void {
    this.detailService.getData(this.orderId, reset).subscribe(
      (order: DetailInterface): void => {
        if (order._isPaymill) {
          this.doneBtnTitle = this.translateService.translate('transactions.form.charge.actions.charge');
        }
        this.order = order;
        this.createForm();
      }
    );
  }

  createForm(): void {
    if (this.order._isPaymill || this.order._isPayex || this.order._isSwedbank) {
      this.form = this.formBuilder.group({});
    } else {
      this.form = this.formBuilder.group({
        invoiceDate: moment().format('MM/DD/YYYY'),
        invoiceId: this.orderId,
        customerId: this.order.customer.email,
      });
    }
  }

  onOpenDatepicker(event: MouseEvent): void {
    const dialogRef = this.dateTimePicker.open(event, {
      theme: this.theme,
    });
    dialogRef.afterClosed.subscribe((date) => {
      this.form.get('invoiceDate').setValue(moment(date.start).format('MM/DD/YYYY'), { emitEvent: false })
    });
  }
}
