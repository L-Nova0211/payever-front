import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EnvService } from '@pe/common';

import { PEB_POS_API_BUILDER_PATH } from '../../constants/constants';

import { ActualBuilderPosApi } from './builder-pos.api';

describe('ActualBuilderPosApi', () => {

  let api: ActualBuilderPosApi;
  let http: HttpTestingController;

  const businessId = 'b-001';
  const posId = 'pos-001';
  const themeId = 't-001';
  const editorApiPath = 'api/editor';

  beforeEach(() => {

    const envServiceMock = { businessId };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ActualBuilderPosApi,
        { provide: EnvService, useValue: envServiceMock },
        { provide: PEB_POS_API_BUILDER_PATH, useValue: editorApiPath },
      ],
    });

    api = TestBed.inject(ActualBuilderPosApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get business id', () => {

    expect(api[`businessId`]).toEqual(businessId);

  });

  it('should get pos preview', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/preview`;

    api.getPosPreview(posId).subscribe();

    const req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('include')).toEqual('published');
    expect(req.request.params.get('page')).toEqual('front');

  });

  it('should get pos active theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/themes`;

    api.getPosActiveTheme(posId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get themes list', () => {

    const url = `${editorApiPath}/${businessId}/terminal/${posId}/theme`;

    api.getThemesList(posId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme by id', () => {

    const url = `${editorApiPath}/theme/${themeId}`;

    api.getThemeById(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get template themes', () => {

    const url = `${editorApiPath}/api/templates`;

    api.getTemplateThemes().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get template item themes', () => {

    const itemId = 'i-001';
    const url = `${editorApiPath}/api/template/item/${itemId}`;

    api.getTemplateItemThemes(itemId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/business/${businessId}/application/${posId}/theme/${themeId}/duplicate`;

    api.duplicateTemplateTheme(posId, themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/business/${businessId}/application/${posId}/theme/${themeId}`;

    api.deleteTemplateTheme(posId, themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/business/${businessId}/application/${posId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(posId, themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should install template theme', () => {

    const templateID = 'tmp-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${templateID}/install`;

    api.installTemplateTheme(posId, templateID).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should install default theme', () => {

    const url = `${editorApiPath}/business/${businessId}/application/${posId}/install`;

    api.installDefaultTheme(posId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should get pos theme by id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}`;

    api.getPosThemeById(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme detail', () => {

    const page = 'test';
    const url = `${editorApiPath}/api/theme/${themeId}/detail`;
    let req: TestRequest;

    /**
     * argument page is undefined as default
     */
    api.getThemeDetail(themeId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('page')).toBeNull();

    /**
     * argument page is set
     */
    api.getThemeDetail(themeId, page).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('page')).toEqual(page);

  });

  it('should get page', () => {

    const pageId = 'page-001';
    const url = `${editorApiPath}/api/theme/${themeId}/page/${pageId}`;
    let req: TestRequest;

    /**
     * argument screen is undefined as default
     */
    api.getPage(themeId, pageId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('screen')).toBeNull();

    /**
     * argument screen is set
     */
    api.getPage(themeId, pageId, 'test').subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('screen')).toEqual('test');

  });

  afterAll(() => {

    http.verify();

  });

});
