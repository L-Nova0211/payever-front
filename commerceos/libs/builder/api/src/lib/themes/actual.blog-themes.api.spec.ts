import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import * as pebCore from '@pe/builder-core';
import { EnvService } from '@pe/common';
import { PEB_EDITOR_API_PATH } from '../editor/actual.editor.api';
import { PebActualBlogThemesApi } from './actual.blog-themes.api';

describe('PebActualBlogThemesApi', () => {

  let api: PebActualBlogThemesApi;
  let http: HttpTestingController;

  const editorApiPath = 'api/editor';
  const businessId = 'b-001';
  const applicationId = 'app-001';
  const themeId = 't-001';
  const album = { id: 'album-001' };
  const albumId = album.id;

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebCreateEmptyShop', {
      value: pebCore.pebCreateEmptyShop,
      writable: true,
    });

  });

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebActualBlogThemesApi,
        { provide: PEB_EDITOR_API_PATH, useValue: editorApiPath },
        { provide: EnvService, useValue: { businessId, applicationId } },
      ],
    });

    api = TestBed.inject(PebActualBlogThemesApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get themes list', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/themes`;

    api.getThemesList().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme by id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}`;

    api.getThemeById(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get template themes', () => {

    const url = `${editorApiPath}/api/templates`;
    const pagination = { offset: 30, limit: 10 };
    let req: TestRequest;

    /**
     * argument pagination is {} as default
     */
    api.getTemplateThemes().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

    /**
     * argument pagination is set
     */
    api.getTemplateThemes(pagination).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.get('offset')).toEqual(pagination.offset.toString());
    expect(req.request.params.get('limit')).toEqual(pagination.limit.toString());

  });

  it('should get template item themes', () => {

    const url = `${editorApiPath}/api/template/themes`;
    const ids = ['test'];
    const pagination = { offset: 30, limit: 10 };
    let req: TestRequest;

    /**
     * argument pagination is {} as default
     */
    api.getTemplateItemThemes(ids).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids });
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

    /**
     * argument pagination is set
     */
    api.getTemplateItemThemes(ids, pagination).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.get('offset')).toEqual(pagination.offset.toString());
    expect(req.request.params.get('limit')).toEqual(pagination.limit.toString());

  });

  it('should get themes by template id', () => {

    const url = `${editorApiPath}/api/template/items`;
    const ids = ['test'];

    api.getThemesByTemplateId(ids).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids });

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme/${themeId}/duplicate`;

    api.duplicateTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should duplicate theme album - actually does NOTHING', () => {

    api.duplicateThemeAlbum(null).subscribe();

    expect().nothing();

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme/${themeId}`;

    api.deleteTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should switch template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme/${themeId}/switch`;

    api.switchTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should create theme album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme-album`;

    api.createThemeAlbum(album).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(album);

  });

  it('should update theme album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme-album/${albumId}`;

    api.updateThemeAlbum(albumId, album).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(album);

  });

  it('should get theme base album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme-album`;

    api.getThemeBaseAlbum().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by id', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme-album/${albumId}`;

    api.getThemeAlbumById(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by parent', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme-album/parent/${albumId}`;

    api.getThemeAlbumByParent(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by ancestor', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme-album/ancestor/${albumId}`;

    api.getThemeAlbumByAncestor(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should delete theme album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme-album/${albumId}`;

    api.deleteThemeAlbum(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should get theme by album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme/album`;
    const pagination = { offset: 30, limit: 10 };
    let req: TestRequest;

    /**
     * argument albumId is undefined as default
     * argument pagination is {} as default
     */
    api.getThemeByAlbum().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('albumId')).toBe(false);
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

    /**
     * arguments albumId & padination are set
     */
    api.getThemeByAlbum(albumId, pagination).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.get('albumId')).toEqual(albumId);
    expect(req.request.params.get('offset')).toEqual(pagination.offset.toString());
    expect(req.request.params.get('limit')).toEqual(pagination.limit.toString());

  });

  it('should link theme to album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme/${themeId}/album/${albumId}`;

    api.linkThemeToAlbum(themeId, albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should unlink theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme/${themeId}/album`;

    api.unlinkTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should create application theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/theme`;
    const name = 'Shop 1';
    const emptyShop: any = { id: 'shop-001' };
    const createEmptySpy = spyOn(pebCore, 'pebCreateEmptyShop').and.returnValue(emptyShop);

    api.createApplicationTheme(name).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      name,
      content: emptyShop,
    });

  });

  afterAll(() => {

    http.verify();

  });

});
