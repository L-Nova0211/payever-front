import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EnvService, PE_ENV } from '@pe/common';

import { PosConnectService } from './pos-connect.service';

describe('PosConnectService', () => {

  let service: PosConnectService;
  let http: HttpTestingController;

  beforeEach(() => {

    const envServiceMock = {
      businessId: 'b-001',
      businessName: 'Business 1',
    };

    const envMock = {
      frontend: {
        checkoutWrapper: 'checkout/wrapper',
      },
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PosConnectService,
        { provide: EnvService, useValue: envServiceMock },
        { provide: PE_ENV, useValue: envMock },
      ],
    });

    service = TestBed.inject(PosConnectService);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get integration', () => {

    const integration = { id: 'i-001' };
    const getSpy = spyOnProperty(service, 'integration').and.callThrough();

    service.integration$.next(integration);

    expect(service.integration).toEqual(integration);
    expect(getSpy).toHaveBeenCalled();

  });

  it('should get terminal', () => {

    const terminal = { _id: 'pos-001' };
    const getSpy = spyOnProperty(service, 'terminal').and.callThrough();

    service.terminal$.next(terminal);

    expect(service.terminal).toEqual(terminal);
    expect(getSpy).toHaveBeenCalled();

  });

  it('should get checkout wrapper customer view link', () => {

    const terminal = {
      _id: 'pos-001',
      channelSet: 'ch-001',
    };

    service.terminal$.next(terminal);
    expect(service.checkoutWrapperCustomerViewLink).toEqual('checkout/wrapper/pay/create-flow-from-qr/channel-set-id/ch-001');

  });

  it('should request initial form', () => {

    const integration = {
      id: 'i-001',
      extension: {
        url: 'url/extension',
      },
    };
    const terminal = {
      _id: 'pos-001',
      logo: 'logo.svg',
      channelSet: 'ch-001',
    };
    const url = `${integration.extension.url}/app/b-001/generate`;

    service.integration$.next(integration);
    service.terminal$.next(terminal);
    service.requestInitialForm().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      businessId: 'b-001',
      businessName: 'Business 1',
      url: 'checkout/wrapper/pay/create-flow-from-qr/channel-set-id/ch-001',
      id: terminal._id,
      avatarUrl: terminal.logo,
    });

  });

  afterAll(() => {

    http.verify();

  });

});
