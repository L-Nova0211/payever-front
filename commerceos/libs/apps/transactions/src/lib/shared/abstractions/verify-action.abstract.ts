import { Directive, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { VerifyPayloadInterface } from '../interfaces/action.interface';

import { AbstractAction } from './action.abstract';

@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class AbstractVerifyAction extends AbstractAction implements OnInit{
  @Input() verify$ = new Subject<void>();

  @Output() verify = new EventEmitter<VerifyPayloadInterface>();
  @Output() errorKey = new EventEmitter<string>();

  form: FormGroup;
  isSubmitted = false;

  abstract errorKeyValue: string;

  readonly destroyed$ = this.injector.get(PeDestroyService);

  constructor(
    protected injector: Injector,
  ) {
    super(injector);
  }

  abstract onSubmit(): void;

  ngOnInit(): void {
    this.getData();
    this.errorKey.emit(this.errorKeyValue);

    this.verify$.pipe(
      tap(() => this.onSubmit()),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  createForm() {

  }
}
