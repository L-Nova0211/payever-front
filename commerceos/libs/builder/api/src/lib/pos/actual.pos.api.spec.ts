import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PebEnvService } from '@pe/builder-core';

import {
  PebActualPosApi,
  PEB_BUILDER_POS_API_PATH,
  PEB_CONNECT_API_PATH,
  PEB_POS_API_PATH,
} from './actual.pos.api';

describe('PebActualPosApi', () => {

  let api: PebActualPosApi;
  let http: HttpTestingController;
  let posApiPath: string;
  let builderPosApiPath: string;
  let connectApiPath: string;

  const businessId = '000-111';
  const terminalId = '999';

  beforeEach(() => {

    const envServiceMock = {
      businessId,
      terminalId,
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebActualPosApi,
        { provide: PEB_POS_API_PATH, useValue: 'pos-api' },
        { provide: PEB_BUILDER_POS_API_PATH, useValue: 'builder-pos-api' },
        { provide: PEB_CONNECT_API_PATH, useValue: 'connect-api' },
        { provide: PebEnvService, useValue: envServiceMock },
      ],
    });

    api = TestBed.inject(PebActualPosApi);

    http = TestBed.inject(HttpTestingController);
    posApiPath = TestBed.inject(PEB_POS_API_PATH);
    builderPosApiPath = TestBed.inject(PEB_BUILDER_POS_API_PATH);
    connectApiPath = TestBed.inject(PEB_CONNECT_API_PATH);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get business id', () => {

    expect(api[`businessId`]).toEqual(businessId);

  });

  it('should get terminal id', () => {

    expect(api[`terminalId`]).toEqual(terminalId);

  });

  it('should get terminals list', () => {

    const url = `${posApiPath}/business/${businessId}/application`;
    let req: TestRequest;

    /**
     * argument isDefault is undefined as default
     */
    api.getTerminalsList().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('isDefault')).toBe(false);

    /**
     * argument isDefault is set
     */
    api.getTerminalsList(true).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.get('isDefault')).toEqual(JSON.stringify(true));

  });

  it('should get single terminal', () => {

    const url = `${posApiPath}/business/${businessId}/application/${terminalId}`;

    api.getSingleTerminal(terminalId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should create terminal', () => {

    const payload = { test: true };
    const url = `${posApiPath}/business/${businessId}/application`;

    api.createTerminal(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(payload);

  });

  it('should delete terminal', () => {

    const url = `${posApiPath}/business/${businessId}/application/${terminalId}`;

    api.deleteTerminal(terminalId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(null);

  });

  it('should update terminal', () => {

    const payload = {
      id: terminalId,
      test: true,
    };
    const url = `${posApiPath}/business/${businessId}/application/${terminalId}`;

    api.updateTerminal(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    delete payload.id;

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should update terminal deploy', () => {

    const accessId = 'access-001';
    const payload = { test: true };
    const url = `${posApiPath}/business/${businessId}/application/access/${accessId}`;

    api.updateTerminalDeploy(accessId, payload as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should get terminal preview', () => {

    const url = `${builderPosApiPath}/business/${businessId}/application/${terminalId}/preview`;

    api.getTerminalPreview(terminalId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should mark terminal as active', () => {

    const url = `${posApiPath}/business/${businessId}/application/${terminalId}/active`;

    api.markTerminalAsActive(terminalId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({});

  });

  it('should get integrations info', () => {

    const url = `${posApiPath}/business/${businessId}/integration`;

    api.getIntegrationsInfo(businessId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get integration info', () => {

    const integration = 'integration-001';
    const url = `${posApiPath}/business/${businessId}/integration/${integration}`;

    api.getIntegrationInfo(businessId, integration).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get connect integration info', () => {

    const integrationId = 'integration-001';
    const url = `${connectApiPath}/integration/${integrationId}`;

    api.getConnectIntegrationInfo(integrationId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get terminal enabled integrations', () => {

    const url = `${posApiPath}/business/${businessId}/application/${terminalId}/integration`;

    api.getTerminalEnabledIntegrations(businessId, terminalId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should toggle terminal integration', () => {

    const integrationName = 'name';
    const url = `${posApiPath}/business/${businessId}/application/${terminalId}/integration/${integrationName}`;
    let req: TestRequest;

    // enabled = FALSE
    api.toggleTerminalIntegration(businessId, terminalId, integrationName, false).subscribe();

    req = http.expectOne(`${url}/uninstall`);
    req.flush(null);

    expect(req.request.method).toEqual('PATCH');

    // enabled = TRUE
    api.toggleTerminalIntegration(businessId, terminalId, integrationName, true).subscribe();

    req = http.expectOne(`${url}/install`);
    req.flush(null);

    expect(req.request.method).toEqual('PATCH');

  });

  it('should get terminal active theme', () => {

    const url = `${builderPosApiPath}/business/${businessId}/application/${terminalId}/themes/active`;

    api.getTerminalActiveTheme(terminalId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get terminal themes', () => {

    const url = `${builderPosApiPath}/business/${businessId}/application/${terminalId}/themes`;

    api.getTerminalThemes(terminalId, businessId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get terminal theme versions', () => {

    const themeId = 'theme-001';
    const url = `${builderPosApiPath}/theme/${themeId}/versions`;

    api.getTerminalThemeVersions(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should create terminal theme version', () => {

    const themeId = 'theme-001';
    const name = 'version';
    const url = `${builderPosApiPath}/theme/${themeId}/version`;

    api.createTerminalThemeVersion(themeId, name).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ name });

  });

  it('should delete terminal theme version', () => {

    const themeId = 'theme-001';
    const versionId = 'version-001';
    const url = `${builderPosApiPath}/theme/${themeId}/version/${versionId}`;

    api.deleteTerminalThemeVersion(themeId, versionId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should publish terminal theme version', () => {

    const themeId = 'theme-001';
    const versionId = 'version-001';
    const url = `${builderPosApiPath}/theme/${themeId}/version/${versionId}/publish`;

    api.publishTerminalThemeVersion(themeId, versionId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should instant setup', () => {

    const url = `${builderPosApiPath}/business/${businessId}/application/${terminalId}/instant-setup`;

    api.instantSetup().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  afterAll(() => {

    http.verify();

  });

});
