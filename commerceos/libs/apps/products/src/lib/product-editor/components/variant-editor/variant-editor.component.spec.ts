import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxsModule } from '@ngxs/store';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { PebEnvService } from '@pe/builder-core';
import { EnvService, MessageBus } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n';
import { LocaleService, SimpleLocaleConstantsService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';
import { PeDateTimePickerService } from '@pe/ui';

import { DataGridService } from '../../../products-list/services/data-grid/data-grid.service';
import { DialogService } from '../../../products-list/services/dialog-data.service';
import { ProductEditorSections } from '../../../shared/enums/product.enum';
import { VariantsSection } from '../../../shared/interfaces/section.interface';
import { ProductsApiService } from '../../../shared/services/api.service';
import { SectionsService, VariantStorageService } from '../../services';
import { ApiBuilderService } from '../../services/api-builder.service';
import { CountryService } from '../../services/country.service';
import { LanguageService } from '../../services/language.service';
import { initialState, VariantState } from '../../store';

import { VariantEditorComponent } from './variant-editor.component';

@Pipe({ name: 'translate' })
class TranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('VariantEditorComponent', () => {
  let component: VariantEditorComponent;
  let fixture: ComponentFixture<VariantEditorComponent>;
  const FORM_DATE_ADAPTER = 'FORM_DATE_ADAPTER';
  let activatedRouteMock: ActivatedRoute;
  let variantId: string;
  let variantsSection;
  let product;
  let routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

  const peDateTimePickerServiceSpy = jasmine.createSpyObj<PeDateTimePickerService>('PeDateTimePickerService', [
    'open',
  ]);

  let dialogRef = {
    afterClosed: of(),
  };
  peDateTimePickerServiceSpy.open.and.returnValue(dialogRef as any);

  const TranslateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', [
    'translate',
    'hasTranslation',
  ]);
  TranslateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);
  const simpleLocaleConstantsServiceSpy = jasmine.createSpyObj<SimpleLocaleConstantsService>(
    'SimpleLocaleConstantsService',
    ['getLang'],
  );
  simpleLocaleConstantsServiceSpy.getLang.and.callFake(() => `en`);

  const DialogServiceSpy = jasmine.createSpyObj<DialogService>('DialogService', ['open'], {
    confirmation$: of([], []),
  });

  const MessageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit', 'listen']);

  let sectionsServiceMock: SectionsService;

  let ProductsApiServiceSpy = jasmine.createSpyObj<ProductsApiService>('ProductsApiService', [
    'getRecommendations',
    'getProductRecommendations',
    'getContactsGroups',
    'getContacts',
  ]);

  let VariantStorageServiceSpy = jasmine.createSpyObj<VariantStorageService>('VariantStorageService', [
    'clearTemporaryData',
    'getVariantForm',
    'getVariantColors',
  ]);

  let ApiBuilderServiceSpy = jasmine.createSpyObj<ApiBuilderService>('ApiBuilderService', ['patchWidgetProducts']);

  const PeDataGridServiceMock = {
    setSelected$: {
      next: jasmine.createSpy('next'),
    },
  };

  activatedRouteMock = {
    snapshot: {
      queryParams: {},
      params: { variantId },
      parent: {
        params: { productId: '1' },
      },
      data: {
        isVariantEdit: true,
        product: { data: { product } },
      },
    },
  } as any;

  beforeEach(waitForAsync(() => {
    variantId = 'test-variant-id';

    product = {
      id: 'productId',
      barcode: 'barcode',
      description: 'description',
      sku: 'sku',
    } as any;

    variantsSection = {
      id: 'v-id',
      options: [],
      description: 'description',
      price: 123,
      salePrice: 100,
      onSales: true,
      sku: 'sku',
      inventory: 10,
      inventoryTrackingEnabled: false,
      barcode: 'barcode',
      images: [],
    };

    sectionsServiceMock = {
      removeVariant: () => true,
      onFindError: jasmine.createSpy(),
      onChangeInventorySection: jasmine.createSpy(),
      getVariantAsync: (_: string) => of(variantsSection),
      isSkuUniqAsync: (_: string) => () => of(null),
      setVariant: jasmine.createSpy(),
      setProduct: jasmine.createSpy(),
      saveClicked$: new Subject<ProductEditorSections | string>(),
      variantsChange$: new Subject<VariantsSection[]>(),
      resetState$: new Subject<boolean>(),
      variantsSection: [],
      mainSection: [],
      contentSection: [],
      getUrl: () => {
      },
      inventorySection: {
        sku: 'sku',
        barcode: 'barcode',
        inventory: 10,
        inventoryTrackingEnabled: false,
      },
    } as any;

    const localeServiceMock = {
      currentLocale$: new BehaviorSubject({
        code: 'en_US',
      }),
    };

    TestBed.configureTestingModule({
      declarations: [VariantEditorComponent, TranslatePipe],
      imports: [NgxsModule.forRoot([VariantState]), RouterTestingModule.withRoutes([])],
      providers: [
        VariantEditorComponent,
        TranslatePipe,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useFactory: () => activatedRouteMock },
        { provide: TranslateService, useValue: TranslateServiceSpy },
        { provide: SimpleLocaleConstantsService, useValue: simpleLocaleConstantsServiceSpy },
        { provide: SectionsService, useFactory: () => sectionsServiceMock },
        { provide: EnvService, useValue: {} },
        { provide: VariantStorageService, useValue: VariantStorageServiceSpy },
        { provide: MessageBus, useValue: MessageBusSpy },
        { provide: DialogService, useValue: DialogServiceSpy },
        { provide: PebEnvService, useValue: {} },
        { provide: FORM_DATE_ADAPTER, useValue: {} },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: ProductsApiService, useValue: ProductsApiServiceSpy },
        { provide: ApiBuilderService, useValue: ApiBuilderServiceSpy },
        { provide: SnackbarService, useValue: {} },
        { provide: PeDataGridService, useValue: PeDataGridServiceMock },
        { provide: DataGridService, useValue: {} },
        { provide: CountryService, useValue: {} },
        { provide: LanguageService, useValue: {} },
        { provide: PeDateTimePickerService, useValue: peDateTimePickerServiceSpy },
        { provide: LocaleService, useValue: localeServiceMock },
        provideMockStore({ initialState: { ...initialState, variant: { ...initialState.variant } } }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(VariantEditorComponent);
      component = fixture.componentInstance;
    });
  }));

  it('should be defined', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should remove temporary data from storage service on close', () => {
    component.close();

    expect(VariantStorageServiceSpy.clearTemporaryData).toHaveBeenCalled();
  });

  it('on done should call doSubmit', () => {
    const doSubmitSpy: jasmine.Spy = spyOn(component, 'doSubmit');

    component.done();
    expect(doSubmitSpy).toHaveBeenCalled();
  });

  it('#onToggleSale should set required validators when `onSales.checked` is true', () => {
    variantsSection.onSales = false;
    fixture.detectChanges();
    const setValidatorsSpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'setValidators');
    const updateValueAndValiditySpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'updateValueAndValidity');

    component.onToggleSale({ checked: true });
    expect(setValidatorsSpy).toHaveBeenCalled();

    const validators: any[] = setValidatorsSpy.calls.argsFor(0)[0]; // the first argument is validator array
    expect(validators).toContain(Validators.required);
    expect(updateValueAndValiditySpy).toHaveBeenCalled();
  });

  it('#onToggleSale should clear validators when `onSales.checked` is false', () => {
    variantsSection.onSales = true;
    fixture.detectChanges();
    const updateValueAndValiditySpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'updateValueAndValidity');

    component.onToggleSale({ checked: false });
    expect(updateValueAndValiditySpy).toHaveBeenCalled();
  });

  it('should open DatePicker', () => {
    fixture.detectChanges();

    expect(component.openDatepicker).toBeDefined();
    component.openDatepicker({ target: 'saleStartDate' }, 'saleStartDate');
    expect(peDateTimePickerServiceSpy.open).toHaveBeenCalled();
  });

  it('should add validator to salePrice if saleStartDate or saleEndDate is not empty', () => {
    fixture.detectChanges();
    component.form.controls.saleStartDate.setValue('2022-09-29');
    component.form.controls.saleEndDate.setValue('2022-09-30');
    const setValidatorSpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'setValidators');
    const updateValueAndValiditySpy: jasmine.Spy = spyOn(component.form.controls.salePrice, 'updateValueAndValidity');

    component.onSaleDateChange();
    expect(setValidatorSpy).toHaveBeenCalled();
    expect(updateValueAndValiditySpy).toHaveBeenCalled();
  });
});
