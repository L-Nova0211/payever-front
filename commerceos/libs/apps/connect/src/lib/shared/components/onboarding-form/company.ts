import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { AddressService, FormSchemeField, InputType, SelectOptionInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

// import { IntegrationsStateService, ProductWithIndustriesInterface } from '../../interfaces';

export interface CompanyFormFieldsInterface {
  // TODO Must be also added 'employeesRange' and 'salesRange'
  legalForm: string;
  product: string;
  industry: string;
  urlWebsite: string;
  foundationYear: number;
}

export interface CompanyFormInterface {
  companyDetails: CompanyFormFieldsInterface;
}

interface ProductWithIndustriesInterface {
  code: string;
  industries: {
    code: string;
  }[];
}

@Injectable()
export class CompanyHelperService {

  form: FormGroup = null;

  productValues$:  BehaviorSubject<SelectOptionInterface[]> = new BehaviorSubject<SelectOptionInterface[]>(null);
  industryValues$: BehaviorSubject<SelectOptionInterface[]> = new BehaviorSubject<SelectOptionInterface[]>(null);
  private productWithIndustries: ProductWithIndustriesInterface[];

  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private http: HttpClient,
    // private integrationsStateService: IntegrationsStateService,
    private addressService: AddressService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
  ) {}

  getBusinessProductWithIndustriesList(): Observable<ProductWithIndustriesInterface[]> {
    const config = this.envConfig.backend;

    return this.http.get<ProductWithIndustriesInterface[]>(`${config.commerceos}/api/business-products`);
  }

  createForm(initialData: CompanyFormFieldsInterface,
    requiredFields: string[]): { form: FormGroup, formSchemeFields: FormSchemeField[] } {
    const req = [ Validators.required ];
    this.form = this.formBuilder.group({
      // TODO Must be also added 'employeesRange' and 'salesRange'
      legalForm:    [initialData.legalForm    || '',
      requiredFields.indexOf('companyDetails.legalForm')    >= 0 ? req : []],
      product:      [initialData.product      || '',
      requiredFields.indexOf('companyDetails.product')      >= 0 ? req : []],
      industry:     [initialData.industry     || '',
      requiredFields.indexOf('companyDetails.industry')     >= 0 ? req : []],
      urlWebsite:   [initialData.urlWebsite   || '',
      requiredFields.indexOf('companyDetails.urlWebsite')   >= 0 ? req : []],
      foundationYear: [initialData.foundationYear || '',
        requiredFields.indexOf('companyDetails.foundationYear') >= 0 ?
        [ ...req, this.getYearValidator() ] : [ this.getYearValidator() ],
      ],
    });

    this.getBusinessProductWithIndustriesList().subscribe((productWithIndustries) => {
      this.productWithIndustries = productWithIndustries;
      this.productValues$.next(productWithIndustries.map((prod) => {
        return {
          value: prod.code,
          label: this.translate('product', prod.code),
        };
      }));
      if (this.form && this.form.controls['product']) {
        this.updateIndustryValues(this.form.controls['product'].value);
      }
    });

    const formSchemeFields: FormSchemeField[] = [
      {
        name: 'legalForm',
        type: 'select',
        fieldSettings: {
          classList: 'col-xs-12 opacity-03 form-fieldset-field-padding-24 no-border-radius',
          required: requiredFields.indexOf('companyDetails.legalForm') >= 0,
        },
        selectSettings: {
          options: this.getLegalFormList(),
          panelClass: 'mat-select-dark',
        },
      },
      {
        name: 'product',
        type: 'select',
        fieldSettings: {
          classList: 'col-xs-12 opacity-03 form-fieldset-field-padding-24',
          // Industry is shown only when product is selected so product should be required when industry is required
          required: requiredFields.indexOf('companyDetails.product') >= 0 ||
          requiredFields.indexOf('companyDetails.industry') >= 0,
        },
        selectSettings: this.productValues$.pipe(map((products) => {
          return {
            panelClass: 'mat-select-dark',
            options: products,
          };
        })),
      },
      {
        name: 'industry',
        type: 'select',
        fieldSettings: {
          classList: 'col-xs-12 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('companyDetails.industry') >= 0,
        },
        selectSettings: this.industryValues$.pipe(map((industries) => {
          return {
            panelClass: 'mat-select-dark',
            options: industries,
          };
        })),
      },
      {
        name: 'urlWebsite',
        type: 'input',
        fieldSettings: {
          required: requiredFields.indexOf('companyDetails.urlWebsite') >= 0,
          classList: 'col-xs-12 opacity-03 form-fieldset-field-padding-24',
        },
      },
      {
        name: 'foundationYear',
        type: 'input',
        fieldSettings: {
          required: requiredFields.indexOf('companyDetails.foundationYear') >= 0,
          classList: 'col-xs-12 opacity-03 form-fieldset-field-padding-24',
        },
        inputSettings: {
          type: InputType.Number,
        },
      },
    ];

    return { form: this.form, formSchemeFields: formSchemeFields };
  }

  onUpdateFormData(toggleControl: (name: string, enable: boolean) => void, formValues: CompanyFormInterface) {
    toggleControl('companyDetails.industry', formValues.companyDetails && !!formValues.companyDetails.product);
    this.updateIndustryValues(formValues.companyDetails.product);
  }

  private updateIndustryValues(product: string): void {
    if (product && this.productWithIndustries) {
      this.industryValues$.next(this.productWithIndustries.find(prod =>
        prod.code === product).industries.map((industry) => {
        return {
          value: industry.code,
          label: this.translate('industry', industry.code),
        };
      }));
    }
  }

  private getLegalFormList(): SelectOptionInterface[] {
    return [
      { value: 'LEGAL_FORM_AG', label: this.translate('legalForm', 'LEGAL_FORM_AG') },
      { value: 'LEGAL_FORM_EINZELUNTERN', label: this.translate('legalForm', 'LEGAL_FORM_EINZELUNTERN') },
      { value: 'LEGAL_FORM_GBR', label: this.translate('legalForm', 'LEGAL_FORM_GBR') },
      { value: 'LEGAL_FORM_GMBH', label: this.translate('legalForm', 'LEGAL_FORM_GMBH') },
      { value: 'LEGAL_FORM_KG', label: this.translate('legalForm', 'LEGAL_FORM_KG') },
      { value: 'LEGAL_FORM_OHG', label: this.translate('legalForm', 'LEGAL_FORM_OHG') },
      { value: 'LEGAL_FORM_SONSTIGES', label: this.translate('legalForm', 'LEGAL_FORM_SONSTIGES') },
      { value: 'LEGAL_FORM_UG', label: this.translate('legalForm', 'LEGAL_FORM_UG') },
      { value: 'LEGAL_FORM_EK', label: this.translate('legalForm', 'LEGAL_FORM_EK') },
      { value: 'LEGAL_FORM_EV', label: this.translate('legalForm', 'LEGAL_FORM_EV') },
      { value: 'LEGAL_FORM_EG', label: this.translate('legalForm', 'LEGAL_FORM_EG') },
    ];
  }

  private translate(field: string, key: string): string {
    return this.translateService.translate(`user_business_form.form.companyDetails.${field}.options.${key}`);
  }

  private getYearValidator(): any { // TODO Type
    return (control: AbstractControl): {} => {
      const year = parseInt(control.value, 10);

      return control.value === '' || (year > 1800 && year <= (new Date()).getFullYear()) ? null : {
        pattern: {
          valid: false,
        },
      };
    };
  }
}
