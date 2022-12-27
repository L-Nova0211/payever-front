import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { InputPasswordValidator } from '@pe/forms-core';
import { TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
   PeOverlayRef,
} from '@pe/overlay-widget';

import { ApiService, FormTranslationsService } from '../../services';
import { AbstractComponent } from '../abstract';


@Component({
  selector: 'peb-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPasswordComponent extends AbstractComponent implements OnInit {
  theme;
  tfa: boolean;
  passwordForm: FormGroup;
  showPassErorr = false;
  isOldPasswordIncorrect = false;
  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    public formTranslationsService: FormTranslationsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.theme = this.overlayConfig.theme;
    this.formTranslationsService.formTranslationNamespace = 'form.create_form.password';

    this.passwordForm =  this.formBuilder.group({
      currentPassword: [''],
      newPassword: [''],
      repeatPassword: [''],
      tfa: [''],
    });

    if (this.overlayData.data) {
      this.passwordForm.controls.tfa.setValue(this.overlayData.data.tfa);
    }
    this.cdr.detectChanges();

    this.passwordForm.get('repeatPassword').valueChanges.subscribe((res) => {
        this.showPassErorr = res !== this.passwordForm.get('newPassword').value;
    });

    this.passwordForm.get('currentPassword').valueChanges.subscribe((res) => {
       this.isOldPasswordIncorrect = false;
    });

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
  }

  onCheckValidity() {
    const value = this.passwordForm.controls;
    if ((value.currentPassword.touched && value.currentPassword.value)
        || (value.newPassword.touched && value.newPassword.value)
        || (value.repeatPassword.touched &&   value.repeatPassword.value)) {

      value.currentPassword.setValidators([Validators.required, Validators.minLength(8)]);
      value.currentPassword.updateValueAndValidity();

      value.newPassword.setValidators([Validators.required, InputPasswordValidator.default]);
      value.newPassword.updateValueAndValidity();

      value.repeatPassword.setValidators([Validators.required]);
      value.repeatPassword.updateValueAndValidity();
    }
    this.cdr.detectChanges();

    if (this.passwordForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.passwordForm.valid) {
      if (this.passwordForm.controls.currentPassword.value && this.passwordForm.controls.newPassword.value) {
        const newData = {
          oldPassword: this.passwordForm.controls.currentPassword.value,
          newPassword: this.passwordForm.controls.newPassword.value,
        };
        this.apiService.updatePassword(newData).subscribe((res) => {
          this.closeAndSave();
        }, (error) => {
          this.isOldPasswordIncorrect = true;
          this.cdr.detectChanges();
        });
      } else {
        this.closeAndSave();
      }
    }
  }

  closeAndSave() {
    this.peOverlayRef.close({ data: { tfa: this.passwordForm.controls.tfa.value } });
  }

  get currentPasswordErrorMessage() {
    if (this.isOldPasswordIncorrect) {
      return this.translateService.translate('form.create_form.errors.incorrect_pass');
    }

    return this.formTranslationsService.getFormControlErrorMessage('current_password');
  }

  get newPasswordErrorMessage()  {
    return this.translateService.translate('form.create_form.errors.password');
  }
}
