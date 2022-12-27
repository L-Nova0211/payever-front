import { Compiler, NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EMPTY, of, Subject } from 'rxjs';

import { EnvService, PeDestroyService, NavigationService } from '@pe/common';
import { ConnectModule } from '@pe/apps/connect';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';

import { PosApi } from '../../services/pos/abstract.pos.api';
import { PosEnvService } from '../../services/pos/pos-env.service';

import { PebTerminalConnectComponent } from './pos-connect.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

describe('PebTerminalConnectComponent', () => {

  let fixture: ComponentFixture<PebTerminalConnectComponent>;
  let component: PebTerminalConnectComponent;
  let envService: jasmine.SpyObj<PosEnvService>;
  let api: jasmine.SpyObj<PosApi>;
  let navigationService: jasmine.SpyObj<NavigationService>;
  let compiler: jasmine.SpyObj<Compiler>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let overlayService: jasmine.SpyObj<PeOverlayWidgetService>;
  let router: any;

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject<void>();

    const apiSpy = jasmine.createSpyObj<PosApi>('PosApi', [
      'toggleTerminalIntegration',
      'getTerminalEnabledIntegrations',
      'getIntegrationsInfo',
    ]);
    apiSpy.getIntegrationsInfo.and.returnValue(of([]));
    apiSpy.getTerminalEnabledIntegrations.and.returnValue(EMPTY);

    const compilerSpy = jasmine.createSpyObj<Compiler>('Compiler', ['compileModuleAsync']);

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    const navigationServiceSpy = jasmine.createSpyObj<NavigationService>('NavigationService', ['saveReturn']);

    const overlayServiceSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
      'open',
      'close',
    ]);

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);
    translateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);

    envService = {
      posId: 'pos-001',
      businessId: 'b-001',
      businessData: null,
    } as any;

    TestBed.configureTestingModule({
      declarations: [
        PebTerminalConnectComponent,
        TranslatePipeMock,
      ],
      providers: [
        { provide: PosApi, useValue: apiSpy },
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: Compiler, useValue: compilerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: PeOverlayWidgetService, useValue: overlayServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: EnvService, useValue: envService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebTerminalConnectComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PosApi) as jasmine.SpyObj<PosApi>;
      navigationService = TestBed.inject(NavigationService) as jasmine.SpyObj<NavigationService>;
      compiler = TestBed.inject(Compiler) as jasmine.SpyObj<Compiler>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
      overlayService = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      router = TestBed.inject(Router);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theme on construct', () => {

    /**
     * envService.businessData is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null };

    fixture = TestBed.createComponent(PebTerminalConnectComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: 'light' };

    fixture = TestBed.createComponent(PebTerminalConnectComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('light');

  });

  it('should init current terminal on init', () => {

    const initSpy = spyOn(component, 'initCurrentTerminal');

    component.ngOnInit();

    expect(initSpy).toHaveBeenCalled();

  });

  it('should handle toggle integration', () => {

    const toggleSpy = spyOn(component, 'toggleTerminalIntegration').and.returnValue(of(null));
    const initSpy = spyOn(component, 'initCurrentTerminal');
    const integrationMock = {
      integration: {
        name: 'Integration 1',
      },
    };

    component.onToggleIntegration(integrationMock as any);

    expect(toggleSpy).toHaveBeenCalledWith(envService.posId, integrationMock.integration.name, true);
    expect(initSpy).toHaveBeenCalled();

  });

  it('should toggle terminal integration', () => {

    api.toggleTerminalIntegration.and.returnValue(of(null));

    component.toggleTerminalIntegration('pos-001', 'Integration 1', true).subscribe();

    expect(api.toggleTerminalIntegration).toHaveBeenCalledWith(
      envService.businessId,
      'pos-001',
      'Integration 1',
      true,
    );

  });

  it('should handle integration open button clicked', () => {

    const preloadSpy = spyOn<any>(component, 'preloadConnectMicro').and.returnValue(of(null));
    const initSpy = spyOn<any>(component, 'initModal');
    const integrationMock = {
      integration: {
        name: 'qr',
        category: 'category',
      },
    };

    /**
     * integration.name is 'qr'
     */
    component.clickedIntegrationOpenButton(integrationMock as any);

    expect(preloadSpy).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();

    /**
     * integration.name is 'test'
     */
    integrationMock.integration.name = 'test';
    initSpy.calls.reset();

    component.clickedIntegrationOpenButton(integrationMock as any);

    expect(initSpy).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([
      `business/${envService.businessId}/pos/${envService.posId}/connect-app-edit/${integrationMock.integration.category}/${integrationMock.integration.name}`,
    ]);

  });

  it('should handle integration add button click', () => {

    const preloadSpy = spyOn<any>(component, 'preloadConnectMicro').and.returnValue(of(null));

    router.url = 'url/test';

    component.clickedIntegrationAddButton();

    expect(preloadSpy).toHaveBeenCalled();
    expect(navigationService.saveReturn).toHaveBeenCalledWith('url/test');
    expect(router.navigate).toHaveBeenCalledWith([`/business/${envService.businessId}/connect`], {
      queryParams: { integrationName: 'communications' },
    });

  });

  it('should preload connection info', fakeAsync(() => {

    compiler.compileModuleAsync.and.resolveTo(true as any);

    component[`preloadConnectMicro`]().subscribe(result => expect(result).toBe(true));

    flushMicrotasks();

    expect(compiler.compileModuleAsync).toHaveBeenCalledWith(ConnectModule);

  }));

  it('should init current terminal', () => {

    const list = ['test 1', 'test 2'];
    const nextSpy = spyOn(component.enabledIntegrations$, 'next');

    api.getTerminalEnabledIntegrations.and.returnValue(of(list));

    component.initCurrentTerminal();

    expect(api.getTerminalEnabledIntegrations).toHaveBeenCalledWith(envService.businessId, envService.posId);
    expect(nextSpy).toHaveBeenCalledWith(list);

  });

  it('should get category installed integrations info', () => {

    let category: string | string[] = 'test';
    const integrations = [
      {
        installed: true,
        integration: { category: 'not-test' },
      },
      {
        installed: false,
        integration: { category: 'test' },
      },
      {
        installed: true,
        integration: { category: 'test 2' },
      },
    ];

    /**
     * typeof argument category is string
     * api.getIntegrationsInfo returns null
     */
    api.getIntegrationsInfo.and.returnValue(of(null));

    component.getCategoryInstalledIntegrationsInfo(category as any).subscribe(result => expect(result).toBeNull());

    expect(api.getIntegrationsInfo).toHaveBeenCalledWith(envService.businessId);

    /**
     * typeof argument category is array of strings
     * api.getIntegrationsInfo returns mocked data
     */
    category = ['test', 'test 2'];
    api.getIntegrationsInfo.and.returnValue(of(integrations) as any);

    component.getCategoryInstalledIntegrationsInfo(category as any).subscribe(result => expect(result).toEqual([integrations[2]] as any));

  });

  it('should init modal', () => {

    const dialogRef = { test: 'dialog' };

    overlayService.open.and.returnValue(dialogRef as any);

    component[`initModal`]();

    expect(overlayService.open).toHaveBeenCalled();
    const config = overlayService.open.calls.argsFor(0)[0];
    expect(config).toBeDefined();
    expect(config.data).toEqual({});
    expect(config.hasBackdrop).toBe(true);
    expect(config.backdropClass).toEqual('channels-modal');
    expect(config.headerConfig.title).toEqual('pos-app.connect.qr.title.translated');
    expect(config.headerConfig.backBtnTitle).toEqual('pos-app.actions.cancel.translated');
    expect(config.headerConfig.doneBtnTitle).toEqual('pos-app.actions.done.translated');
    expect(config.headerConfig.theme).toEqual('dark');
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'pos-app.connect.qr.title',
      'pos-app.actions.cancel',
      'pos-app.actions.done',
    ]);

    /**
     * test config.headerConfig.backBtnCallback
     */
    config.headerConfig.backBtnCallback();

    expect(overlayService.close).toHaveBeenCalled();

    /**
     * test config.headerConfig.doneBtnCallback
     */
    overlayService.close.calls.reset();

    config.headerConfig.doneBtnCallback();

    expect(overlayService.close).toHaveBeenCalled();

  });

});
