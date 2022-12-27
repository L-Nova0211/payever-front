import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import * as pebCore from '@pe/builder-core';
import { PebEnvService } from '@pe/builder-core';

import { PEB_BUILDER_POS_API_PATH } from '../pos/actual.pos.api';

import { PebActualTerminalThemesApi } from './actual.terminal-themes.api';

describe('PebActualTerminalThemesApi', () => {

  let api: PebActualTerminalThemesApi;
  let http: HttpTestingController;
  let editorApiPath: string;
  let envService: jasmine.SpyObj<PebEnvService>;

  const businessId = '000-111';
  const terminalId = '999';
  const shopId = '222';
  const themeId = 'theme-001';

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebCreateEmptyShop', {
      value: pebCore.pebCreateEmptyPage,
      writable: true,
    });

  });

  beforeEach(() => {

    const envServiceMock = {
      businessId,
      terminalId,
      shopId,
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebActualTerminalThemesApi,
        { provide: PEB_BUILDER_POS_API_PATH, useValue: 'builder-pos' },
        { provide: PebEnvService, useValue: envServiceMock },
      ],
    });

    api = TestBed.inject(PebActualTerminalThemesApi);

    http = TestBed.inject(HttpTestingController);
    editorApiPath = TestBed.inject(PEB_BUILDER_POS_API_PATH);
    envService = TestBed.inject(PebEnvService) as jasmine.SpyObj<PebEnvService>;

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get terminal id', () => {

    expect(api[`terminalId`]).toEqual(envService.terminalId);

  });

  it('should get business id', () => {

    expect(api[`businessId`]).toEqual(envService.businessId);

  });

  it('should get themes list', () => {

    const url = `${editorApiPath}/business/${businessId}/terminal/${terminalId}/themes`;

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

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get themes by template id', () => {

    const ids = ['i-001'];
    const url = `${editorApiPath}/api/template/items`;

    api.getThemesByTemplateId(ids).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids });

  });

  it('should get template item themes', () => {

    const ids = ['i-001'];
    const url = `${editorApiPath}/api/template/themes`;

    api.getTemplateItemThemes(ids).subscribe();

    const req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ids });
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/business/${businessId}/terminal/${terminalId}/theme/${themeId}/duplicate`;

    api.duplicateTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/business/${businessId}/terminal/${terminalId}/theme/${themeId}`;

    api.deleteTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/business/${businessId}/terminal/${terminalId}/theme/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/business/${businessId}/terminal/${terminalId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');

  });

  it('should switch template theme', () => {

    const url = `${editorApiPath}/business/${businessId}/terminal/${terminalId}/theme/${themeId}/switch`;

    api.switchTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');

  });

  it('should create theme album', () => {

    const album = { id: 'album-001' };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album`;

    api.createThemeAlbum(album).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(album);

  });

  it('should update theme album', () => {

    const album = { id: 'album-001' };
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

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.getThemeAlbumById(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by parent', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/parent/${albumId}`;

    api.getThemeAlbumByParent(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme album by ancestor', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/ancestor/${albumId}`;

    api.getThemeAlbumByAncestor(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should delete theme album', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/${albumId}`;

    api.deleteThemeAlbum(albumId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should get theme by album', () => {

    const albumId = 'album-001';
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/album`;
    let req: TestRequest;

    // w/o albumId
    api.getThemeByAlbum().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('albumId')).toBe(false);

    // w/ albumId
    api.getThemeByAlbum(albumId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('albumId')).toEqual(albumId);

  });

  it('should link theme to album', () => {

    const albumId = 'album-001';
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
      albumIds: ['alm-001'],
    };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme-album/duplicate`;

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
