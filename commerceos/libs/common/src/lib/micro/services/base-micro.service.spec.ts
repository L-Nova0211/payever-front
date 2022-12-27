import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BackendLoggerService } from '../../backend-logger';
import { PE_ENV } from '../../environment-config';

import { BaseMicroService } from './base-micro.service';

describe('BaseMicroService', () => {

  let service: BaseMicroService;
  let logger: jasmine.SpyObj<BackendLoggerService>;

  function setRegistry(prop: string, value: { key: string, code: any }): void {
    service[`registry`][prop] = {
      [value.key]: value.code,
    };
  }

  beforeEach(() => {

    const loggerSpy = jasmine.createSpyObj<BackendLoggerService>('BackendLoggerService', ['logError']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: BackendLoggerService, useValue: loggerSpy },
        { provide: PE_ENV, useValue: {} },
      ],
    });

    service = new BaseMicroService(TestBed);
    logger = TestBed.inject(BackendLoggerService) as jasmine.SpyObj<BackendLoggerService>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should check is script loaded', () => {

    const url = 'test/url';

    /**
     * mockdata.loaded is FALSE
     * so expect result to be FALSE
     */
    setRegistry('scripts', { key: url, code: { loaded: false } });
    expect(service.isScriptLoaded(url)).toBe(false);

    /**
     * mockdata.loaded is TRUE
     * so expect result to be TRUE
     */
    setRegistry('scripts', { key: url, code: { loaded: true } });
    expect(service.isScriptLoaded(url)).toBe(true);

  });

  it('should check is script loaded by code', () => {

    const script = {
      loaded: true,
      code: 'code',
    };
    const regSpy = spyOnProperty<any>(service, 'registry');

    /**
     * service.registry is null
     */
    regSpy.and.returnValue(null);
    expect(service.isScriptLoadedbyCode(script.code)).toBeUndefined();

    /**
     * service.registry is defined
     */
    regSpy.and.returnValue({ scripts: {} });
    setRegistry('scripts', { key: 'test', code: script });

    expect(service.isScriptLoadedbyCode(script.code)).toBe(true);

  });

  it('should load script', () => {

    const url = 'test/url';
    const microCode = 'code';
    const loadedSpy = spyOn(service, 'isScriptLoaded').and.returnValue(true);
    const markSpy = spyOn<any>(service, 'markScriptAsLoaded');

    const scriptMock = document.createElement('script');
    const createSpy = spyOn(document, 'createElement');

    const n = window.navigator;
    const s = window.screen;
    const userDetails = `${n.platform} / ${n.language} / ${s.width}x${s.height} / ${n.userAgent}`;

    /**
     * service.isScriptLoaded returns TRUE
     */
    service.loadScript(url, microCode).subscribe(result => expect(result).toBe(true));

    expect(loadedSpy).toHaveBeenCalledWith(url);
    expect(markSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    expect(logger.logError).not.toHaveBeenCalled();

    /**
     * service.isScriptLoaded returns FALSE
     */
    loadedSpy.and.returnValue(false);
    createSpy.and.callFake(() => {
      return scriptMock;
    });

    service.loadScript(url, microCode).subscribe(result => expect(result).toBe(true));

    /**
     * triggering created script's onerror function
     */
    scriptMock.onerror(null);

    expect(logger.logError).toHaveBeenCalled();
    expect(logger.logError.calls.argsFor(0)[0]).toContain(userDetails);

    /**
     * triggering created script's onload function
     */
    scriptMock.onload(null);

    expect(markSpy).toHaveBeenCalledWith(url, microCode);

    /**
     * dispatch load event on created script
     */
    scriptMock.dispatchEvent(new Event('load'));

  });

  it('should unload script', () => {

    const url = 'new/test/url';
    const script = document.createElement('script');

    script.src = url;

    /**
     * script does not exist in service.registry.scripts
     */
    document.body.appendChild(script);
    service.unloadScript(url);

    expect(service[`registry`].scripts[url]).toBeUndefined();
    expect(document.querySelector(`script[src="${url}"]`)).toBeNull();

    /**
     * script exists in service.registry.scripts
     */
    document.body.appendChild(script);
    setRegistry('scripts', { key: url, code: { loaded: true, code: 'code' } });
    service.unloadScript(url);

    expect(service[`registry`].scripts[url]).toEqual({ loaded: false, code: 'code' });
    expect(document.querySelector(`script[src="${url}"]`)).toBeNull();

  });

  it('should mark script as loaded', () => {

    const url = 'new/test/url/new';
    const microCode = 'code';
    const nextSpy = spyOn(service.scriptLoaded$, 'next');

    service[`markScriptAsLoaded`](url, microCode);

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(service[`registry`].scripts[url]).toEqual({
      loaded: true,
      code: microCode,
    });

  });

});
