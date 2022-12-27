import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PEB_POS_HOST } from '../../constants/constants';
import { PosApi } from '../../services/pos/abstract.pos.api';

import { PeSettingsPayeverDomainComponent } from './payever-domain.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

describe('PeSettingsPayeverDomainComponent', () => {

  let fixture: ComponentFixture<PeSettingsPayeverDomainComponent>;
  let component: PeSettingsPayeverDomainComponent;
  let api: jasmine.SpyObj<PosApi>;
  let appData: any;
  let config: any;
  let overlay: jasmine.SpyObj<PeOverlayWidgetService>;

  beforeEach(waitForAsync(() => {

    const apiSpy = jasmine.createSpyObj<PosApi>('PosApi', [
      'updatePosAccessConfig',
      'validatePosName',
    ]);
    apiSpy.updatePosAccessConfig.and.returnValue(of({ updated: true }) as any);

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
        TranslatePipeMock,
      ],
      providers: [
        { provide: PosApi, useValue: apiSpy },
        { provide: PEB_POS_HOST, useValue: 'host' },
        { provide: PE_OVERLAY_DATA, useValue: appDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
        { provide: PeOverlayWidgetService, useValue: overlaySpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeSettingsPayeverDomainComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PosApi) as jasmine.SpyObj<PosApi>;
      appData = TestBed.inject(PE_OVERLAY_DATA);
      config = TestBed.inject(PE_OVERLAY_CONFIG);
      overlay = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set done btn callback on construct', () => {

    expect(config.doneBtnCallback).toBeDefined();

    /**
     * component.errorMsg is set
     */
    component.errorMsg = 'test error';

    config.doneBtnCallback();

    expect(api.updatePosAccessConfig).not.toHaveBeenCalled();
    expect(appData.onSved$.next).not.toHaveBeenCalled();
    expect(overlay.close).not.toHaveBeenCalled();

    /**
     * component.errorMsg is null
     * component.appData.accessConfig.internalDomain is ''
     */
    component.errorMsg = null;
    appData.accessConfig.internalDomain = '';

    config.doneBtnCallback();

    expect(api.updatePosAccessConfig).not.toHaveBeenCalled();
    expect(appData.onSved$.next).not.toHaveBeenCalled();
    expect(overlay.close).toHaveBeenCalled();

    /**
     * component.appData.accessConfig is null
     */
    overlay.close.calls.reset();
    appData.accessConfig = null;
    api.updatePosAccessConfig.and.returnValue(of(null));

    config.doneBtnCallback();

    expect(api.updatePosAccessConfig).toHaveBeenCalledWith(appData._id, {
      internalDomain: '',
    });
    expect(appData.onSved$.next).toHaveBeenCalledWith({ updatePosList: true });
    expect(overlay.close).toHaveBeenCalled();

  });

  it('should set domain config on init', () => {

    /**
     * appData.accessConfig is set
     */
    component.ngOnInit();

    expect(component.domainConfig.domainName).toEqual(appData.accessConfig.internalDomain);
    expect(component.domainConfig.creationDate).toEqual(appData.accessConfig.createdAt);

    /**
     * appData.accessConfig is null
     */
    appData.accessConfig = null;

    component.ngOnInit();

    expect(component.domainConfig.domainName).toBeUndefined();
    expect(component.domainConfig.creationDate).toBeUndefined();

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
    expect(api.validatePosName).not.toHaveBeenCalled();

    // INVALID name
    name = '!test';
    component.validateDomain(name);

    expect(component.domainConfig.domainName).toEqual(name);
    expect(component.errorMsg).toEqual('Domain name is not correct');
    expect(markSpy).toHaveBeenCalledTimes(2);
    expect(api.validatePosName).not.toHaveBeenCalled();

    // VALID name through regex
    // w/o message
    name = 'test';

    api.validatePosName.and.returnValue(of({ message: undefined }));

    component.errorMsg = undefined;
    component.validateDomain(name);

    expect(component.errorMsg).toBeNull();
    expect(markSpy).toHaveBeenCalledTimes(4);

    // w/ message
    api.validatePosName.and.returnValue(of({ message: 'test error' }));

    component.validateDomain(name);

    expect(component.errorMsg).toEqual('test error');
    expect(markSpy).toHaveBeenCalledTimes(6);

    // w/o value
    api.validatePosName.and.returnValue(of({ message: undefined }));

    component.validateDomain(null);

    expect(component.errorMsg).toEqual('Domain can not be empty');
    expect(markSpy).toHaveBeenCalledTimes(8);

  });

});
