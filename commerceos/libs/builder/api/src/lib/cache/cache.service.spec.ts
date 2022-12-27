import { of } from 'rxjs';

import { PebCacheMapService } from './cache.service';

describe('PebCacheMapService', () => {

  const service = new PebCacheMapService();

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should put into cache', () => {

    const deleteSpy = spyOn<any>(service, 'deleteExpiredCache').and.callThrough();
    const req = {
      urlWithParams: 'test.test?test=true',
    };
    const res = {
      body: of({ test: true }),
    };

    service.put(req as any, res as any);

    expect(deleteSpy).toHaveBeenCalled();

  });

  it('should get cached request', () => {

    const req = {
      urlWithParams: 'test.test?test=true',
    };
    const res = {
      body: of({ test: true }),
    };

    service.put(req as any, res as any);

    // w/ entry
    // NOT expired
    service.get(req as any).body.subscribe((response) => {
      expect(response.test).toBe(true);
    });

    // IS expired
    service.cacheMap.get(req.urlWithParams).entryTime -= 35000;

    expect(service.get(req as any)).toBeNull();

    // w/o entry
    service.cacheMap.clear();

    expect(service.get(req as any)).toBeNull();

  });

  it('should delete expired cache', () => {

    const req = {
      urlWithParams: 'test.test?test=true',
    };
    const res = {
      body: of({ test: true }),
    };

    service.put(req as any, res as any);
    service.cacheMap.get(req.urlWithParams).entryTime -= 35000;

    service[`deleteExpiredCache`]();

    expect(service.cacheMap.size).toBe(0);

  });

  afterEach(() => {

    service.cacheMap.clear();

  });

});
