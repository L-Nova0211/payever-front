import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PebShopsApi } from '@pe/builder-api';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeSettingsConnectExistingComponent } from './connect-existing.component';

describe('PeSettingsConnectExistingComponent', () => {

  let fixture: ComponentFixture<PeSettingsConnectExistingComponent>;
  let component: PeSettingsConnectExistingComponent;
  let api: jasmine.SpyObj<PebShopsApi>;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;

  beforeEach(waitForAsync(() => {

    const apiSpy = jasmine.createSpyObj<PebShopsApi>('PebShopsApi', [
      'deleteDomain',
      'addDomain',
      'checkDomain',
    ]);

    const appDataMock = { id: 'test' };

    const configMock = {
      doneBtnCallback: undefined,
      backBtnCallback: undefined,
    };

    const overlaySpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', ['close']);

    TestBed.configureTestingModule({
      declarations: [
        PeSettingsConnectExistingComponent,
      ],
      providers: [
        { provide: PebShopsApi, useValue: apiSpy },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: configMock },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsConnectExistingComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebShopsApi) as jasmine.SpyObj<PebShopsApi>;
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle done or back callback', () => {

    api.deleteDomain.and.returnValue(of({ deleted: true }));

    // isConnected = TRUE
    component.domainId = 'dom-001';
    component.isConnected = true;

    config.doneBtnCallback();

    expect(overlay.close).toHaveBeenCalled();
    expect(api.deleteDomain).not.toHaveBeenCalled();

    // isConnected = FALSE
    component.isConnected = false;

    config.doneBtnCallback();

    expect(api.deleteDomain).toHaveBeenCalledWith('test', 'dom-001');
    expect(overlay.close).toHaveBeenCalledTimes(2);

  });

  it('should verify', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const data = {
      currentIp: '127.0.0.1',
      requiredIp: '127.0.0.1',
      currentCname: 'test.com',
      requiredCname: 'test.com',
      isConnected: true,
    };
    const error = {
      error: {
        message: 'test error',
      },
    };

    api.addDomain.and.returnValue(of({ id: 'dom-001' }));
    api.checkDomain.and.returnValue(of(data));

    // w/o domainName
    component.verify();

    expect(api.addDomain).not.toHaveBeenCalled();
    expect(api.checkDomain).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    // w/ domainName
    // w/o error
    component.domainName = 'domain';
    component.verify();

    expect(api.addDomain).toHaveBeenCalledWith('test', 'domain');
    expect(component.domainId).toEqual('dom-001');
    expect(api.checkDomain).toHaveBeenCalledWith('test', 'dom-001');
    expect(component.step).toBe(2);
    expect(component.domainInfo).toEqual({
      currentIp: data.currentIp,
      requiredIp: data.requiredIp,
      currentValue: data.currentCname,
      requiredValue: data.requiredCname,
    });
    expect(component.isConnected).toEqual(data.isConnected);
    expect(detectSpy).toHaveBeenCalled();

    // w/ error
    api.checkDomain.and.returnValue(throwError(error));

    component.verify();

    expect(component.errorMsg).toEqual(error.error.message);
    expect(detectSpy).toHaveBeenCalledTimes(2);

  });

  it('should connect', () => {

    component.connect();

    expect(overlay.close).toHaveBeenCalled();

  });

  it('should get fields', () => {

    const info = {
      currentIp: '127.0.0.1',
      requiredIp: '127.0.0.1',
      currentValue: 'test.com',
      requiredValue: 'test.com',
    };

    // current != required
    expect(component.getfields(info)).toEqual('');

    // currentIp != requiredIp
    // currentValue = requiredValue
    info.requiredValue = 'test.de';

    expect(component.getfields(info)).toEqual('CNAME');

    // currentIp = requiredIp
    info.requiredIp = '127.0.0.2';

    expect(component.getfields(info)).toEqual('A & CNAME');

  });

});
