import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import * as pebCore from '@pe/builder-core';
import { PebEnvService } from '@pe/builder-core';

import { PEB_EDITOR_API_PATH } from '../editor/actual.editor.api';

import { PebActualShopThemesApi } from './actual.shop-themes.api';

describe('PebActualShopThemesApi', () => {

  let api: PebActualShopThemesApi;
  let http: HttpTestingController;
  let editorApiPath: string;
  let envService: jasmine.SpyObj<PebEnvService>;

  const businessId = '000-111';
  const shopId = '222';
  const themeId = 'theme-001';
  const albumId = 'album-001';

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebCreateEmptyShop', {
      value: pebCore.pebCreateEmptyPage,
      writable: true,
    });

  });

  beforeEach(() => {

    const envServiceMock = {
      businessId,
      shopId,
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebActualShopThemesApi,
        { provide: PEB_EDITOR_API_PATH, useValue: 'editor' },
        { provide: PebEnvService, useValue: envServiceMock },
      ],
    });

    api = TestBed.inject(PebActualShopThemesApi);

    http = TestBed.inject(HttpTestingController);
    editorApiPath = TestBed.inject(PEB_EDITOR_API_PATH);
    envService = TestBed.inject(PebEnvService) as jasmine.SpyObj<PebEnvService>;

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get themes list', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/themes`;

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

    api.getTemplateThemes().subscribe();

    const req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

  });

  it('should get template item themes', () => {

    const ids = ['t-001', 't-002'];
    const url = `${editorApiPath}/api/template/themes`;

    api.getTemplateItemThemes(ids).subscribe();

    const req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids });
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

  });

  it('should get themes by template id', () => {

    const ids = ['t-001', 't-002'];
    const url = `${editorApiPath}/api/template/items`;

    api.getThemesByTemplateId(ids).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids });

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/duplicate`;
    let req: TestRequest;

    /**
     * argument albumId is undefined as default
     */
    api.duplicateTemplateTheme(themeId).subscribe();

    req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

    /**
     * argument albumId is set
     */
    api.duplicateTemplateTheme(themeId, albumId).subscribe();

    req = http.expectOne(url);
    req.flush({});

    expect(req.request.body).toEqual({ albumId });

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}`;

    api.deleteTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');

  });

  it('should switch template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/switch`;

    api.switchTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');

  });

  it('should create theme album', () => {

    const album = { id: albumId };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album`;

    api.createThemeAlbum(album).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(album);

  });

  it('should update theme album', () => {

    const album = { id: albumId };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${album.id}`;

    api.updateThemeAlbum(album.id, album).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(album);

  });

  it('should get theme base album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album`;

    api.getThemeBaseAlbum().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by id', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.getThemeAlbumById(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by parent', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/parent/${albumId}`;

    api.getThemeAlbumByParent(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by ancestor', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/ancestor/${albumId}`;

    api.getThemeAlbumByAncestor(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should delete theme album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.deleteThemeAlbum(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should get theme by album', () => {

    const pagination = {
      offset: 20,
      limit: 10,
    };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/album`;
    let req: TestRequest;

    /**
     * argument albumId is udnefined as default
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
     * arguments albumId & pagination are set
     */
    api.getThemeByAlbum(albumId, pagination).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('albumId')).toEqual(albumId);
    expect(req.request.params.get('offset')).toEqual('20');
    expect(req.request.params.get('limit')).toEqual('10');

  });

  it('should link theme to album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/album/${albumId}`;

    api.linkThemeToAlbum(themeId, albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should unlink theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/album`;

    api.unlinkTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should create application theme', () => {

    const name = 'App Theme';
    const content: any = { id: 's-001' };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme`;
    const createSpy = spyOn(pebCore, 'pebCreateEmptyShop').and.returnValue(content);

    api.createApplicationTheme(name).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ content, name });
    expect(createSpy).toHaveBeenCalled();

  });

  it('should duplicate theme album', () => {

    const payload = {
      albumIds: [albumId],
      parent: 'test.parent',
    };
    const url = `${editorApiPath}/api/business/${envService.businessId}/application/${envService.shopId}/theme-album/duplicate`;

    api.duplicateThemeAlbum(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(payload);

  });

  afterAll(() => {

    http.verify();

  });

});
