import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BackendLoggerService } from '../../backend-logger';
import { PE_ENV } from '../../environment-config';

import { MicroLoaderService } from './micro-loader.service';

describe('MicroLoaderService', () => {

  let service: MicroLoaderService;
  let http: HttpTestingController;
  let logger: jasmine.SpyObj<BackendLoggerService>;
  let envConfig: any;

  function setRegistry(prop: string, value: { key: string, code: any }): void {
    service[`registry`][prop] = {
      [value.key]: value.code,
    };
  }

  function setConfig(key: string, value: string): void {
    service[`envConfig`].frontend = {
      [key]: value,
    } as any;
  }

  beforeEach(() => {

    const loggerSpy = jasmine.createSpyObj<BackendLoggerService>('BackendLoggerService', ['logError']);

    envConfig = { frontend: {} };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        MicroLoaderService,
        { provide: BackendLoggerService, useValue: loggerSpy },
        { provide: PE_ENV, useValue: envConfig },
      ],
    });

    service = TestBed.inject(MicroLoaderService);
    http = TestBed.inject(HttpTestingController);
    logger = TestBed.inject(BackendLoggerService) as jasmine.SpyObj<BackendLoggerService>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should load build hash', () => {

    const microCode = 'code';
    const createSpy = spyOn<any>(service, '_createBuildHashObservable').and.returnValue(of('created.hash'));

    /**
     * micro code already exists in service.buildHashObservables
     */
    service[`buildHashObservables`][microCode] = of('test.hash');
    service.loadBuildHash(microCode).subscribe(hash => expect(hash).toEqual('test.hash'));
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * micro code does not exist in service.buildHashObservables
     */
    delete service[`buildHashObservables`][microCode];

    service.loadBuildHash(microCode).subscribe(hash => expect(hash).toEqual('created.hash'));
    expect(createSpy).toHaveBeenCalledWith(microCode, null);
    expect(service[`buildHashObservables`][microCode]).toBeUndefined();

  });

  it('should load build micro config', () => {

    const microCode = 'code';
    const appMock = {
      _id: 'app-001',
      code: microCode,
    };
    const createSpy = spyOn<any>(service, '_createBuildMicroConfigObservable').and.returnValue(of({ ...appMock, _id: 'app-001-created' }));

    /**
     * micro code already exists in service.buildMicroConfigObservables
     */
    service[`buildMicroConfigObservables`][microCode] = of(appMock) as any;
    service.loadBuildMicroConfig(microCode).subscribe(app => expect(app).toEqual(appMock as any));
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * micro code does not exist in service.buildMicroConfigObservables
     */
    delete service[`buildMicroConfigObservables`][microCode];

    service.loadBuildMicroConfig(microCode).subscribe(app => expect(app).toEqual({ ...appMock, _id: 'app-001-created' } as any));
    expect(createSpy).toHaveBeenCalledWith(microCode);
    expect(service[`buildMicroConfigObservables`][microCode]).toBeUndefined();

  });

  it('should load build', () => {

    const microCode = 'code';
    const createSpy = spyOn<any>(service, '_createBuildObservable').and.returnValue(of(false));

    /**
     * micro code does not exist in service.buildObservables
     * argument forceReload for loadBuild function is FALSE as default
     */
    service[`buildObservables`][microCode] = of(true);
    service.loadBuild(microCode).subscribe(result => expect(result).toBe(true));
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * argument forceReload for loadBuild function is TRUE
     */
    service.loadBuild(microCode, true).subscribe(result => expect(result).toBe(false));
    expect(createSpy).toHaveBeenCalledWith(microCode, true);
    expect(service[`buildObservables`][microCode]).toBeUndefined();

  });

  it('should load inner micro build', () => {

    const microCode = 'code';
    const innerMicroCode = 'inner.code';
    const createSpy = spyOn<any>(service, '_createInnerMicroBuildObservable').and.returnValue(of(false));

    /**
     * micro code does not exist in service.innerBuildObservables
     * argument forceReload for loadBuild function is FALSE as default
     */
    service[`innerBuildObservables`][microCode] = of(true);
    service.loadInnerMicroBuild(microCode, innerMicroCode).subscribe(result => expect(result).toBe(true));
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * argument forceReload for loadBuild function is TRUE
     */
    service.loadInnerMicroBuild(microCode, innerMicroCode, true).subscribe(result => expect(result).toBe(false));
    expect(createSpy).toHaveBeenCalledWith(microCode, innerMicroCode, null, true);
    expect(service[`innerBuildObservables`][microCode]).toBeUndefined();

  });

  it('should load inner micro build - extended', () => {

    const microCode = 'code';
    const innerMicroCode = 'inner.code';
    const subpath = 'subpath';
    const createSpy = spyOn<any>(service, '_createInnerMicroBuildObservable').and.returnValue(of(false));

    /**
     * micro code does not exist in service.innerBuildObservables
     * argument forceReload for loadBuild function is FALSE as default
     */
    service[`innerBuildObservables`][microCode] = of(true);
    service.loadInnerMicroBuildEx(microCode, innerMicroCode, subpath).subscribe(result => expect(result).toBe(true));
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * argument forceReload for loadBuild function is TRUE
     */
    service.loadInnerMicroBuildEx(microCode, innerMicroCode, subpath, true).subscribe(result => expect(result).toBe(false));
    expect(createSpy).toHaveBeenCalledWith(microCode, innerMicroCode, subpath, true);
    expect(service[`innerBuildObservables`][microCode]).toBeUndefined();

  });

  it('should get resource url', () => {

    const microCode = 'code';
    const resourceName = 'name';
    const resourceType = 'js';

    /**
     * micro code does not exist in envConfig.frontend
     * argument allowCache for getResourceUrl function is TRUE as default
     */
    let result = service.getResourceUrl(microCode, null, resourceName, resourceType);

    expect(result).toEqual(`/dist_ext/${microCode}/${resourceName}.${resourceType}`);

    /**
     * argument allowCache for getResourceUrl function is FALSE
     */
    result = service.getResourceUrl(microCode, null, resourceName, resourceType, false);

    expect(result).toContain(`/dist_ext/${microCode}/${resourceName}.${resourceType}`);

    /**
     * micro code exists in envConfig.frontend
     */
    setConfig(microCode, 'config.code');

    result = service.getResourceUrl(microCode, null, resourceName, resourceType);

    expect(result).toContain(`config.code/${resourceName}.${resourceType}?`);

  });

  it('should create build observable', () => {

    const microCode = 'code';
    const loadBuildSpy = spyOn(service, 'loadBuildHash').and.returnValue(of('hash'));
    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('url/test');
    const loadScriptSpy = spyOn(service, 'loadScript').and.returnValue(of(true));

    /**
     * argument forceReload for _createBuildObservable function is FALSE as default
     */
    service[`_createBuildObservable`](microCode).subscribe(result => expect(result).toBe(true));
    expect(loadBuildSpy).toHaveBeenCalledWith(microCode);
    expect(getResourceUrlSpy).toHaveBeenCalledWith(microCode, 'hash', 'micro', 'js');
    expect(loadScriptSpy).toHaveBeenCalledWith('url/test', microCode);

    /**
     * argument forceReload for _createBuildObservable function is TRUE
     */
    service[`_createBuildObservable`](microCode, true).subscribe(result => expect(result).toBe(true));
    expect(service[`registry`].scripts['url/test']).toBeNull();

  });

  it('should create inner micro build observable', () => {

    const microCode = 'code';
    const innerMicroCode = 'inner.code';
    const subPath = 'subpath';
    const loadBuildSpy = spyOn(service, 'loadBuildHash').and.returnValue(of('hash'));
    const createSpy = spyOn<any>(service, '_createBuildMicroConfigObservable').and.returnValue(of({
      innerMicros: undefined,
    }));
    const loadScriptSpy = spyOn(service, 'loadScript').and.returnValue(of(true));
    const url = 'bootstrap/script/url';

    /**
     * innerMicros is undefined in config returned from function _createBuildMicroConfigObservable
     * so function throws error 'Cant find inner micro'
     */
    service[`_createInnerMicroBuildObservable`](microCode, innerMicroCode).subscribe(
      () => { },
      error => expect(error).toEqual(new Error(`Cant find inner micro: ${innerMicroCode}`)),
    );
    expect(loadBuildSpy).toHaveBeenCalledWith(microCode, null);
    expect(createSpy).toHaveBeenCalledWith(microCode, null);
    expect(loadScriptSpy).not.toHaveBeenCalled();

    /**
     * innerMicros is defined so function does not throw error
     * argument forceReload for function _createInnerMicroBuildObservable is FALSE as default
     */
    setRegistry('scripts', { key: url, code: 'test' });
    createSpy.and.returnValue(of({
      innerMicros: {
        [innerMicroCode]: {
          bootstrapScriptUrl: url,
        },
      },
    }));

    service[`_createInnerMicroBuildObservable`](microCode, innerMicroCode, subPath)
      .subscribe(result => expect(result).toBe(true));
    expect(loadBuildSpy).toHaveBeenCalledWith(microCode, subPath);
    expect(createSpy).toHaveBeenCalledWith(microCode, subPath);
    expect(loadScriptSpy).toHaveBeenCalledWith('bootstrap/script/url', microCode);
    expect(service[`registry`].scripts[url]).toEqual('test' as any);

    /**
     * argument forceReload for function _createInnerMicroBuildObservable is FALSE as default
     */
    service[`_createInnerMicroBuildObservable`](microCode, innerMicroCode, subPath, true)
      .subscribe(result => expect(result).toBe(true));
    expect(service[`registry`].scripts[url]).toBeNull();

  });

  it('should create build hash observable', () => {

    const microCode = 'code';
    const subPath = 'subpath';
    const url = 'url/test';
    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue(url);
    let req: TestRequest;

    /**
     * micro code exists in service.registry.buildHashes
     */
    setRegistry('buildHashes', { key: microCode, code: { micro: 'micro.test' } });
    service[`_createBuildHashObservable`](microCode).subscribe(result => expect(result).toEqual('micro.test'));
    expect(getResourceUrlSpy).not.toHaveBeenCalled();
    http.expectNone(url);
    expect(logger.logError).not.toHaveBeenCalled();

    /**
     * micro code does not exist in service.registry.buildHashes
     * argument subpath for _createBuildHashObservable function is null
     * request throws error 404
     */
    delete service[`registry`].buildHashes[microCode];

    service[`_createBuildHashObservable`](microCode).subscribe(
      () => { },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toEqual('Not found');
        expect(logger.logError).toHaveBeenCalled();
      },
    );

    req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');
    expect(getResourceUrlSpy).toHaveBeenCalledWith(microCode, null, 'hashmap', 'json', false);
    expect(service[`registry`].buildHashes[microCode]).toBeUndefined();

    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

    /**
     * argument subpath for _createBuildHashObservable function is set
     * request returns mocked data
     */
    service[`_createBuildHashObservable`](microCode, subPath).subscribe(result => expect(result).toEqual('test.micro'));

    req = http.expectOne(url);
    req.flush({ micro: 'test.micro' });

    expect(getResourceUrlSpy).toHaveBeenCalledWith(microCode, null, 'subpath/hashmap', 'json', false);
    expect(service[`registry`].buildHashes[microCode]).toEqual({ micro: 'test.micro' });

  });

  it('should create build micro config observable', () => {

    const microCode = 'code';
    const subPath = 'subpath';
    const url = 'url/test';
    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue(url);
    let req: TestRequest;

    /**
     * micro code exists in service.registry.buildMicroConfigs
     */
    setRegistry('buildMicroConfigs', { key: microCode, code: 'test.config' });
    service[`_createBuildMicroConfigObservable`](microCode).subscribe(result => expect(result).toEqual('test.config' as any));
    expect(getResourceUrlSpy).not.toHaveBeenCalled();
    http.expectNone(url);
    expect(logger.logError).not.toHaveBeenCalled();

    /**
     * micro code does not exist in service.registry.buildHashes
     * argument subpath for _createBuildHashObservable function is null
     * request throws error 404
     */
    delete service[`registry`].buildMicroConfigs[microCode];

    service[`_createBuildMicroConfigObservable`](microCode).subscribe(
      () => { },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.statusText).toEqual('Not found');
        expect(logger.logError).toHaveBeenCalled();
      },
    );

    req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');
    expect(getResourceUrlSpy).toHaveBeenCalledWith(microCode, null, 'micro.config', 'json', false);
    expect(service[`registry`].buildMicroConfigs[microCode]).toBeUndefined();

    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

     /**
     * argument subpath for _createBuildHashObservable function is set
     * request returns mocked data
     */
    service[`_createBuildMicroConfigObservable`](microCode, subPath)
      .subscribe(result => expect(result).toEqual('test.micro.config' as any));

    req = http.expectOne(url);
    req.flush('test.micro.config');

    expect(getResourceUrlSpy).toHaveBeenCalledWith(microCode, null, 'subpath/micro.config', 'json', false);
    expect(service[`registry`].buildMicroConfigs[microCode]).toEqual('test.micro.config' as any);

  });

});
