import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EnvService } from '@pe/common';

import { PEB_SITE_API_BUILDER_PATH } from '../../constants';

import { ActualPebSitesThemesApi } from './actual.sites-themes.api';

describe('ActualPebSitesThemesApi', () => {

  let api: ActualPebSitesThemesApi;
  let http: HttpTestingController;

  const editorApiPath = '/editor/api';
  const businessId = 'b-001';
  const shopId = 'shop-001';
  const themeId = 'theme-001';
  const albumId = 'album-001';

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
        ActualPebSitesThemesApi,
        { provide: EnvService, useValue: envServiceMock },
        { provide: PEB_SITE_API_BUILDER_PATH, useValue: editorApiPath },
      ],
    });

    api = TestBed.inject(ActualPebSitesThemesApi);
    http = TestBed.inject(HttpTestingController);

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

    req.flush(of({}))

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
    expect(req.request.body).toEqual({});

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
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should switch template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/switch`;

    api.switchTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should create theme album', () => {

    const album = { id: albumId };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album`

    api.createThemeAlbum(album).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(album);

    req.flush(of({}));

  });

  it('should update theme album', () => {

    const album = { id: albumId, name: 'Album' };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.updateThemeAlbum(albumId, album).subscribe();

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

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.getThemeAlbumById(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get theme album by parent', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/parent/${albumId}`;

    api.getThemeAlbumByParrent(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get theme album by ancestor', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/ancestor/${albumId}`;

    api.getThemeAlbumByAncestor(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should delete theme album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.deleteThemeAlbum(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of({}));

  });

  it('should get theme by album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/album`;
    let req: TestRequest;

    // w/o albumId
    api.getThemeByAlbum().subscribe();

    req = http.expectOne(r => r.url === url);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('albumId')).toBe(false);

    req.flush(of({}));

    // w/ albumId
    api.getThemeByAlbum(albumId).subscribe();

    req = http.expectOne(r => r.url === url);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('albumId')).toEqual(albumId);

    req.flush(of({}));

  });

  it('should link theme to album', () => {

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

    const name = 'New theme';
    const content = { id: shopId };
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
