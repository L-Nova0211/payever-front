import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { FormTranslationsService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-bank',
  templateUrl: './edit-bank.component.html',
  styleUrls: ['./edit-bank.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditBankComponent extends AbstractComponent implements OnInit {
  data: any;
  countries;
  theme;
  address = '';

  bankForm: FormGroup = this.formBuilder.group({
    owner: [''],
    bankName: [''],
    city: [''],
    bic: [''],
    country: ['DE'],
    iban: [''],
  });

  @ViewChild('streetAddress') addressText: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private http: HttpClient,
    private localConstantsService: LocaleConstantsService,
    protected translateService: TranslateService,
    public formTranslationsService: FormTranslationsService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super();
  }

  ngOnInit() {
    if (this.overlayData.data.details) {
      this.data = this.overlayData.data.business;
    }
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
    this.getCountries();
    this.theme = this.overlayConfig.theme;
    this.setOriginForm();
    this.formTranslationsService.formTranslationNamespace = 'form.create_form.bank.bankAccount';
  }

  setOriginForm() {
    const formData = this.overlayData.data.details.bankAccount || {};
    this.bankForm.patchValue(formData);
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    Object.keys(countryList).forEach((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }

  onClose() {
    this.peOverlayRef.close();
  }

  onCheckValidity() {
    const value = this.bankForm.controls;

    value.owner.setValidators([Validators.required]);
    value.owner.updateValueAndValidity();

    value.country.setValidators([Validators.required]);
    value.country.updateValueAndValidity();

    value.city.setValidators([Validators.required]);
    value.city.updateValueAndValidity();

    value.iban.setValidators([Validators.required]);
    value.iban.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.bankForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.bankForm.valid) {
      this.data['businessDetail'] = { bankAccount: this.bankForm.value };
      this.peOverlayRef.close({ data: this.data });
    }
  }

}
