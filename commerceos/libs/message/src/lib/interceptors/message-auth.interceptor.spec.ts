import { HttpRequest } from '@angular/common/http';

import { of } from 'rxjs';

import { PeMessageAuthInterceptor } from './message-auth.interceptor';

describe('PeMessageAuthInterceptor', () => {
  const peAuthService = { token: 'test-token' };
  const envConfig = {
    custom: {
      cdn: 'c-cdn',
      translation: 'c-translation',
      storage: 'c-storage',
    },
  };
  const interceptor = new PeMessageAuthInterceptor(peAuthService as any, envConfig as any);

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should intercept', () => {
    let req = new HttpRequest('GET', 'url/test');
    const nextMock = {
      handle: jasmine.createSpy('handle').and.returnValue(of({ test: true })),
    };

    /**
     * req.url is 'url/test'
     */
    interceptor.intercept(req, nextMock).subscribe();

    expect(nextMock.handle).toHaveBeenCalledWith(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${peAuthService.token}`,
          'Cache-Control': 'no-cache',
        },
      }),
    );

    /**
     * req.url is 'url/c-translation', 'url/c-cdn', 'url/c-storage'
     */
    for (const url of Object.values(envConfig.custom)) {
      req = new HttpRequest('GET', url);

      interceptor.intercept(req, nextMock).subscribe();

      expect(nextMock.handle).toHaveBeenCalledWith(req);
    }
  });
});
