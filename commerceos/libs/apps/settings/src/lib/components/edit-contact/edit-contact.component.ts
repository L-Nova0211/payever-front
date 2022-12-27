import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { EMAIL_ADDRESS_PATTERN, MOBILE_PHONE_PATTERN } from '../../misc/constants/validation-patterns.constants';
import { ApiService, FormTranslationsService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditContactComponent extends AbstractComponent implements OnInit, AfterViewInit {
  @ViewChild('picker') emailPicker;

  currentEmail: string;
  theme;
  data;
  contactForm: FormGroup;
  incorrectMail = false;
  sameMail = false;
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
    this.formTranslationsService.formTranslationNamespace = 'form.create_form.contact';

    this.contactForm = this.formBuilder.group({
      salutation: [this.formTranslationsService.salutation],
      firstName: [''],
      lastName: [''],
      phone: [''],
      additionalPhone: [''],
      fax: [''],
      emails: [[]],
    });
    if (this.overlayData.data.details) {
      this.data = this.overlayData.data.business;
      const details = this.overlayData.data.details.contactDetails;
      details.salutation = details.salutation || this.formTranslationsService.salutation[0].value;
      this.contactForm.patchValue(details);
    }
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
  }

  ngAfterViewInit() {
    this.data?.contactEmails.forEach((val) => {
      this.emailPicker.onAddItem({ label: val, value: val });
    });
  }

  onCheckValidity() {
    const value = this.contactForm.controls;

    value.salutation.setValidators([Validators.required]);
    value.salutation.updateValueAndValidity();

    value.lastName.setValidators([Validators.required]);
    value.lastName.updateValueAndValidity();

    value.firstName.setValidators([Validators.required]);
    value.firstName.updateValueAndValidity();

    value.phone.setValidators([Validators.pattern(MOBILE_PHONE_PATTERN)]);
    value.phone.updateValueAndValidity();

    value.additionalPhone.setValidators([Validators.pattern(MOBILE_PHONE_PATTERN)]);
    value.additionalPhone.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.contactForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.contactForm.valid) {
      this.data['businessDetail'] = { contactDetails: this.contactForm.value };
      this.data.contactEmails = [];
      if (this.data.businessDetail.contactDetails?.emails) {
        this.data.businessDetail.contactDetails.emails.forEach((res) => {
          this.data.contactEmails.push(res.label);
        });
      }
      this.peOverlayRef.close({ data: this.data });
    }
  }

  addEmail = () => {
    const isUniqueEmail = !this.contactForm.value.emails
      .find(email => email.value?.toLowerCase() === this.currentEmail.toLowerCase());
    if (EMAIL_ADDRESS_PATTERN.test(this.currentEmail) && isUniqueEmail) {
      this.emailPicker.onAddItem({ label: this.currentEmail, value: this.currentEmail });
      this.currentEmail = null;
      this.incorrectMail = false;
      this.sameMail = false;
    } else if (this.currentEmail && !isUniqueEmail) {
      this.incorrectMail = false;
      this.sameMail = true;
    } else if (this.currentEmail) {
      this.incorrectMail = true;
      this.sameMail = false;
    }
  }

  onKeyUpPicker(e) {
    this.currentEmail = e;
  }

  get emailErrorMessage() {
    if (this.incorrectMail) {
      return this.formTranslationsService.getFormControlErrorMessage('email');
    }
    if (this.sameMail) {
      return this.translateService.translate('form.create_form.errors.email_not_unique');
    }
  }
}
