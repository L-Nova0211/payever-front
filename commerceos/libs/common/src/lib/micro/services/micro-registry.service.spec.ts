import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BackendLoggerService } from '../../backend-logger';
import { PE_ENV } from '../../environment-config';

import { MicroRegistryService } from './micro-registry.service';

describe('MicroRegistryService', () => {

  let service: MicroRegistryService;
  let http: HttpTestingController;
  let logger: jasmine.SpyObj<BackendLoggerService>;
  let envConfig: any;

  beforeEach(() => {

    const loggerSpy = jasmine.createSpyObj<BackendLoggerService>('BackendLoggerService', ['logError']);

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
        MicroRegistryService,
        { provide: BackendLoggerService, useValue: loggerSpy },
        { provide: PE_ENV, useValue: envConfig },
      ],
    });

    service = TestBed.inject(MicroRegistryService);
    http = TestBed.inject(HttpTestingController);
    logger = TestBed.inject(BackendLoggerService) as jasmine.SpyObj<BackendLoggerService>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get registered micros', () => {

    const uuid = 'uuid';
    const url = `${envConfig.backend.commerceos}/api/apps/business/${uuid}`;
    const micros = [
      {
        _id: 'app-001',
        code: 'code',
      },
    ];
    let req: TestRequest;

    /**
     * request throws error 404
     */
    service.getRegisteredMicros(uuid).subscribe(
      () => { fail(); },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toEqual('Not found');
      },
    );

    req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

    /**
     * request returns mocked data
     */
    service.getRegisteredMicros(uuid).subscribe();

    req = http.expectOne(url);
    req.flush(micros);

    expect(service[`registry`].registered).toEqual(micros as any);

  });

  it('should get personal registered micros', () => {

    const url = `${envConfig.backend.commerceos}/api/apps/user`;
    const micros = [
      {
        _id: 'app-001',
        code: 'code',
      },
    ];
    let req: TestRequest;

    /**
     * request throws error 404
     */
    service.getPersonalRegisteredMicros().subscribe(
      () => { fail(); },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toEqual('Not found');
      },
    );

    req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

    /**
     * request returns mocked data
     */
    service.getPersonalRegisteredMicros().subscribe();

    req = http.expectOne(url);
    req.flush(micros);

    expect(service[`registry`].registered).toEqual(micros as any);

  });

  it('should get admin registered micros', () => {

    const url = `${envConfig.backend.commerceos}/api/apps/admin`;
    const micros = [
      {
        _id: 'app-001',
        code: 'code',
      },
    ];
    let req: TestRequest;

    /**
     * request throws error 404
     */
    service.getAdminRegisteredMicros().subscribe(
      () => { fail(); },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toEqual('Not found');
      },
    );

    req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

    /**
     * request returns mocked data
     */
    service.getAdminRegisteredMicros().subscribe();

    req = http.expectOne(url);
    req.flush(micros);

    expect(service[`registry`].registered).toEqual(micros as any);

  });

  it('should get partner registered micros', () => {

    const url = `${envConfig.backend.commerceos}/api/apps/partner`;
    const micros = [
      {
        _id: 'app-001',
        code: 'code',
      },
    ];
    let req: TestRequest;

    /**
     * request throws error 404
     */
    service.getPartnerRegisteredMicros().subscribe(
      () => { fail(); },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toEqual('Not found');
      },
    );

    req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

    /**
     * request returns mocked data
     */
    service.getPartnerRegisteredMicros().subscribe();

    req = http.expectOne(url);
    req.flush(micros);

    expect(service[`registry`].registered).toEqual(micros as any);

  });

  it('should get micro config', () => {

    const microCode = 'code';
    const micros = [
      {
        _id: 'app-001',
        code: 'code',
      },
      {
        _id: 'app-002',
        code: 'code-2',
      },
    ];

    /**
     * there is no propery registered in service.registry
     */
    delete service[`registry`].registered;
    service.getMicroConfig(null);

    expect(logger.logError).toHaveBeenCalled();

    /**
     * propery registered in service.registry is mocked data
     * argument microCode for getMicroConfig function is null
     */
    service[`registry`].registered = micros as any;
    expect(service.getMicroConfig(null)).toEqual(micros as any);

    /**
     * argument microCode for getMicroConfig function is mocked
     */
    expect(service.getMicroConfig(microCode)).toEqual(micros[0] as any);

  });

  it('should load build', () => {

    const micro = {
      id: 'app-001',
      code: 'code',
    };
    const createSpy = spyOn<any>(service, 'createBuildObservable').and.returnValue(of(false));

    /**
     * micro code already exists in service.buildObservables
     * argument forceReload for loadBuild function is FALSE as default
     */
    service[`buildObservables`][micro.code] = of(true);
    service.loadBuild(micro as any).subscribe(result => expect(result).toBe(true));
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * argument forceReload for loadBuild function is TRUE
     */
    service.loadBuild(micro as any, true).subscribe(result => expect(result).toBe(false));
    expect(createSpy).toHaveBeenCalledWith(micro as any, true);
    expect(service[`buildObservables`][micro.code]).toBeUndefined();

  });

  it('should create build observable', () => {

    const micro = {
      _id: 'app-001',
      code: 'code',
      bootstrapScriptUrl: 'bootstrap/script/url',
    };
    const loadSpy = spyOn(service, 'loadScript').and.returnValue(of(true));

    /**
     * argument forceReload for createBuildObservable function is FALSE as default
     */
    service[`registry`].scripts[micro.bootstrapScriptUrl] = micro as any;
    service[`createBuildObservable`](micro as any).subscribe(result => expect(result).toBe(true));

    expect(service[`registry`].scripts[micro.bootstrapScriptUrl]).toEqual(micro as any);
    expect(loadSpy).toHaveBeenCalledWith(micro.bootstrapScriptUrl, micro.code);

    /**
     * argument forceReload for createBuildObservable function is TRUE
     */
    service[`createBuildObservable`](micro as any, true).subscribe(result => expect(result).toBe(true));

    expect(service[`registry`].scripts[micro.bootstrapScriptUrl]).toBeNull();

  });

  afterAll(() => {

    http.verify();

  });

});
