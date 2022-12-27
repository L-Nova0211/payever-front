import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PebShopsApi } from '@pe/builder-api';
import { MessageBus, PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';
import { TranslatePipe, TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';

import { PebShopSettingsComponent } from './shop-settings.component';

describe('PebShopSettingsComponent', () => {

  let fixture: ComponentFixture<PebShopSettingsComponent>;
  let component: PebShopSettingsComponent;
  let api: jasmine.SpyObj<PebShopsApi>;
  let route: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<PebEnvService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(waitForAsync(() => {

    const apiSpy = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', [
      'patchIsLive',
      'markShopAsDefault',
      'getShopsList',
    ]);

    const routeMock = {
      snapshot: {
        params: {
          shopId: 'shop-001',
        },
        parent: {
          parent: {
            data: {
              shop: undefined,
            },
          },
        },
      },
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
      'close',
      'open',
    ]);

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const envServiceMock = {
      businessData: undefined,
    };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    TestBed.configureTestingModule({
      declarations: [
        PebShopSettingsComponent,
        TranslatePipe,
      ],
      providers: [
        { provide: PebShopsApi, useValue: apiSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PebEnvService, useValue: envServiceMock },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebShopSettingsComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebShopsApi) as jasmine.SpyObj<PebShopsApi>;
      route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(PebEnvService);
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    });

  }));

  it('should be defined', () => {

    const cdrSpy = {
      markForCheck: jasmine.createSpy('markForCheck'),
    } as any;
    const getShopListSpy = spyOn(component, 'getShopList').and.returnValue(of([]));

    fixture.detectChanges();

    // w/o businessData
    expect(component).toBeDefined();
    expect(getShopListSpy).toHaveBeenCalled();
    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/o businessData.themeSettings
    envService.businessData = {
      themeSettings: undefined,
    } as any;

    component = new PebShopSettingsComponent(
      api,
      route,
      overlay,
      messageBus,
      cdrSpy,
      envService,
      translateService,
    );

    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/ themeSettings
    envService.businessData.themeSettings = {
      theme: AppThemeEnum.light,
    };

    component = new PebShopSettingsComponent(
      api,
      route,
      overlay,
      messageBus,
      cdrSpy,
      envService,
      translateService,
    );

    expect(component.theme).toEqual(AppThemeEnum.light);

  });

  it('should toggle shop live', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const event = { test: true };

    api.patchIsLive.and.returnValue(of({
      isLive: true,
    }) as any);

    component.openedShop = { id: 'shop-001', accessConfig: undefined };
    component.toggleShopLive(event);

    expect(api.patchIsLive).toHaveBeenCalledWith('shop-001', event as any);
    expect(component.openedShop.accessConfig).toEqual({ isLive: true });
    expect(component.isLive).toBe(true);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should update shop list, emit message and open overlay on init', () => {

    const getShopListSpy = spyOn(component, 'getShopList').and.returnValue(of([]));
    const openSpy = spyOn(component, 'openOverlay');

    component.ngOnInit();
    component.onSavedSubject$.next({
      updateShopList: true,
      openShop: true,
      connectExisting: true,
      shop: { id: 'shop-001' },
    });

    expect(getShopListSpy).toHaveBeenCalledTimes(2);
    expect(openSpy).toHaveBeenCalled();
    expect(route.snapshot.parent.parent.data).toEqual({ shop: { id: 'shop-001' } });
    expect(messageBus.emit).toHaveBeenCalledWith('shop.navigate.dashboard', 'shop-001');

  });

  it('should handle shop click', () => {

    const shop = {
      id: 'shop-001',
      isDefault: true,
    };
    const getShopListSpy = spyOn(component, 'getShopList').and.returnValue(of([]));

    api.markShopAsDefault.and.returnValue(of(shop));

    // isDefault = TRUE
    component.onShopClick(shop);

    expect(api.markShopAsDefault).not.toHaveBeenCalled();
    expect(getShopListSpy).not.toHaveBeenCalled();

    // isDefault = FALSE
    shop.isDefault = false;

    component.onShopClick(shop);

    expect(api.markShopAsDefault).toHaveBeenCalledWith('shop-001');
    expect(getShopListSpy).toHaveBeenCalled();

  });

  it('should get shop list', () => {

    const shopList = [
      { id: 'shop-001', accessConfig: { isLive: true } },
      { id: 'shop-002', accessConfig: { isLive: false } },
    ];
    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    api.getShopsList.and.returnValue(of(shopList));

    component.getShopList().subscribe();

    expect(component.shopList).toEqual(shopList);
    expect(component.openedShop).toEqual(shopList[0]);
    expect(component.isLive).toBe(true);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should open overlay', () => {

    const shop = { id: 'shop-001' };
    const item = {
      component: { test: true },
      header: 'test',
    };
    const theme = { id: 'theme-001' };
    let refConfig: any;

    component.openedShop = shop;
    component.theme = theme;

    overlay.open.and.callFake((config) => {
      refConfig = config;

      return {} as any;
    });

    // w/o itemData
    component.openOverlay(item);
    refConfig.headerConfig.backBtnCallback();
    refConfig.headerConfig.cancelBtnCallback();
    refConfig.headerConfig.doneBtnCallback();

    expect(overlay.open).toHaveBeenCalled();
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(refConfig.component).toEqual(item.component);
    expect(refConfig.headerConfig.title).toEqual('translated');
    expect(refConfig.headerConfig.backBtnTitle).toEqual('translated');
    expect(refConfig.headerConfig.doneBtnTitle).toEqual('translated');
    expect(overlay.close).toHaveBeenCalled();

    // w/ itemData
    component.openOverlay(item, shop);

  });

});
