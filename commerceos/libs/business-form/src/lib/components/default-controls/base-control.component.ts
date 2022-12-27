import { ChangeDetectorRef, Directive, Injector, Input } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BusinessRegistrationData } from '@pe/api';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { FormFieldInterface } from '@pe/shared/business-form';

@Directive({
  providers: [
    PeDestroyService,
  ],
})
export class BaseControlComponent {
  @Input() control: AbstractControl;
  @Input() businessRegistrationData: BusinessRegistrationData;
  @Input() form: FormGroup;
  @Input() controlScheme: FormFieldInterface;
  @Input() isSubmitted: boolean;
  @Input() errorMessage = {};

  protected destroyed$: PeDestroyService = this.injector.get(PeDestroyService);
  protected translateService: TranslateService = this.injector.get(TranslateService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected route: ActivatedRoute = this.injector.get(ActivatedRoute);

  constructor(
    protected injector: Injector
  ) {}
}
