import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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

  beforeEach(() => {

    const envServiceMock = {
      businessId,
      shopId,
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
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

    req.flush(of({}));

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/duplicate`;

    api.duplicateTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');

    req.flush(of({}));

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}`;

    api.deleteTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of(() => { }));

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');

    req.flush(of({}));

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');

    req.flush(of({}));

  });

  it('should switch template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/switch`;

    api.switchTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');

    req.flush(of({}));

  });

  it('should create theme album', () => {

    const album = { id: 'album-001' };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album`;

    api.createThemeAlbum(album).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(album);

    req.flush(of({}));

  });

  it('should update theme album', () => {

    const album = { id: 'album-001' };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${album.id}`;

    api.updateThemeAlbum(album.id, album).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(album);

    req.flush(of({}));

  });

  it('should get theme base album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album`;

    api.getThemeBaseAlbum().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get theme album by id', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.getThemeAlbumById(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get theme album by parent', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/parent/${albumId}`;

    api.getThemeAlbumByParent(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get theme album by ancestor', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/ancestor/${albumId}`;

    api.getThemeAlbumByAncestor(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should delete theme album', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.deleteThemeAlbum(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should get theme by album', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/album`;
    let request: TestRequest;

    // w/o albumId
    api.getThemeByAlbum().subscribe();

    request = http.expectOne(req => req.url === url);

    expect(request.request.method).toEqual('GET');
    expect(request.request.params.has('albumId')).toBe(false);

    request.flush(of({}));

    // w/ albumId
    api.getThemeByAlbum(albumId).subscribe();

    request = http.expectOne(req => req.url === url);

    expect(request.request.method).toEqual('GET');
    expect(request.request.params.get('albumId')).toEqual(albumId);

    request.flush(of({}));

  });

  it('should link theme to album', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/album/${albumId}`;

    api.linkThemeToAlbum(themeId, albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should unlink theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/album`;

    api.unlinkTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of({}));

  });

  it('should create application theme', () => {

    const name = 'App Theme';
    const content = { id: 's-001' };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme`;

    api.createApplicationTheme(name, content as any).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ content, name });

    req.flush(of({}));

  });

  afterAll(() => {

    http.verify();

  });

});
