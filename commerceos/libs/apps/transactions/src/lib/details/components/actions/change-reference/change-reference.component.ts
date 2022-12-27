import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ActionTypeEnum } from '../../../../shared';
import { AbstractAction } from '../../../../shared/abstractions/action.abstract';

@Component({
  selector: 'pe-change-reference-action',
  templateUrl: './change-reference.component.html',
  styleUrls: ['../actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class ActionChangeReferenceComponent extends AbstractAction implements OnInit {
  form: FormGroup = null;

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getData();
  }

  onSubmit(): void {
    const reference: number = this.form.get('reference').value;
    if (String(reference) === '') {
      this.form.get('reference').setErrors({
        invalid: this.translateService.translate('transactions.form.change_reference.errors.must_be_not_empty'),
      });
    } else {
      let action = ActionTypeEnum.EditReference;
      if (this.order._isSantanderPosDeFactInvoice) {
        action = ActionTypeEnum.Edit;
      }
      this.sendAction(
        reference as any,
        action,
        'reference',
        false
      );
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      reference: this.order.details.order.reference,
    });
  }
}
