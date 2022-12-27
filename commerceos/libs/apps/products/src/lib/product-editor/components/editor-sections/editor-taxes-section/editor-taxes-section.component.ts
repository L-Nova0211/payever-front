import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import { ErrorBag, FormAbstractComponent, FormScheme, SelectOptionInterface } from '@pe/forms';

import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { ExternalError, TaxesSection, VatRateInterface } from '../../../../shared/interfaces/section.interface';
import { DEFAULT_VAT_RATE } from '../../../resolvers/vat-rates.resolver';
import { SectionsService, VatRatesApiService } from '../../../services';
import { CountryService } from '../../../services/country.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'taxes-section',
  templateUrl: 'editor-taxes-section.component.html',
  styleUrls: ['editor-taxes-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ErrorBag],
})
export class EditorTaxesSectionComponent extends FormAbstractComponent<TaxesSection> implements OnInit {
  @Input() externalError: Subject<ExternalError>;

  readonly section: ProductEditorSections = ProductEditorSections.Taxes;
  taxesSection: TaxesSection = this.sectionsService.taxesSection;
  formScheme: FormScheme;
  formTranslationsScope = 'taxesSection.form';
  ratesOptions: SelectOptionInterface[] = [];

  protected formStorageKey = 'taxesSection.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag,
    private sectionsService: SectionsService,
    private route: ActivatedRoute,
    private countryService: CountryService,
    private vatRatesService: VatRatesApiService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    const ratesList: VatRateInterface[] = this.route.snapshot.data.vatRates;
    this.setRatesList(ratesList);

    this.ratesOptions = ratesList.map((rate) => {
      return {
        label: `${rate.description} ${rate.rate}%`,
        value: rate.rate,
      };
    });

    this.countryService.country$.pipe(
      skip(1),
      switchMap((country) => {
        return this.vatRatesService.getVatRates(country.code).pipe(
          map((rates: VatRateInterface[]) => {
            if (rates.length === 0) {
              return [DEFAULT_VAT_RATE];
            }

            return rates;
          }),
        );
      }),
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (rates) => {
        this.setRatesList(rates);
        this.updateForm();
      },
    });
  }

  protected createForm(initialData: TaxesSection): void {
    const data: TaxesSection = this.sectionsService.taxesSection;

    this.form = this.formBuilder.group({
      vatRate: [data.vatRate || this.ratesOptions[0].value],
    });

    this.countryService.updatedCountry$.pipe(
      tap(() => {
        this.taxesSection = this.sectionsService.taxesSection;
        this.form.get('vatRate').setValue(this.taxesSection.vatRate);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: TaxesSection): void {
    this.sectionsService.onChangeTaxesSection(formValues);
  }

  protected onSuccess(): void {
    this.sectionsService.onFindError(false, this.section);
  }

  protected onFormInvalid(): void {
    this.sectionsService.onFindError(true, this.section);
  }

  private setRatesList(ratesList: VatRateInterface[]): void {
    this.ratesOptions = ratesList.map((rate) => {
      const { rate: value, description } = rate;

      return {
        label: `${description} ${value}%`,
        value,
      };
    });

    this.changeDetectorRef.detectChanges();
  }

  private updateForm():void {
    if (this.form) {
      const data: TaxesSection = this.sectionsService.taxesSection;

      this.form.get('vatRate').setValue(
        this.ratesOptions.find(item => item.value === data.vatRate)
          ? data.vatRate
          : this.ratesOptions[0].value
      );
    }

  }
}
