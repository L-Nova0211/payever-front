import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import * as Cookie from 'js-cookie';
import { of } from 'rxjs';

import { ThirdPartyInternalFormService } from './third-party-form.service';

describe('ThirdPartyInternalFormService', () => {

  let service: ThirdPartyInternalFormService;
  let http: jasmine.SpyObj<HttpClient>;

  const businessId = 'b-001';
  const businessName = 'Business 1';
  const terminalMock = {
    _id: 'pos-001',
    logo: 'logo.png',
  };
  const qrText = 'qr.text';

  beforeEach(() => {

    const integrationMock = {
      extension: {
        url: 'url/test/',
        formAction: {
          endpoint: 'start/{businessId}/end',
        },
      },
    };

    http = jasmine.createSpyObj<HttpClient>('HttpClient', ['post']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ThirdPartyInternalFormService, useFactory: () => {
            return new ThirdPartyInternalFormService(
              http,
              {} as any,
              businessId,
              businessName,
              integrationMock,
              terminalMock,
              qrText,
            );
          },
        },
      ],
    });

    service = TestBed.inject(ThirdPartyInternalFormService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should request initial form', () => {

    const url = `url/test/start/${businessId}/end`;
    const cookieSpy = spyOn(Cookie, 'get').and.returnValue('token');

    http.post.and.returnValue(of(null));

    service.requestInitialForm().subscribe();

    expect(http.post).toHaveBeenCalledWith(url, {
      businessId,
      businessName,
      url: qrText,
      id: terminalMock._id,
      avatarUrl: terminalMock.logo,
    }, {
      headers: {
        authorization: 'Bearer token',
      },
    });
    expect(cookieSpy).toHaveBeenCalledWith('pe_auth_token');

  });

  it('should execute action', () => {

    expect(service.executeAction(null, null)).toBeNull();

  });

  it('should get action url', () => {

    expect(service.getActionUrl(null)).toBeNull();

  });

  it('should allow custom actions', () => {

    expect(service.allowCustomActions()).toBe(true);

  });

  it('should prepare url', () => {

    const url = 'url/test';

    expect(service.prepareUrl(url)).toEqual(url);

  });

  it('should allowDownload', () => {

    expect(service.allowDownload()).toBe(true);

  });

});
