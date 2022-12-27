import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CountryArrayInterface, ErrorBag } from '@pe/forms';

import { BehaviorSubject, Subject } from 'rxjs';

import { ProductModel } from '../../../../shared/interfaces/product.interface';
import { VatRateInterface } from '../../../../shared/interfaces/section.interface';
import { SectionsService, VatRatesApiService } from '../../../services';
import { CountryService } from '../../../services/country.service';
import { EditorTaxesSectionComponent } from './editor-taxes-section.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {
  transform() {}
}

describe('EditorTaxesSectionComponent', () => {
  let component: EditorTaxesSectionComponent;
  let fixture: ComponentFixture<EditorTaxesSectionComponent>;
  let sectionsService: {
    taxesSection: {
      vatRate: number;
    };
    onChangeTaxesSection: jasmine.Spy;
    onFindError: jasmine.Spy;
  };
  let activatedRoute: {
    snapshot: {
      data: {
        vatRates: VatRateInterface[];
      };
    };
  };
  let countryService: {
    country$: BehaviorSubject<CountryArrayInterface>;
    updatedCountry$: Subject<ProductModel>;
  };

  beforeEach(
    waitForAsync(() => {
      sectionsService = {
        taxesSection: {
          vatRate: 18,
        },
        onChangeTaxesSection: jasmine.createSpy('onChangeTaxesSection'),
        onFindError: jasmine.createSpy('onFindError'),
      };

      activatedRoute = {
        snapshot: {
          data: {
            vatRates: [
              {
                description: 'Rate description 1',
                rate: 1,
              },
              {
                description: 'Rate description 2',
                rate: 2,
              },
            ],
          },
        },
      };

      countryService = {
        country$: new BehaviorSubject({ code: 'de', name: 'Germany' }),
        updatedCountry$: new Subject(),
      };

      const vatRatesServiceSpy = jasmine.createSpyObj<VatRatesApiService>('VatRatesApiService', ['getVatRates']);

      TestBed.configureTestingModule({
        declarations: [EditorTaxesSectionComponent, TranslatePipeMock],
        providers: [
          FormBuilder,
          { provide: ErrorBag, useValue: null },
          { provide: SectionsService, useValue: sectionsService },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: CountryService, useValue: countryService },
          { provide: VatRatesApiService, useValue: vatRatesServiceSpy },
          { provide: 'FORM_DATE_ADAPTER', useValue: null },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(EditorTaxesSectionComponent);
          component = fixture.componentInstance;

          fixture.detectChanges();
        });
    }),
  );

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should init options for drop down', () => {
    const expectedLength = 2;

    expect(component.ratesOptions.length).toEqual(expectedLength);
    expect(component.ratesOptions[0].label).toBeDefined();
    expect(component.ratesOptions[0].value).toBeDefined();
  });

  it('onUpdateFormData should update data in section service', () => {
    sectionsService.onChangeTaxesSection.calls.reset();
    component.form.setValue({ vatRate: 2 });

    expect(sectionsService.onChangeTaxesSection).toHaveBeenCalledWith({ vatRate: 2 });
  });

  it('onSubmit should notify sectionService', () => {
    component.onSubmit();
    expect(sectionsService.onFindError).toHaveBeenCalled();
  });
});
