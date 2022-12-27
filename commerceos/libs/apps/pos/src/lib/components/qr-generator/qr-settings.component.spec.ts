import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, of, Subject } from 'rxjs';

import { EnvService, PeDestroyService, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { CustomChannelTypeEnum } from '../../services/pos.types';
import { PosApi } from '../../services/pos/abstract.pos.api';
import { PosConnectService } from '../../services/pos/pos-connect.service';
import { PosEnvService } from '../../services/pos/pos-env.service';

import { QRIntegrationComponent } from './qr-settings.component';
import * as tpfService from './third-party-form.service';

describe('QRIntegrationComponent', () => {

  let fixture: ComponentFixture<QRIntegrationComponent>;
  let component: QRIntegrationComponent;
  let envService: jasmine.SpyObj<PosEnvService>;
  let api: jasmine.SpyObj<PosApi>;
  let posConnectService: jasmine.SpyObj<PosConnectService>;
  let router: jasmine.SpyObj<Router>;
  let thirdPartyInternalFormServiceSpy: jasmine.Spy;

  beforeAll(() => {

    Object.defineProperty(tpfService, 'ThirdPartyInternalFormService', {
      value: tpfService.ThirdPartyInternalFormService,
      writable: true,
    });
    thirdPartyInternalFormServiceSpy = spyOn(tpfService, 'ThirdPartyInternalFormService');

  });

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject<void>();

    envService = {
      posId: 'pos-001',
      businessId: 'b-001',
      businessName: 'Business 1',
      businessData: null,
    } as any;

    const apiSpy = jasmine.createSpyObj<PosApi>('PosApi', {
      getConnectIntegrationInfo: EMPTY,
      getSinglePos: EMPTY,
    });

    const posConnectServiceMock = {
      integration$: {
        next: jasmine.createSpy('next'),
      },
      terminal$: {
        next: jasmine.createSpy('next'),
      },
      checkoutWrapperCustomerViewLink: 'link',
    };

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [QRIntegrationComponent],
      providers: [
        { provide: EnvService, useValue: envService },
        { provide: PosApi, useValue: apiSpy },
        { provide: HttpClient, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: PosConnectService, useValue: posConnectServiceMock },
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { test: 'activated.route' } },
        { provide: PE_ENV, useValue: {} },
      ],
    }).overrideComponent(QRIntegrationComponent, {
      set: { providers: [] },
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(QRIntegrationComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PosApi) as jasmine.SpyObj<PosApi>;
      posConnectService = TestBed.inject(PosConnectService) as jasmine.SpyObj<PosConnectService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

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
     * evnService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null };

    fixture = TestBed.createComponent(QRIntegrationComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: 'light' };

    fixture = TestBed.createComponent(QRIntegrationComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('light');

  });

  it('should handle ng init', () => {

    class MockClass { }

    const businessData = {
      name: 'Business 1',
      logo: 'logo.svg',
    };
    const terminal = { _id: 'pos-001' };
    const integration = { _id: 'i-001' };
    const markSpy = spyOn(component[`changeDetectorRef`], 'markForCheck');

    envService.businessData = businessData;
    api.getConnectIntegrationInfo.and.returnValue(of(integration) as any);
    api.getSinglePos.and.returnValue(of(terminal));
    thirdPartyInternalFormServiceSpy.and.returnValue(MockClass);

    component.thirdPartyService = null;
    component.ngOnInit();

    expect(component.business).toEqual(businessData);
    expect(api.getConnectIntegrationInfo).toHaveBeenCalledWith(CustomChannelTypeEnum.QR);
    expect(api.getSinglePos).toHaveBeenCalledWith(envService.posId);
    expect(posConnectService.integration$.next).toHaveBeenCalledWith(integration);
    expect(posConnectService.terminal$.next).toHaveBeenCalledWith(terminal);
    expect(markSpy).toHaveBeenCalled();
    expect(thirdPartyInternalFormServiceSpy).toHaveBeenCalledWith(
      {},
      {},
      envService.businessId,
      envService.businessName,
      integration,
      terminal,
      posConnectService.checkoutWrapperCustomerViewLink
    );
    expect(component.thirdPartyService).toEqual(MockClass as any);

  });

  it('should handle close', () => {

    component.handleClose();

    expect(router.navigate).toHaveBeenCalledWith(['../..'], { relativeTo: { test: 'activated.route' } as any });

  });

});
