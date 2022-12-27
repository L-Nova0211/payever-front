import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PebScreen } from '@pe/builder-core';
import { EnvService } from '@pe/common';
import { PebActualBlogEditorApi, PEB_BLOG_API_BUILDER_PATH } from './actual.blog-editor.api';

describe('PebActualBlogEditorApi', () => {

  let api: PebActualBlogEditorApi;
  let http: HttpTestingController;

  const envService = { businessId: 'b-001' };
  const editorApiPath = 'api/editor/blog';
  const themeId = 't-001';
  const blogId = 'blog-001';

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebActualBlogEditorApi,
        { provide: PEB_BLOG_API_BUILDER_PATH, useValue: editorApiPath },
        { provide: EnvService, useValue: envService },
      ],
    });

    api = TestBed.inject(PebActualBlogEditorApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get blog theme by id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}`;

    api.getBlogThemeById(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme detail', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/detail`;
    const page: any = { id: 'p-001' };
    let req: TestRequest;

    /**
     * argument page is undefined as default
     */
    api.getThemeDetail(themeId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('page')).toBe(false);

    /**
     * argument page is set
     */
    api.getThemeDetail(themeId, page).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('page')).toEqual(page);

  });

  it('should get page', () => {

    const pageId = 'p-001';
    const url = `${editorApiPath}/api/theme/${themeId}/page/${pageId}`;
    let req: TestRequest;

    /**
     * argument screen is undefined as default
     */
    api.getPage(themeId, pageId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('screen')).toBe(false);

    /**
     * argument screen is set
     */
    api.getPage(themeId, pageId, PebScreen.Desktop).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('screen')).toEqual(PebScreen.Desktop);

  });

  it('should get blog review', () => {

    const url = `${editorApiPath}/api/business/${envService.businessId}/application/${blogId}/preview`;

    api.getBlogPreview(blogId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get blog active theme', () => {

    const url = `${editorApiPath}/api/business/${envService.businessId}/application/${blogId}/themes/active`;

    api.getBlogActiveTheme(blogId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get blog theme active version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/active`;

    api.getBlogThemeActiveVersion(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get current blog preview', () => {

    const url = `${editorApiPath}/api/business/${envService.businessId}/application/${blogId}/preview`;
    const page: any = { id: 'p-001' };
    const currentDetail: any = { test: 'current.detail' };
    const diff: any = { test: 'diff' };
    let req: TestRequest;

    /**
     * arguments currentDetail & diff are null
     * argument page is null as default
     */
    api.getCurrentBlogPreview(blogId, null, null).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    ['currentDetail', 'diff', 'page'].forEach((key) => {
      expect(req.request.params.has(key)).toBe(false);
    });

    /**
     * arguments currentDetail, diff & page are set
     */
    api.getCurrentBlogPreview(blogId, currentDetail, diff, page).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('currentDetail')).toEqual(JSON.stringify(currentDetail));
    expect(req.request.params.get('diff')).toEqual(JSON.stringify(diff));
    expect(req.request.params.get('page')).toEqual(page);

  });

  it('should get page albums tree', () => {

    const url = `${editorApiPath}/api/application/${blogId}/theme/${themeId}/page-album/tree`;

    api.getPageAlbumsTree(blogId, themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  afterAll(() => {

    http.verify();

  });

});
