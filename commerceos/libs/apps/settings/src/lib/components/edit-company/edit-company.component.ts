import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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

import { ApiService, CoreConfigService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCompanyComponent extends AbstractComponent implements OnInit {
  employees = [];
  sales = [];
  products = [];
  industry = [];
  legalForms = [];
  theme;
  data;
  companyForm: FormGroup;
   constructor(
     @Inject(PE_OVERLAY_DATA) public overlayData: any,
     @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
     @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
     private formBuilder: FormBuilder,
     private apiService: ApiService,
     private peOverlayRef: PeOverlayRef,
     private cdr: ChangeDetectorRef,
     private coreConfigService: CoreConfigService,
     private translateService: TranslateService,
     ) {
     super();
   }

   ngOnInit(): void {
     this.theme = this.overlayConfig.theme;
     this.sales = this.getRangeFromConst(this.coreConfigService.SALES, 'sales');
     this.employees = this.getRangeFromConst(this.coreConfigService.EMPLOYEES, 'employees');
     this.industry = this.getListFromConst(this.coreConfigService.INDUSTRY_SECTORS, 'industry');
     this.products = this.getListFromConst(this.coreConfigService.PRODUCTS, 'product');
     this.legalForms = this.getListFromConst(this.coreConfigService.LEGAL_FORMS, 'legal_form');
     this.companyForm =  this.formBuilder.group({
       legalForm: [this.legalForms],
       salesRange: [this.sales],
       industry: [this.industry],
       product: [this.products],
       employeesRange: [this.employees],
       urlWebsite: [''],
     });
     if (this.overlayData.data.details) {
       this.data = this.overlayData.data.business;
       const details = this.overlayData.data.details.companyDetails;
       details.salesRange = `${details.salesRange?.min},${details.salesRange?.max}`;
       details.employeesRange = `${details.employeesRange?.min},${details.employeesRange?.max}`;
       this.companyForm.patchValue(details);
     }
     this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
       this.onCheckValidity();
     });
   }

  onCheckValidity() {
    const value = this.companyForm.controls;

    value.legalForm.setValidators([Validators.required]);
    value.legalForm.updateValueAndValidity();

    value.salesRange.setValidators([Validators.required]);
    value.salesRange.updateValueAndValidity();

    value.product.setValidators([Validators.required]);
    value.product.updateValueAndValidity();

    value.employeesRange.setValidators([Validators.required]);
    value.employeesRange.updateValueAndValidity();

    value.industry.setValidators([Validators.required]);
    value.industry.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.companyForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.companyForm.valid) {
      this.data['businessDetail'] = { companyDetails: this.companyForm.value };
      const sales = this.sales.find(val => val.value === this.data.businessDetail.companyDetails.salesRange);
      this.data.businessDetail.companyDetails.salesRange = { min: sales?.min, max: sales?.max };
      const employees =
        this.employees.find(val => val.value === this.data.businessDetail.companyDetails.employeesRange);
      this.data.businessDetail.companyDetails.employeesRange = { min: employees?.min, max: employees?.max };
      this.peOverlayRef.close({ data: this.data });
    }
  }

  getListFromConst(array, translateKey) {
     return array?.map((field: any) => {
       return {
         value: field.hasOwnProperty('label') ? field.label : field,
         label: this.translateService.translate(
           `assets.${translateKey}.${field.hasOwnProperty('label') ? field.label : field}`
         ),
       };
     });
  }

  getRangeFromConst(array, translateKey) {
    return array?.map((field: any) => {
      return {
        value: `${field?.min},${field?.max}`,
        label: this.translateService.translate(`assets.${translateKey}.${field.label}`),
        min: field?.min,
        max: field?.max,
      };
    });
  }
}
