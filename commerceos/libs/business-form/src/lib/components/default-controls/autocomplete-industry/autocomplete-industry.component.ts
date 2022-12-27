import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { IndustryInterface, ProductWithIndustriesInterface } from '@pe/api';

import { FORM_ERRORS } from '../../../constants';
import { CreateBusinessFormIndustryOptionsInterface } from '../../../interfaces/business-form.interface';
import { BaseControlComponent } from '../base-control.component';

@Component({
  selector: 'pe-autocomplete-industry',
  templateUrl: './autocomplete-industry.component.html',
  styleUrls: ['../control-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteIndustryComponent extends BaseControlComponent implements OnInit {
  errors = FORM_ERRORS;
  initialIndustryLabel: string;
  private initialIndustrySlug: string;

  private industryOptionsSubject$ = new BehaviorSubject<CreateBusinessFormIndustryOptionsInterface[]>(null);
  industryOptions$ = this.industryOptionsSubject$.asObservable();

  private readonly OTHER_INDUSTRY_CODES = {
    PRODUCT_CODE: 'BUSINESS_PRODUCT_OTHERS',
    INDUSTRY_CODE: 'BRANCHE_OTHER',
  };

  ngOnInit(): void {
    this.initialIndustrySlug = (this.route.snapshot.params.industry || '').toLowerCase();

    this.setIndustriesOptions(this.businessRegistrationData.products);
    this.updateValues();
  }

  private updateValues(): void {
    this.control.valueChanges.pipe(
      tap((value) => {
        this.control.setValue(value?.value, { emitEvent: false });
        if (this.controlScheme?.relativeField) {
          this.form.get(this.controlScheme.relativeField)?.setValue(value?.productCode, {
            emitEvent: false,
          })
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe()

  }

  private setIndustriesOptions(products: ProductWithIndustriesInterface[]): void {
    let initialIndustry: CreateBusinessFormIndustryOptionsInterface;
    this.industryOptionsSubject$.next(
      Array.prototype.concat.apply(
        [],
        products.map((product) => {
          const industries = product.industries.map((industry: IndustryInterface) => ({
            value: industry.code,
            slug: industry.code.replace('BRANCHE_', '').toLowerCase(),
            label: this.translateService.translate(`assets.industry.${industry.code}`),
            productCode: product.code,
            defaultBusinessStatus: industry?.defaultBusinessStatus,
          }));

          industries.every((industry) => {
            if (this.initialIndustrySlug === industry.slug) {
              initialIndustry = industry;
            }

            return true;
          });

          if (this.initialIndustrySlug && !initialIndustry) {
            industries.every((industry) => {
              if (
                this.initialIndustrySlug.indexOf(industry.slug) >= 0 ||
                industry.slug.indexOf(this.initialIndustrySlug) >= 0
              ) {
                initialIndustry = industry;
              }

              return true;
            });
          }

          return industries.filter((industry) => {
            return (
              industry.value !== this.OTHER_INDUSTRY_CODES.INDUSTRY_CODE ||
              product.code === this.OTHER_INDUSTRY_CODES.PRODUCT_CODE
            );
          });
        }),
      ),
    );

    if (initialIndustry) {
      this.control.setValue(initialIndustry);
      this.initialIndustryLabel = initialIndustry.label;
      if (initialIndustry.defaultBusinessStatus) {
        this.form.get('companyDetails.businessStatus')?.setValue(initialIndustry.defaultBusinessStatus);
      }
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    }
  }
}
