import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PE_ENV } from '../../environment-config';
import { AppSetUpStatusEnum } from '../types';

import { AppSetUpService } from './app-setup.service';

describe('AppSetUpService', () => {

  let service: AppSetUpService;
  let http: HttpTestingController;
  let envConfig: any;

  const businessId = 'b-001';
  const appName = 'app';

  beforeEach(() => {

    envConfig = {
      backend: {
        commerceos: 'be-commerceos',
      },
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        AppSetUpService,
        { provide: PE_ENV, useValue: envConfig },
      ],
    });

    service = TestBed.inject(AppSetUpService);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set status', () => {

    const setupStatus = AppSetUpStatusEnum.Completed;
    const url = `${envConfig.backend.commerceos}/api/apps/business/${businessId}/app/${appName}/toggle-setup-status`;

    service.setStatus(businessId, appName, setupStatus).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ setupStatus });

    req.flush({});

  });

  it('should set step', () => {

    const setupStep = 'step';
    const url = `${envConfig.backend.commerceos}/api/apps/business/${businessId}/app/${appName}/change-setup-step`;

    service.setStep(businessId, appName, setupStep).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ setupStep });

    req.flush({});

  });

  it('should get status and step', () => {

    const appMock = {
      code: appName,
      setupStatus: AppSetUpStatusEnum.Completed,
      setupStep: 'step',
    };
    const microRegistryServiceMock = {
      getMicroConfig: jasmine.createSpy('getMicroConfig').and.returnValue(appMock),
    };
    const url = `${envConfig.backend.commerceos}/api/apps/business/${businessId}`;

    /**
     * microRegistryService.getMicroConfig returns mocked app data
     */
    service.getStatusAndStep(businessId, appName, microRegistryServiceMock as any)
      .subscribe(result => expect(result).toEqual({
        status: appMock.setupStatus,
        step: appMock.setupStep,
      }));
    http.expectNone(url);
    expect(microRegistryServiceMock.getMicroConfig).toHaveBeenCalledWith(appName);

    /**
     * microRegistryService.getMicroConfig returns null
     */
    microRegistryServiceMock.getMicroConfig.and.returnValue(null);

    service.getStatusAndStep(businessId, appName, microRegistryServiceMock as any)
      .subscribe(result => expect(result).toEqual({
        status: appMock.setupStatus,
        step: appMock.setupStep,
      }));

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush([appMock]);

  });

  it('should get status and step from backend', () => {

    const appMock = {
      code: appName,
      setupStatus: AppSetUpStatusEnum.Completed,
      setupStep: 'step',
    };
    const url = `${envConfig.backend.commerceos}/api/apps/business/${businessId}`;

    service.getStatusAndStepFromBackend(businessId, appName)
      .subscribe(result => expect(result).toEqual({
        status: appMock.setupStatus,
        step: appMock.setupStep,
      }));

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush([appMock]);

  });

  it('should get status', () => {

    const appMock = {
      code: appName,
      setupStatus: AppSetUpStatusEnum.Completed,
      setupStep: 'step',
    };
    const microRegistryServiceMock = {
      getMicroConfig: jasmine.createSpy('getMicroConfig').and.returnValue(appMock),
    };

    service.getStatus(businessId, appName, microRegistryServiceMock as any)
      .subscribe(status => expect(status).toEqual(appMock.setupStatus));
    expect(microRegistryServiceMock.getMicroConfig).toHaveBeenCalledWith(appName);

  });

  it('should get step', () => {

    const appMock = {
      code: appName,
      setupStatus: AppSetUpStatusEnum.Completed,
      setupStep: 'step',
    };
    const microRegistryServiceMock = {
      getMicroConfig: jasmine.createSpy('getMicroConfig').and.returnValue(appMock),
    };

    service.getStep(businessId, appName, microRegistryServiceMock as any)
      .subscribe(step => expect(step).toEqual(appMock.setupStep));
    expect(microRegistryServiceMock.getMicroConfig).toHaveBeenCalledWith(appName);

  });

  afterAll(() => {

    http.verify();

  });

});
