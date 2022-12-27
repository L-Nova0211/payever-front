import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';


@Component({
  selector: 'peb-edit-owner',
  templateUrl: './edit-owner.component.html',
  styles: [`
    .form-error {
      margin-top: 12px;
    }
  `],
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOwnerComponent implements OnInit {
  theme: AppThemeEnum;
  form: FormGroup;
  errorMessage$ = new BehaviorSubject<string>('');
  isSubmitted$ = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private peOverlayRef: PeOverlayRef,
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.theme = this.overlayConfig.theme as AppThemeEnum;

    this.createForm();

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.onCheckValidity()),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private createForm(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  private onCheckValidity(): void {
    this.isSubmitted$.next(true);

    if (this.form.valid) {
      this.onSave();

      return;
    }

    this.prepareError();
  }

  private prepareError(): void {
    const fieldLabel = this.translateService.translate('form.create_form.email.label');

    if (this.form.get('email').errors.required) {
      this.errorMessage$.next(`${fieldLabel} ${this.translateService.translate('form.create_form.errors.is_require')}`);
    }

    if (this.form.get('email').errors.email) {
      this.errorMessage$.next(`${fieldLabel} ${this.translateService.translate('form.create_form.errors.email_pattern')}`);
    }
  }


  private onSave(): void {
    if (this.form.valid) {
      this.peOverlayRef.close({ data: this.form.value });
    }
  }
}
