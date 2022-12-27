import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ActionTypeEnum } from '../../../../shared';
import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import { ActionRequestInterface } from '../../../../shared/interfaces/detail.interface';

@Component({
  selector: 'pe-paid-action',
  templateUrl: './paid.component.html',
  styleUrls: ['../actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionPaidComponent extends AbstractAction implements OnInit {
  form: FormGroup = null;

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  onSubmit(): void {
    const data: ActionRequestInterface = {};
    const status: string = this.form.get('status').value;
    if (status) {
      data.status = status;
    }
    this.sendAction(
      data,
      ActionTypeEnum.Paid,
      'payment_paid',
      false
    );
  }

  ngOnInit(): void {
    this.getData();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      status: 'STATUS_PAID',
    });
  }
}
