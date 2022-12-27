import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EnvService } from '@pe/common';

import { PEB_SITE_API_BUILDER_PATH } from '../../constants';

import { PebActualSiteBuilderApi } from './actual.site-builder.api';

describe('PebActualSiteBuilderApi', () => {

  let api: PebActualSiteBuilderApi;
  let http: HttpTestingController;

  const editorApiPath = '/editor/api';
  const businessId = 'b-001';
  const siteId = 'site-001';
  const themeId = 'theme-001';

  beforeEach(() => {

    const envServiceMock = { businessId };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        PebActualSiteBuilderApi,
        { provide: EnvService, useValue: envServiceMock },
        { provide: PEB_SITE_API_BUILDER_PATH, useValue: editorApiPath },
      ],
    });

    api = TestBed.inject(PebActualSiteBuilderApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get business id', () => {

    expect(api[`businessId`]).toEqual('b-001');

  });

  it('should get site preview', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${siteId}/preview`;

    api.getSitePreview(siteId).subscribe();

    const req = http.expectOne(r => r.url === url);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('include')).toEqual('published');
    expect(req.request.params.get('page')).toEqual('front');

    req.flush(of({}));

  });

  it('should get site active theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${siteId}/themes/active`;

    api.getSiteActiveTheme(siteId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get themes list', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${siteId}/themes`;

    api.getThemesList(siteId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should get theme by id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}`;

    api.getThemeById(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get template themes', () => {

    const url = `${editorApiPath}/api/templates`;

    api.getTemplateThemes().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/site/${siteId}/theme/${themeId}/duplicate`;

    api.duplicateTemplateTheme(siteId, themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/site/${siteId}/theme/${themeId}`;

    api.deleteTemplateTheme(siteId, themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of(() => { }));

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/site/${siteId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(siteId, themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${siteId}/theme/${themeId}/install`;

    api.installTemplateTheme(siteId, themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should create template theme', () => {

    const body = { test: true };
    const url = `${editorApiPath}/api/${themeId}/template`;

    api.createTemplateTheme(themeId, body).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(body);

    req.flush(of({}));

  });

  it('should update theme version', () => {

    const versionId = 'v-001';
    const body = { test: true };
    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}`;

    api.updateThemeVersion(themeId, versionId, body).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(body);

    req.flush(of({}));

  });

  afterAll(() => {

    http.verify();

  });

});
