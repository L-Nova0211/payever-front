import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { isEmpty } from 'rxjs/operators';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { EnvService } from '@pe/common';

import { PebActualPosThemesApi } from './actual.pos-themes.api';

describe('PebActualPosThemesApi', () => {

  let api: PebActualPosThemesApi;
  let http: HttpTestingController;

  const businessId = 'b-001';
  const posId = 'pos-001';
  const themeId = 't-001';
  const albumId = 'album-001';
  const editorApiPath = 'api/editor';

  beforeEach(() => {

    const envServiceMock = { businessId, posId };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebActualPosThemesApi,
        { provide: PEB_EDITOR_API_PATH, useValue: editorApiPath },
        { provide: EnvService, useValue: envServiceMock },
      ],
    });

    api = TestBed.inject(PebActualPosThemesApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get themes list', () => {

    const url = `${editorApiPath}/api/business/${businessId}/terminal/${posId}/themes`;

    api.getThemesList().subscribe();

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

    const req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

  });

  it('should get template item themes', () => {

    const ids = ['i-001', 'i-002'];
    const url = `${editorApiPath}/api/template/themes`;

    api.getTemplateItemThemes(ids).subscribe();

    const req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids });
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

  });

  it('should get theme by template id', () => {

    const itemId = 'i-001';
    const url = `${editorApiPath}/api/template/items`;

    api.getThemesByTemplateId([itemId]).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids: [itemId] });

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/duplicate`;

    api.duplicateTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should return empty observable on duplicate theme album', () => {

    api.duplicateThemeAlbum(null).pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}`;

    api.deleteTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should switch template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/switch`;

    api.switchTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should create theme album', () => {

    const album = { id: albumId };
    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme-album`;

    api.createThemeAlbum(album).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(album);

  });

  it('should update theme album', () => {

    const album = { id: albumId };
    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/${albumId}`;

    api.updateThemeAlbum(albumId, album).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(album);

  });

  it('should get theme base album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme-album`;

    api.getThemeBaseAlbum().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by id', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/${albumId}`;

    api.getThemeAlbumById(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by parent', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/parent/${albumId}`;

    api.getThemeAlbumByParent(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by ancestors', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/ancestor/${albumId}`;

    api.getThemeAlbumByAncestor(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should delete theme album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme-album/${albumId}`;

    api.deleteThemeAlbum(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should get theme by album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/album`;
    let req: TestRequest;

    /**
     * argument albumId is undefined as default
     */
    api.getThemeByAlbum().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');
    expect(req.request.params.has('albumId')).toBe(false);

    /**
     * argument albumId us set
     */
    api.getThemeByAlbum(albumId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('albumId')).toEqual(albumId);

  });

  it('should link theme to album', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/album/${albumId}`;

    api.linkThemeToAlbum(themeId, albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should unlink theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/album`;

    api.unlinkTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  afterAll(() => {

    http.verify();

  });

});
