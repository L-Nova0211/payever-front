import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EnvService, PE_ENV } from '@pe/common';

import { PEB_POS_API_PATH } from '../../constants/constants';

import { ActualPosApi } from './pos.api';

describe('ActualPosApi', () => {

  let api: ActualPosApi;
  let http: HttpTestingController;

  const businessId = 'b-001';
  const posId = 'pos-001';
  const posApiPath = 'api/pos';

  beforeEach(() => {

    const envMock = {
      backend: {
        connect: 'be-connect',
      },
    };

    const envServiceMock = { businessId, posId };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ActualPosApi,
        { provide: PE_ENV, useValue: envMock },
        { provide: EnvService, useValue: envServiceMock },
        { provide: PEB_POS_API_PATH, useValue: posApiPath },
      ],
    });

    api = TestBed.inject(ActualPosApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get business id', () => {

    expect(api[`businessId`]).toEqual(businessId);

  });

  it('should get pos id', () => {

    expect(api[`posId`]).toEqual(posId);

  });

  it('should get pos list', () => {

    const url = `${posApiPath}/business/${businessId}/terminal`;

    api.getPosList().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get single pos', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/${posId}`;

    api.getSinglePos(posId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should create pos', () => {

    const payload = {
      name: 'Terminal 1',
      logo: 'logo.svg',
    };
    const url = `${posApiPath}/business/${businessId}/terminal`;

    api.createPos(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(payload);

  });

  it('should validate pos name', () => {

    const name = 'Terminal 1';
    const url = `${posApiPath}/business/${businessId}/terminal/isValidName?name=${name}`;

    api.validatePosName(name).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should delete pos', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/${posId}`;

    api.deletePos(posId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should update pos', () => {

    const payload = {
      name: 'Terminal 1',
      logo: 'logo.svg',
    };
    const url = `${posApiPath}/business/${businessId}/terminal/${posId}`;

    api.updatePos(posId, payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should mark pos as default', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/${posId}/active`;

    api.markPosAsDefault(posId).subscribe();

    const req = http.expectOne(url);
    req.flush(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({});

  });

  it('should update pos deploy', () => {

    const payload = { isLive: true };
    const url = `${posApiPath}/business/${businessId}/terminal/access/${posId}`;

    api.updatePosDeploy(posId, payload as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should update pos access config', () => {

    const payload = { isLive: true };
    const url = `${posApiPath}/business/${businessId}/terminal/access/${posId}`;

    api.updatePosAccessConfig(posId, payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should check is live', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/access/${posId}/is-live`;

    api.checkIsLive(posId).subscribe();

    const req = http.expectOne(url);
    req.flush(true);

    expect(req.request.method).toEqual('GET');

  });

  it('should patch is live', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/access/${posId}`;

    api.patchIsLive(posId, true).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ isLive: true });

  });

  it('should add social image', () => {

    const accessId = 'access-001';
    const image = 'image.jpg';
    const url = `${posApiPath}/business/${businessId}/terminal/access/${accessId}`;

    api.addSocialImage(accessId, image).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ socialImage: image });

  });

  it('should instantly setup', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/${posId}/instant-setup`;

    api.instantSetup().subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should get integrations info', () => {

    const url = `${posApiPath}/business/${businessId}/integration`;

    api.getIntegrationsInfo(businessId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get integration info', () => {

    const integration = 'test';
    const url = `${posApiPath}/business/${businessId}/integration/${integration}`;

    api.getIntegrationInfo(businessId, integration).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get connect integration info', () => {

    const integrationId = 'i-001';
    const url = `be-connect/api/integration/${integrationId}`;

    api.getConnectIntegrationInfo(integrationId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get terminal enabled integrations', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/${posId}/integration`;

    api.getTerminalEnabledIntegrations(businessId, posId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('GET');

  });

  it('should toggle terminal integration', () => {

    const integrationName = 'test';
    const url = `${posApiPath}/business/${businessId}/terminal/${posId}/integration/${integrationName}`;
    let req: TestRequest;

    /**
     * argument enabled is FALSE
     */
    api.toggleTerminalIntegration(businessId, posId, integrationName, false).subscribe();

    req = http.expectOne(`${url}/uninstall`);
    req.flush(null);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({});

    /**
     * argument enabled is TRUE
     */
    api.toggleTerminalIntegration(businessId, posId, integrationName, true).subscribe();

    req = http.expectOne(`${url}/install`);
    req.flush(null);

  });

  afterAll(() => {

    http.verify();

  });

});
