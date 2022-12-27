import { ChangeDetectorRef, Directive, EventEmitter, Injector, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep, isPlainObject } from 'lodash-es';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeDestroyService } from '@pe/common';
import { AddressService } from '@pe/forms';
import { TranslateService } from '@pe/i18n';
import { PeThemeEnum } from '@pe/theme-switcher';

import { CreateBusinessFormInterface } from '../interfaces/business-form.interface';

@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class BaseBusinessFormComponent {
  @Input() theme = PeThemeEnum.DARK;
  @Input() isLoading: boolean;
  @Input() submitTextKey = 'actions.register';
  @Input() businessRegistrationData;
  @Input() detectChanges$ = new Subject<any>();

  @Input() set allowValidation(value: boolean) {
    this._allowValidation = value;
    if (value) { this.checkErrors() }
  }

  @Output() formDataEmitter = new EventEmitter<CreateBusinessFormInterface>();
  @Output() formHasErrorsEmitter = new EventEmitter<boolean>();

  form: FormGroup;

  protected _allowValidation = false

  protected destroyed$: PeDestroyService = this.injector.get(PeDestroyService);
  protected addressService: AddressService = this.injector.get(AddressService);
  protected apiService: ApiService = this.injector.get(ApiService);
  protected formBuilder: FormBuilder = this.injector.get(FormBuilder);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected route: ActivatedRoute = this.injector.get(ActivatedRoute);

  abstract checkErrors(): void;
  abstract createForm(): void;

  constructor(
    protected injector: Injector
  ) {

  }

  protected updateValues() {
    this.form.valueChanges.pipe(
      debounceTime(300),
      tap((values) => {
        const data = cloneDeep(values);

        // All keys prefixed with '_' are not needed to be send
        this.removeTempData(data);

        this.formDataEmitter.emit(data);
        this.formHasErrorsEmitter.emit(this.form.invalid);
        if (this._allowValidation) { this.checkErrors(); }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private removeTempData(values: object): void {
    for (const value in values) {
      if (value.substring(0, 1) === '_') {
        delete values[value];
      }
      if (isPlainObject(values[value])) {
        this.removeTempData(values[value]);
      }
    }
  }
}
