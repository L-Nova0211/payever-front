import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { BusinessDataInterface } from '@pe/shared/business-form';

import { BaseBusinessFormComponent } from '../base-business-form.component';

const arr = [
  {
    name: 'companyDetails.businessStatus',
    placeholder: 'forms.registration.name.placeholder',
    required: true,
    title: 'forms.business_create.businessStatus.label',
    type: 'select_business_status',
    values: [],
  },
  {
    name: 'companyDetails.name',
    placeholder: 'forms.business_create.name.placeholder',
    required: true,
    title: 'forms.business_create.name.placeholder',
    type: 'text',
  },
  {
    name: 'companyDetails.status',
    placeholder: 'forms.business_create.status.label',
    required: true,
    title: 'forms.business_create.status.label',
    type: 'select_status',
    values: [],
  },
  {
    name: 'companyDetails.salesRange',
    placeholder: 'forms.business_create.sales.label',
    required: true,
    title: 'forms.business_create.sales.label',
    type: 'select_sales',
    values: [],
  },
  {
    name: 'companyDetails.industry',
    placeholder: 'forms.business_create.industry.placeholder',
    required: true,
    title: 'forms.business_create.industry.placeholder',
    type: 'autocomplete_industry', // We did'nt have that type
    relativeField: 'product',
    values: [],
  },
  {
    name: 'product',
    placeholder: '',
    required: true,
    title: '',
    type: 'hidden',
  },
  {
    name: 'companyAddress.country',
    placeholder: 'forms.business_create.countryPhoneCode.label',
    required: true,
    title: 'forms.business_create.countryPhoneCode.label',
    type: 'select_phone_code',
    values: [],
  },
  {
    name: 'companyDetails.phone',
    placeholder: 'forms.business_create.phoneNumber.label',
    required: true,
    title: 'forms.business_create.phoneNumber.label',
    type: 'phone_without_code',
    combineWith: 'companyAddress.country',
    combinePosition: 'start', // 'start' | 'end'
  },
]

@Component({
  selector: 'entry-default-business-registration',
  templateUrl: './default-form.component.html',
  styleUrls: ['./default-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultBusinessRegistrationComponent extends BaseBusinessFormComponent implements OnInit {

  prepareBusinessData(): BusinessDataInterface {
    return {
      id: this.businessId,
      name: this.businessData.name,
      companyAddress: {
        country: this.businessData.countryPhoneCode.split(':')[0],
      },
      companyDetails: {
        businessStatus: this.businessData.businessStatus,
        status: this.businessData.status,
        salesRange: this.businessData.salesRange,
        product: this.businessData.industry.productCode,
        industry: this.businessData.industry.value,
        phone: this.businessData.countryPhoneCode.split(':')[1] + this.businessData.phoneNumber,
      },
    };
  }
}
