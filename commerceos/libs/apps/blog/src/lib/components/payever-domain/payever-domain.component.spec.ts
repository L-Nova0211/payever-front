import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebShopsApi } from '@pe/builder-api';
import { TranslatePipe } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PEB_BLOG_HOST } from '../../constants';

import { PeSettingsPayeverDomainComponent } from './payever-domain.component';

describe('PeSettingsPayeverDomainComponent', () => {

  let fixture: ComponentFixture<PeSettingsPayeverDomainComponent>;
  let component: PeSettingsPayeverDomainComponent;
  let api: jasmine.SpyObj<PebShopsApi>;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;

  beforeEach(async(() => {

    const apiSpy = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', [
      'updateShopAccessConfig',
      'validateShopName',
    ]);
    apiSpy.updateShopAccessConfig.and.returnValue(of({ updated: true }) as any);

    const appDataMock = {
      id: 'app',
      accessConfig: {
        internalDomain: 'internal.domain',
        createdAt: '02/11/2021',
      },
      onSved$: {
        next: jasmine.createSpy('next'),
      },
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsPayeverDomainComponent,
        TranslatePipe,
      ],
      providers: [
        { provide: PebShopsApi, useValue: apiSpy },
        { provide: PEB_BLOG_HOST, useValue: 'host' },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsPayeverDomainComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebShopsApi) as jasmine.SpyObj<PebShopsApi>;
      appData = TestBed.inject(PE_OVERLAY_DATA);
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set domain config on init', () => {

    component.ngOnInit();

    expect(component.domainConfig.domainName).toEqual(appData.accessConfig.internalDomain);
    expect(component.domainConfig.creationDate).toEqual(appData.accessConfig.createdAt);

  });

  it('should validate domain', () => {

    const validateNameSpy = spyOn(component, 'validateName').and.callThrough();
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    let name = 'te';

    // INVALID name - length < 3
    component.validateDomain(name);

    expect(component.domainConfig.domainName).toEqual(name);
    expect(validateNameSpy).toHaveBeenCalledWith(name);
    expect(component.errorMsg).toEqual('Domain name should have at least 3 characters');
    expect(markSpy).toHaveBeenCalled();
    expect(api.validateShopName).not.toHaveBeenCalled();

    // INVALID name
    name = '!test';
    component.validateDomain(name);

    expect(component.domainConfig.domainName).toEqual(name);
    expect(component.errorMsg).toEqual('Domain name is not correct');
    expect(markSpy).toHaveBeenCalledTimes(2);
    expect(api.validateShopName).not.toHaveBeenCalled();

    // VALID name through regex
    // w/o message
    name = 'test';

    api.validateShopName.and.returnValue(of({ message: undefined }));

    component.errorMsg = undefined;
    component.validateDomain(name);

    expect(component.errorMsg).toBeNull();
    expect(markSpy).toHaveBeenCalledTimes(4);

    // w/ message
    api.validateShopName.and.returnValue(of({ message: 'test error' }));

    component.validateDomain(name);

    expect(component.errorMsg).toEqual('test error');
    expect(markSpy).toHaveBeenCalledTimes(6);

    // w/o value
    api.validateShopName.and.returnValue(of({ message: undefined }));

    component.validateDomain(null);

    expect(component.errorMsg).toEqual('Domain can not be empty');
    expect(markSpy).toHaveBeenCalledTimes(8);

  });

  it('should handle done button callback', () => {

    component.ngOnInit();

    // w/ errorMsg
    component.errorMsg = 'test error';

    config.doneBtnCallback();

    expect(api.updateShopAccessConfig).not.toHaveBeenCalled();
    expect(overlay.close).not.toHaveBeenCalled();

    // w/o errorMsg
    // internalDomain = domainName
    component.errorMsg = null;

    config.doneBtnCallback();

    expect(api.updateShopAccessConfig).not.toHaveBeenCalled();
    expect(overlay.close).toHaveBeenCalled();

    // internalDomain != domainName
    appData.accessConfig.internalDomain = 'test';

    config.doneBtnCallback();

    expect(api.updateShopAccessConfig).toHaveBeenCalledWith(appData.id, { internalDomain: 'internal.domain' });
    expect(appData.onSved$.next).toHaveBeenCalledWith({ updateShopList: true });
    expect(overlay.close).toHaveBeenCalledTimes(2);

  });

});
