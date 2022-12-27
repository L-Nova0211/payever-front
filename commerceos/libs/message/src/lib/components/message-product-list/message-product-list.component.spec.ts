import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';

import { PeDataGridLayoutType } from '@pe/common';
import { PeDataGridService, PeDataGridSidebarService } from '@pe/data-grid';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageApiService } from '../../services';

import { PeMessageProductListComponent } from './message-product-list.component';

describe('PeMessageProductListComponent', () => {

  let fixture: ComponentFixture<PeMessageProductListComponent>;
  let component: PeMessageProductListComponent;
  let peDataGridService: jasmine.SpyObj<PeDataGridService>;
  let peDataGridSidebarService: jasmine.SpyObj<PeDataGridSidebarService>;
  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;
  let localeConstantsService: jasmine.SpyObj<LocaleConstantsService>;
  let mediaUrlPipe: jasmine.SpyObj<MediaUrlPipe>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let peOverlayConfig: any;

  beforeEach(waitForAsync(() => {

    const localeConstantsServiceSpy = jasmine.createSpyObj<LocaleConstantsService>('LocaleConstantsService', {
      getLocaleId: 'en-US',
    });

    const mediaUrlPipeSpy = jasmine.createSpyObj<MediaUrlPipe>('MediaUrlPipe', {
      transform: 'transformed',
    });

    const peDataGridServiceMock = {
      setSelected$: {
        next: jasmine.createSpy('next'),
      },
    };

    const peDataGridSidebarServiceMock = {
      detectChange$: {
        next: jasmine.createSpy('next'),
      },
    };

    const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', {
      getProductList: EMPTY,
    });

    const peOverlayConfigMock = {
      onSaveSubject$: {
        next: jasmine.createSpy('next'),
      },
    };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    TestBed.configureTestingModule({
      declarations: [PeMessageProductListComponent],
      providers: [
        { provide: LocaleConstantsService, useValue: localeConstantsServiceSpy },
        { provide: MediaUrlPipe, useValue: mediaUrlPipeSpy },
        { provide: PeDataGridService, useValue: peDataGridServiceMock },
        { provide: PeDataGridSidebarService, useValue: peDataGridSidebarServiceMock },
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PE_OVERLAY_DATA, useValue: {} },
        { provide: PE_OVERLAY_CONFIG, useValue: peOverlayConfigMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageProductListComponent);
      component = fixture.componentInstance;

      peDataGridService = TestBed.inject(PeDataGridService) as jasmine.SpyObj<PeDataGridService>;
      peDataGridSidebarService = TestBed.inject(PeDataGridSidebarService) as jasmine.SpyObj<PeDataGridSidebarService>;
      peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
      localeConstantsService = TestBed.inject(LocaleConstantsService) as jasmine.SpyObj<LocaleConstantsService>;
      mediaUrlPipe = TestBed.inject(MediaUrlPipe) as jasmine.SpyObj<MediaUrlPipe>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
      peOverlayConfig = TestBed.inject(PE_OVERLAY_CONFIG);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    const products = [
      {
        _id: 'prod-001',
        images: ['image1.jpg'],
        title: 'Product 1',
        currency: null,
        price: 13,
        stock: null,
        categories: null,
        variantCount: 1,
      },
      {
        _id: 'prod-002',
        images: ['image2.jpg'],
        title: 'Product 2',
        currency: 'USD',
        price: 100,
        stock: 10,
        categories: [{ title: 'Category 1' }, { title: 'Category 2' }],
        variantCount: null,
      },
    ];
    const detectSpy = spyOn(component[`changeDetectionRef`], 'detectChanges');

    peMessageApiService.getProductList.and.returnValue(of(products));

    component.loading = false;
    component.ngOnInit();

    expect(peDataGridService.setSelected$.next).toHaveBeenCalledWith([]);
    expect(peMessageApiService.getProductList).toHaveBeenCalled();
    expect(localeConstantsService.getLocaleId).toHaveBeenCalled();
    expect(component.loading).toBe(true);
    expect(detectSpy).toHaveBeenCalled();
    expect(translateService.translate).toHaveBeenCalledTimes(products.length * 2);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.product-list.in_stock',
      'message-app.sidebar.add',
      'message-app.product-list.in_stock',
      'message-app.sidebar.add',
    ]);

    component.items.forEach((item, index) => {
      const product = products[index];
      const { id, image, title, subtitle, description, customFields, selected, actions } = item;

      expect(id).toEqual(product._id);
      expect(image).toEqual('transformed');
      expect(title).toEqual(product.title);
      expect(subtitle).toEqual(index === 0 ? '€13.00' : '$100.00');
      expect(description).toEqual(index === 0 ? '0 translated' : '10 translated');
      expect(customFields).toEqual([
        { content: index === 0 ? undefined : 'Category 1/Category 2' },
        { content: index === 0 ? '€13.00' : '$100.00' },
        { content: index === 0 ? '1 / 0' : '0 / 10' },
      ]);
      expect(selected).toBe(true);
      expect(JSON.stringify(actions)).toEqual(JSON.stringify([{
        label: 'translated',
        callback: (id: string) => {
          peOverlayConfig.onSaveSubject$.next([id]);
        },
      }]));
      expect(mediaUrlPipe.transform).toHaveBeenCalledWith(product.images[0], 'products', 'grid-thumbnail' as any);

      actions?.[0].callback(id);
      expect(peOverlayConfig.onSaveSubject$.next).toHaveBeenCalledWith([id]);
    });

  });

  it('should handle close', () => {

    component.onClose();

    expect(peOverlayConfig.onSaveSubject$.next).toHaveBeenCalledWith([]);

  });

  it('should handle add', () => {

    component.selectedItems = ['prod-001'];
    component.onAdd();

    expect(peOverlayConfig.onSaveSubject$.next).toHaveBeenCalledWith(['prod-001']);

  });

  it('should handle multiple selected items changed', () => {

    const selectedItems = ['prod-001', 'prod-002'];

    component.selectedItems = [];
    component.onMultipleSelectedItemsChanged(selectedItems);

    expect(component.selectedItems).toEqual(selectedItems);

  });

  it('should handle layout type changed', fakeAsync(() => {

    /**
     * argument layout is 'list'
     */
    component.onLayoutTypeChanged(PeDataGridLayoutType.List);

    expect(peDataGridSidebarService.detectChange$.next).not.toHaveBeenCalled();

    /**
     * argument layout is 'grid'
     */
    component.onLayoutTypeChanged(PeDataGridLayoutType.Grid);

    tick();

    expect(peDataGridSidebarService.detectChange$.next).toHaveBeenCalled();

  }));

});
