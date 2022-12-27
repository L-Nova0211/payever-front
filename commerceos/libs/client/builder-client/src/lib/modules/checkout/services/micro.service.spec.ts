import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector, Renderer2 } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { PE_ENV } from '@pe/common';

import { MicroLoaderService } from './micro.service';

describe('MicroLoaderService', () => {

  let service: MicroLoaderService;
  let http: HttpTestingController;

  function setRegistry(service: MicroLoaderService, prop: string, value: { key: string, code: any }) {
    service[`registry`][prop] = {
      [value.key]: value.code,
    };
  }

  function setConfig(service: MicroLoaderService, key: string, value: string) {
    service[`config`].frontend = {
      [key]: value,
    };
  }

  beforeEach(() => {

    const rendererSpy = jasmine.createSpyObj('Renderer2', [
      'createElement',
      'appendChild',
    ]);

    const envMock = {
      business: {
        id: 'business',
      },
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        MicroLoaderService,
        { provide: Injector, useValue: TestBed },
        { provide: Renderer2, useValue: rendererSpy },
        { provide: PE_ENV, useValue: envMock },
      ],
    });

    service = TestBed.inject(MicroLoaderService);
    http = TestBed.inject(HttpTestingController);

  });


  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should createBuildObservable - forceReload = false', () => {

    const loadBuildHashSpy = spyOn(service, 'loadBuildHash').and.returnValue(of('loadBuildHash'));
    const loadScriptSpy = spyOn(service, 'loadScript').and.returnValue(of(true));
    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('resourceUrl');

    let result = service.loadBuildHash('test');

    expect(result).toBeTruthy();

    const value = service[`_createBuildObservable`]('000');
    value.subscribe(v => expect(v).toBe(true));

    expect(loadBuildHashSpy).toHaveBeenCalled();
    expect(loadScriptSpy).toHaveBeenCalled();
    expect(getResourceUrlSpy).toHaveBeenCalled();

  });

  it('should createBuildObservable - forceReload = true', () => {

    const loadBuildHashSpy = spyOn(service, 'loadBuildHash').and.returnValue(of('loadBuildHash'));
    const loadScriptSpy = spyOn(service, 'loadScript').and.returnValue(of(true));
    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('resourceUrl');

    const value = service[`_createBuildObservable`]('000', true);
    value.subscribe(v => expect(v).toBe(true));

    expect(loadBuildHashSpy).toHaveBeenCalled();
    expect(loadScriptSpy).toHaveBeenCalled();
    expect(getResourceUrlSpy).toHaveBeenCalled();

  });

  it('should createInnerMicroBuildObservable - forceReload = false', () => {

    const config = {
      innerMicros: {
        111: {
          bootstrapScriptUrl: undefined,
        },
      },
    };
    const loadBuildHashSpy = spyOn(service, 'loadBuildHash').and.returnValue(of('loadBuildHash'));
    const _createBuildMicroConfigObservableSpy = spyOn<any>(service, '_createBuildMicroConfigObservable').and.returnValue(of(config));
    const loadScriptSpy = spyOn(service, 'loadScript').and.returnValue(of(true));

    service[`_createInnerMicroBuildObservable`]('000', '111').subscribe(
      () => { fail(); },
      (error: HttpErrorResponse) => {
        expect(error.toString()).toContain('Cant find inner micro');
      },
    );

    expect(loadBuildHashSpy).toHaveBeenCalledTimes(1);
    expect(_createBuildMicroConfigObservableSpy).toHaveBeenCalledTimes(1);
    expect(loadScriptSpy).not.toHaveBeenCalled();

    config.innerMicros[111].bootstrapScriptUrl = 'test';

    service[`_createInnerMicroBuildObservable`]('000', '111').subscribe();

    expect(loadBuildHashSpy).toHaveBeenCalledTimes(2);
    expect(_createBuildMicroConfigObservableSpy).toHaveBeenCalledTimes(2);
    expect(loadScriptSpy).toHaveBeenCalledTimes(1);
  });

  // it('should createInnerMicroBuildObservable - forceReload = true', () => {
  //
  //   const config = {
  //     innerMicros: {
  //       '111': {
  //         bootstrapScriptUrl: 'test',
  //       },
  //     },
  //   };
  //   const loadBuildHashSpy = spyOn(service, 'loadBuildHash').and.returnValue(of('loadBuildHash'));
  //   const _createBuildMicroConfigObservableSpy = spyOn<any>(service, '_createBuildMicroConfigObservable').and.returnValue(of(config));
  //   const loadScriptSpy = spyOn(service, 'loadScript').and.returnValue(of(true));
  //
  //   service[`_createInnerMicroBuildObservable`]('000', '111', true).subscribe();
  //
  //   expect(loadBuildHashSpy).toHaveBeenCalled();
  //   expect(_createBuildMicroConfigObservableSpy).toHaveBeenCalled();
  //   expect(loadScriptSpy).toHaveBeenCalled();
  //
  // });

  it('should createBuildHashObservable - http.get OK', () => {

    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('resourceUrl');

    service[`_createBuildHashObservable`]('000').subscribe();

    const req = http.expectOne('resourceUrl');

    expect(req.request.method).toEqual('GET');

    req.flush(of({ micro: '000' }));

    expect(getResourceUrlSpy).toHaveBeenCalled();

  });

  it('should createBuildHashObservable - http.get Error', () => {

    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('resourceUrl');

    service[`_createBuildHashObservable`]('000').subscribe(
      () => { fail(); },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      },
    );

    const req = http.expectOne('resourceUrl');

    expect(req.request.method).toEqual('GET');

    req.error(new ErrorEvent('Error'), { status: 500, statusText: 'Internal Server Error' });

    expect(getResourceUrlSpy).toHaveBeenCalled();

  });

  it('should createBuildHashObservable - already exists', () => {

    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('resourceUrl');

    setRegistry(service, 'buildHashes', { key: '000', code: { micro: 'test' } });

    service[`_createBuildHashObservable`]('000').subscribe(v => {
      expect(v).toEqual('test');
    });

    expect(getResourceUrlSpy).not.toHaveBeenCalled();

  });

  it('should createBuildMicroConfigObservable - http.get OK', () => {

    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('resourceUrl');

    service[`_createBuildMicroConfigObservable`]('000').subscribe();

    const req = http.expectOne('resourceUrl');

    expect(req.request.method).toEqual('GET');

    req.flush(of({ micro: '000' }));

    expect(getResourceUrlSpy).toHaveBeenCalled();

  });

  it('should createBuildMicroConfigObservable - http.get Error', () => {

    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('resourceUrl');

    service[`_createBuildMicroConfigObservable`]('000').subscribe(
      () => { fail(); },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      },
    );

    const req = http.expectOne('resourceUrl');

    expect(req.request.method).toEqual('GET');

    req.error(new ErrorEvent('Error'), { status: 500, statusText: 'Internal Server Error' });

    expect(getResourceUrlSpy).toHaveBeenCalled();

  });

  it('should createBuildMicroConfigObservable - already exists', () => {

    const getResourceUrlSpy = spyOn(service, 'getResourceUrl').and.returnValue('resourceUrl');

    setRegistry(service, 'buildMicroConfigs', { key: '000', code: { test: true } });

    service[`_createBuildMicroConfigObservable`]('000').subscribe(v => {
      expect(v.test).toBe(true);
    });

    expect(getResourceUrlSpy).not.toHaveBeenCalled();

  });

  it('should getResourceUrl', () => {

    const input = {
      microCode: '000',
      buildHash: 'hash-000',
      resourceName: 'name',
      resourceType: 'type',
    };
    const expectedOutputConfig = 'test/name.type?hash-000';
    const expectedOutputNoConfig = '/dist_ext/000/name.type';

    expect(service.getResourceUrl(input.microCode, input.buildHash, input.resourceName, input.resourceType, true))
      .toEqual(expectedOutputNoConfig);
    expect(service.getResourceUrl(input.microCode, input.buildHash, input.resourceName, input.resourceType, false))
      .toMatch(/\?\d+/);

    setConfig(service, '000', 'test');

    expect(service.getResourceUrl(input.microCode, input.buildHash, input.resourceName, input.resourceType, true))
      .toEqual(expectedOutputConfig);
    expect(service.getResourceUrl(input.microCode, '', input.resourceName, input.resourceType))
      .toEqual('test/name.type');

  });

  it('should loadBuildHash', () => {

    const createBuildHashObservableSpy = spyOn<any>(service, '_createBuildHashObservable').and.returnValue(of('test'));

    service.loadBuildHash('000').subscribe(v => {
      expect(v).toEqual('test');
    });

    service[`buildHashObservables`]['000'] = of('test');

    service.loadBuildHash('000').subscribe(v => {
      expect(v).toEqual('test');
    });

    expect(createBuildHashObservableSpy).toHaveBeenCalledTimes(1);

  });

  it('should loadBuildMicroConfig', () => {

    const createBuildMicroConfigObservableSpy = spyOn<any>(service, '_createBuildMicroConfigObservable').and.returnValue(of('test'));

    service.loadBuildMicroConfig('000').subscribe(v => {
      expect(v).toEqual('test');
    });

    service[`buildMicroConfigObservables`]['000'] = of('test');

    service.loadBuildMicroConfig('000').subscribe(v => {
      expect(v).toEqual('test');
    });

    expect(createBuildMicroConfigObservableSpy).toHaveBeenCalledTimes(1);

  });

  it('should loadBuild', () => {

    const createBuildObservableSpy = spyOn<any>(service, '_createBuildObservable').and.returnValue(of(true));

    service.loadBuild('000', true).subscribe(v => {
      expect(v).toBe(true);
    });

    service[`buildObservables`]['000'] = of(true);

    service.loadBuild('000').subscribe(v => {
      expect(v).toBe(true);
    });

    expect(createBuildObservableSpy).toHaveBeenCalledTimes(1);

  });

  it('should loadInnerMicroBuild', () => {

    const createInnerMicroBuildObservable = spyOn<any>(service, '_createInnerMicroBuildObservable').and.returnValue(of(true));

    service.loadInnerMicroBuild('000', '111', true).subscribe(v => {
      expect(v).toBe(true);
    });

    service[`innerBuildObservables`]['000'] = of(true);

    service.loadInnerMicroBuild('000', '111').subscribe(v => {
      expect(v).toBe(true);
    });

    expect(createInnerMicroBuildObservable).toHaveBeenCalledTimes(1);

  });

  it('should check isScriptLoaded', () => {

    setRegistry(service, 'scripts', { key: 'testUrl', code: { loaded: true } });

    expect(service.isScriptLoaded('testUrl')).toBe(true);

  });

  it('should check isScriptLoadedByCode', () => {

    setRegistry(service, 'scripts', { key: 'testUrl', code: { loaded: true, code: '(test) => { test = \'microCode\' }' } });

    expect(service.isScriptLoadedbyCode('(test) => { test = \'microCode\' }')).toBe(true);

    Object.defineProperty(service, 'registry', { value: undefined });

    expect(service.isScriptLoadedbyCode('(test) => { test = \'microCode\' }')).toBeUndefined();

  });

  it('should load script', waitForAsync(() => {

    const url = 'testUrl';
    const microCode = 'microCode';

    service.loadScript(url, microCode);

    setRegistry(service, 'scripts', { key: 'testUrl', code: { loaded: true } });

    service.loadScript(url, microCode).subscribe(r => {
      expect(r).toBe(true);
    });


  }));

  it('should unload script', () => {

    service.unloadScript('testUrl');

    setRegistry(service, 'scripts', { key: 'testUrl', code: { loaded: true } });

    service.unloadScript('testUrl');

    expect(service[`registry`].scripts['testUrl'].loaded).toBe(false);

  });

  it('should markScriptAsLoaded', () => {

    const url = 'testUrl';
    const microCode = 'microCode';

    setRegistry(service, 'scripts', { key: 'testUrl', code: { loaded: true } });

    service[`markScriptAsLoaded`](url, microCode);

    expect(service[`registry`].scripts[url].loaded).toBe(true);

  });

  afterAll(() => {

    http.verify();

  });

});
