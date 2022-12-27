import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EnvService } from '@pe/common';

import { PEB_SITE_API_PATH } from '../../constants';
import { SiteEnvService } from '../site-env.service';

import { PebActualSitesApi } from './actual.sites.api';

describe('PebActualSitesApi', () => {

  let api: PebActualSitesApi;
  let http: HttpTestingController;
  let envService: jasmine.SpyObj<SiteEnvService>;

  const siteApiPath = '/site/api';
  const businessId = 'b-001';
  const siteId = 'site-001';

  beforeEach(() => {

    const envServiceMock = { businessId };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        PebActualSitesApi,
        { provide: EnvService, useValue: envServiceMock },
        { provide: PEB_SITE_API_PATH, useValue: siteApiPath },
      ],
    });

    api = TestBed.inject(PebActualSitesApi);
    http = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(SiteEnvService);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get business id', () => {

    expect(api[`businessId`]).toEqual(businessId);

  });

  it('should get site list', () => {

    const url = `${siteApiPath}/api/business/${businessId}/site`;

    api.getSiteList().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should get single site', () => {

    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}`;

    api.getSingleSite(siteId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should create site', () => {

    const payload = { name: 'site' };
    const url = `${siteApiPath}/api/business/${businessId}/site`;

    api.createSite(payload).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(of({}));

  });

  it('should delete site', () => {

    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}`;

    api.deleteSite(siteId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of(null));

  });

  it('should update site', () => {

    const payload = { name: 'site' };
    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}`;

    api.updateSite(siteId, payload).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

    req.flush(of({}));

  });

  it('should mark site as default', () => {

    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}/default`;

    api.markSiteAsDefault(siteId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should update site deploy', () => {

    const accessId = 'access-001';
    const payload = { test: true };
    const url = `${siteApiPath}/api/business/${businessId}/site/access/${accessId}`;

    api.updateSiteDeploy(accessId, payload).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

    req.flush(of({}));

  });

  it('should validate site name', () => {

    const domain = 'domain';
    const url = `${siteApiPath}/api/business/${businessId}/site/isValidName`;

    api.validateSiteName(domain).subscribe();

    const request = http.expectOne(req => req.url === url);

    expect(request.request.method).toEqual('GET');
    expect(request.request.params.get('name')).toEqual(domain);

    request.flush(of({ result: true }));

  });

  it('should get all domains', () => {

    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}/domain`;

    api.getAllDomains(siteId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should create domain', () => {

    const body = { name: 'domain' };
    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}/domain`;

    api.createDomain(siteId, body).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(body);

    req.flush(of({}));

  });

  it('should update domain', () => {

    const domainId = 'dom-001';
    const body = { name: 'domain' };
    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}/domain/${domainId}`;

    api.updateDomain(siteId, domainId, body).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(body);

    req.flush(of({}));

  });

  it('should remove domain', () => {

    const domainId = 'dom-001';
    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}/domain/${domainId}`;

    api.removeDomain(siteId, domainId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of({}));

  });

  it('should patch is live', () => {

    const isLive = true;
    const url = `${siteApiPath}/api/business/${businessId}/site/access/${siteId}`;

    api.patchIsLive(siteId, isLive).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ isLive });

    req.flush(of(null));

  });

  it('should add social image', () => {

    const socialImage = 'image.jpg';
    const url = `${siteApiPath}/api/business/${businessId}/site/access/${siteId}`;

    api.addSocialImage(siteId, socialImage).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ socialImage });

    req.flush(of({}));

  });

  it('should update site access config', () => {

    const payload = { test: true };
    const url = `${siteApiPath}/api/business/${businessId}/site/access/${siteId}`;

    api.updateSiteAccessConfig(siteId, payload).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

    req.flush(of({}));

  });

  it('should add domain', () => {

    const domain = 'domain';
    const url = `${siteApiPath}/api/business/${envService.businessId}/site/${siteId}/domain`;

    api.addDomain(siteId, domain).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ name: domain });

    req.flush(of({}));

  });

  it('should check domain', () => {

    const domainId = 'dom-001';
    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}/domain/${domainId}/check`;

    api.checkDomain(siteId, domainId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should patch domain', () => {

    const domainId = 'dom-001';
    const domain = 'domain';
    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}/domain/${domainId}`;

    api.patchDomain(siteId, domainId, domain).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ name: domain });

    req.flush(of({}));

  });

  it('should delete domain', () => {

    const domainId = 'dom-001';
    const url = `${siteApiPath}/api/business/${businessId}/site/${siteId}/domain/${domainId}`;

    api.deleteDomain(siteId, domainId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of({}));

  });

  afterAll(() => {

    http.verify();

  });

});
