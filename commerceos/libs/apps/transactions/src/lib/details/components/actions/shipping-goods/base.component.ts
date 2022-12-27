import { Directive, Input, Injector, OnInit, ChangeDetectorRef } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';

import { DetailInterface } from '../../../../shared/interfaces';

@Directive()
export class BaseShippingComponent implements OnInit {
  @Input() order: DetailInterface;

  form: FormGroup;

  protected cdr = this.injector.get(ChangeDetectorRef);
  private controlContainer = this.injector.get(ControlContainer);

  constructor(
    protected injector: Injector,
  ) {}

  ngOnInit(): void {
    this.form = this.controlContainer.control as FormGroup;
  }
}
