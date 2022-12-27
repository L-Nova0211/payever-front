import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators'

import { AddressService } from '@pe/forms';

import { CreateBusinessFormInterface } from '../../../interfaces/business-form.interface';
import { DynamicFormService } from '../../../services';
import { BaseControlComponent } from '../base-control.component';

const countryTelephoneCodes = require('country-telephone-code/data.json').countryTelephoneCodes;


@Component({
  selector: 'pe-select-phone-code',
  templateUrl: './select-phone-code.component.html',
  styleUrls: ['../control-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPhoneCodeComponent extends BaseControlComponent implements OnInit {
  countryPhones: {
    value: string;
    label: string,
    groupId: string
  }[] = [];

  unUsedCodes = ['BV', 'HM'];

  protected addressService: AddressService = this.injector.get(AddressService);
  protected dynamicFormService: DynamicFormService = this.injector.get(DynamicFormService);

  private readonly DEFAULT_VALUE: CreateBusinessFormInterface = {
    countryCode: 'DE',
  };

  ngOnInit(): void {
    this.dynamicFormService.countryPhoneCode$.next(`+${countryTelephoneCodes[this.DEFAULT_VALUE.countryCode]}`);
    this.dynamicFormService.isSelectPhoneCode$.next(true);

    this.getCountryList();
    this.control.setValue(this.DEFAULT_VALUE.countryCode);
    this.control.valueChanges.pipe(
      tap((value) => {
        this.dynamicFormService.countryPhoneCode$.next(`+${countryTelephoneCodes[value]}`);
        this.form.updateValueAndValidity();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  getCountryList(): void {
    this.countryPhones = this.addressService.countriesContinent
      .filter(value => !this.unUsedCodes.includes(value?.code))
      .map((value) => {
        return {
          value: `${value.code}`,
          label: `+${countryTelephoneCodes[value.code]} ${value.name}`,
          groupId: value.continent,
        };
      });

      this.cdr.markForCheck();
  }

}
