import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { ApiService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-currency',
  templateUrl: './edit-currency.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCurrencyComponent extends AbstractComponent implements OnInit {
  currencies = [];
  theme;
  data;
  selectedCurrency;
  currencyForm: FormGroup;
  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.theme = this.overlayConfig.theme;
    this.currencies = this.overlayData.data.currencies.map((res) => {
      return { label: `${res.name}, ${res.code}`, value: res.code };
    });

    this.currencyForm = this.formBuilder.group({
      currency: [this.currencies],
    });

    if (this.overlayData.data.currencies) {
      this.data = this.overlayData.data.business;
      this.currencyForm.get('currency').setValue(this.data.currency);
      this.selectedCurrency = {
        label: `${this.overlayData.data.currencies.find(res => res.code === this.data.currency).name}, ${this.data.currency}`,
        value: this.data.currency,
      };
      this.cdr.detectChanges();
    }

    this.currencyForm.get('currency').valueChanges.subscribe((res) => {
      if (res !== this.data.currency) {
        this.data.currency = res;
      }
    });

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
  }

  onCheckValidity() {
    const value = this.currencyForm.controls;
    value.currency.setValidators([Validators.required]);
    value.currency.updateValueAndValidity();
    this.cdr.detectChanges();

    if (this.currencyForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.currencyForm.valid) {
      this.data['businessDetail'] = this.overlayData.data.details;
      if (this.data.businessDetail?.currency) {
        this.data.businessDetail.currency = this.data.currency;
      }
      this.peOverlayRef.close({ data: this.data });
    }
  }
}
