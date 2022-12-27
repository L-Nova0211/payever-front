import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';

import { ActionTypeEnum } from '../../../../shared';
import { AbstractAction } from '../../../../shared/abstractions/action.abstract';

@Component({
  selector: 'pe-void-action',
  templateUrl: './void.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionVoidComponent extends AbstractAction implements OnInit {
  constructor(
    public injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getData();
  }

  onSubmit(): void {
    this.sendAction(
      {}, ActionTypeEnum.Void, 'payment_void', false
    );
  }

  createForm(): void {}
}
