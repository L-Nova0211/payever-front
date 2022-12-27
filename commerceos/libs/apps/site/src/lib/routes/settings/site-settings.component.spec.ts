import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AppThemeEnum, EnvService, MessageBus } from '@pe/common';
import { TranslatePipe, TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';

import { SiteEnvService } from '../../services/site-env.service';
import { PebSitesApi } from '../../services/site/abstract.sites.api';

import { PebSiteSettingsComponent } from './site-settings.component';


describe('PebSiteSettingsComponent', () => {

  let fixture: ComponentFixture<PebSiteSettingsComponent>;
  let component: PebSiteSettingsComponent;
  let api: jasmine.SpyObj<PebSitesApi>;
  let route: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let envService: jasmine.SpyObj<SiteEnvService>;

  beforeEach(async(() => {

    const apiSpy = jasmine.createSpyObj<PebSitesApi>('PebSitesApi', [
      'patchIsLive',
      'markSiteAsDefault',
      'getSiteList',
    ]);

    const routeMock = {
      snapshot: {
        params: {
          siteId: 'site-001',
        },
        parent: {
          parent: {
            data: {
              site: undefined,
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

    TestBed.configureTestingModule({
      declarations: [
        PebSiteSettingsComponent,
        TranslatePipe,
      ],
      providers: [
        { provide: PebSitesApi, useValue: apiSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: EnvService, useValue: envServiceMock },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebSiteSettingsComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebSitesApi) as jasmine.SpyObj<PebSitesApi>;
      route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      envService = TestBed.inject(SiteEnvService);

    });

  }));

  it('should be defined', () => {

    const cdrSpy = {
      markForCheck: jasmine.createSpy('markForCheck'),
    } as any;
    const getSiteListSpy = spyOn(component, 'getSiteList').and.returnValue(of([]));

    fixture.detectChanges();

    // w/o businessDatayb
    expect(component).toBeDefined();
    expect(getSiteListSpy).toHaveBeenCalled();
    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/o businessData.themeSettings
    envService.businessData = {
      themeSettings: undefined,
    } as any;

    component = new PebSiteSettingsComponent(
      api,
      route,
      overlay,
      messageBus,
      cdrSpy,
      envService,
    );

    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/ themeSettings
    envService.businessData.themeSettings = {
      theme: AppThemeEnum.light,
    };

    component = new PebSiteSettingsComponent(
      api,
      route,
      overlay,
      messageBus,
      cdrSpy,
      envService,
    );

    expect(component.theme).toEqual(AppThemeEnum.light);

  });

  it('should toggle site live', () => {

    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const event = { test: true };

    api.patchIsLive.and.returnValue(of({
      isLive: true,
    }) as any);

    component.openedSite = { id: 'site-001', accessConfig: undefined };
    component.toggleSiteLive(event);

    expect(api.patchIsLive).toHaveBeenCalledWith('site-001', event as any);
    expect(component.openedSite.accessConfig).toEqual({ isLive: true });
    expect(component.isLive).toBe(true);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should update site list, emit message and open overlay on init', () => {

    const getSiteListSpy = spyOn(component, 'getSiteList').and.returnValue(of([]));
    const openSpy = spyOn(component, 'openOverlay');

    component.ngOnInit();
    component.onSavedSubject$.next({
      updateSiteList: true,
      openSite: true,
      connectExisting: true,
      site: { id: 'site-001' },
    });

    expect(getSiteListSpy).toHaveBeenCalledTimes(2);
    expect(openSpy).toHaveBeenCalled();
    expect(route.snapshot.parent.parent.data).toEqual({ site: { id: 'site-001' } });
    expect(messageBus.emit).toHaveBeenCalledWith('site.navigate.dashboard', 'site-001');

  });

  it('should handle site click', () => {

    const site = {
      id: 'site-001',
      isDefault: true,
    };
    const getSiteListSpy = spyOn(component, 'getSiteList').and.returnValue(of([]));

    api.markSiteAsDefault.and.returnValue(of(site) as any);

    // isDefault = TRUE
    component.onSiteClick(site);

    expect(api.markSiteAsDefault).not.toHaveBeenCalled();
    expect(getSiteListSpy).not.toHaveBeenCalled();

    // isDefault = FALSE
    site.isDefault = false;

    component.onSiteClick(site);

    expect(api.markSiteAsDefault).toHaveBeenCalledWith('site-001');
    expect(getSiteListSpy).toHaveBeenCalled();

  });

  it('should get site list', () => {

    const siteList = [
      { id: 'site-001', accessConfig: { isLive: true } },
      { id: 'site-002', accessConfig: { isLive: false } },
    ];
    const markSpy = spyOn(component[`cdr`], 'markForCheck');

    api.getSiteList.and.returnValue(of(siteList) as any);

    component.getSiteList().subscribe();

    expect(component.siteList).toEqual(siteList);
    expect(component.openedSite).toEqual(siteList[0]);
    expect(component.isLive).toBe(true);
    expect(markSpy).toHaveBeenCalled();

  });

  it('should open overlay', () => {

    const site = { id: 'site-001' };
    const item = {
      component: { test: true },
      header: 'test',
    };
    const theme = { id: 'theme-001' };
    let refConfig: any;

    component.openedSite = site;
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
    expect(refConfig.component).toEqual(item.component);
    expect(refConfig.headerConfig.title).toEqual('test');
    expect(refConfig.headerConfig.backBtnTitle).toEqual('Cancel');
    expect(refConfig.headerConfig.doneBtnTitle).toEqual('Done');
    expect(overlay.close).toHaveBeenCalled();

    // w/ itemData
    component.openOverlay(item, site);

  });

});
