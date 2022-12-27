import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebCacheInterceptor } from './cache.interceptor';
import { PebCacheMapService } from './cache.service';

describe('PebCacheInterceptor', () => {

  let interceptor: PebCacheInterceptor;
  let cache: jasmine.SpyObj<PebCacheMapService>;

  beforeEach(() => {

    const cacheSpy = jasmine.createSpyObj<PebCacheMapService>('PebCacheMapService', {
      get: null,
      put: undefined,
    });

    TestBed.configureTestingModule({
      providers: [
        PebCacheInterceptor,
        { provide: PebCacheMapService, useValue: cacheSpy },
      ],
    });

    interceptor = TestBed.inject(PebCacheInterceptor);
    cache = TestBed.inject(PebCacheMapService) as jasmine.SpyObj<PebCacheMapService>;

  });

  it('should be defined', () => {

    expect(interceptor).toBeDefined();

  });

  it('should intecept', () => {

    const handlerSpy = {
      handle: jasmine.createSpy('handle').and.returnValue(of({})),
    };
    const req = {
      method: 'GET',
    };

    // reuqestCachable = FALSE
    req.method = 'POST';

    interceptor.intercept(req as any, handlerSpy as any).subscribe();

    expect(handlerSpy.handle).toHaveBeenCalledWith(req);
    expect(cache.put).not.toHaveBeenCalled();

    // requestCachable = TRUE
    // w/ cached response
    handlerSpy.handle.calls.reset();
    req.method = 'GET';

    cache.get.and.returnValue({ test: true } as any);

    interceptor.intercept(req as any, handlerSpy as any).subscribe((response: any) => {
      expect(response.test).toBe(true);
      expect(handlerSpy.handle).not.toHaveBeenCalled();
      expect(cache.put).not.toHaveBeenCalled();
    });

    // w/o cached response
    // event IS instanceof HttpResponse
    cache.get.and.returnValue(null);
    handlerSpy.handle.and.returnValue(of(new HttpResponse({
      body: { test: true },
    })));

    interceptor.intercept(req as any, handlerSpy as any).subscribe();

    expect(handlerSpy.handle).toHaveBeenCalled();
    expect(cache.put).toHaveBeenCalled();

    // event IS NOT instanceof HttpResponse
    cache.put.calls.reset();

    handlerSpy.handle.and.returnValue(of({ test: true }));

    interceptor.intercept(req as any, handlerSpy as any).subscribe();

    expect(cache.put).not.toHaveBeenCalled();

  });

});
