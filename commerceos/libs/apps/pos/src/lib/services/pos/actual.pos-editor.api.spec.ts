import { HttpEventType } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { skip } from 'rxjs/operators';

import { PEB_EDITOR_API_PATH, PEB_GENERATOR_API_PATH, PEB_MEDIA_API_PATH, PEB_STORAGE_PATH } from '@pe/builder-api';
import { EnvService } from '@pe/common';

import { PEB_POS_API_PATH } from '../../constants/constants';

import { PebActualEditorApi } from './actual.pos-editor.api';

describe('PebActualEditorApi', () => {

  let api: PebActualEditorApi;
  let http: HttpTestingController;

  const businessId = 'b-001';
  const posId = 'pos-001';
  const themeId = 't-001';
  const pageId = 'p-001';
  const versionId = 'v-001';
  const applicationId = 'app-001';
  const shapeId = 's-001';
  const albumId = 'album-001';
  const editorApiPath = 'api/editor';
  const posApiPath = 'api/pos';
  const apiGeneratorPath = 'api/generator';
  const apiMediaPath = 'api/media';
  const mediaStoragePath = 'storage/media';

  beforeEach(() => {

    const envServiceMock = { businessId, posId };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebActualEditorApi,
        { provide: PEB_EDITOR_API_PATH, useValue: editorApiPath },
        { provide: PEB_POS_API_PATH, useValue: posApiPath },
        { provide: PEB_GENERATOR_API_PATH, useValue: apiGeneratorPath },
        { provide: PEB_MEDIA_API_PATH, useValue: apiMediaPath },
        { provide: PEB_STORAGE_PATH, useValue: mediaStoragePath },
        { provide: EnvService, useValue: envServiceMock },
      ],
    });

    api = TestBed.inject(PebActualEditorApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get current shop preview', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/preview`;
    let req: TestRequest;

    /**
     * argument currentDetail is FALSE
     * argument diff is FALSE
     */
    api.getCurrentShopPreview(applicationId, false, false).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('currentDetail')).toBe(false);
    expect(req.request.params.has('diff')).toBe(false);

    /**
     * argument currentDetail is TRUE
     * argument diff is TRUE
     */
    api.getCurrentShopPreview(applicationId, true, true).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('currentDetail')).toEqual('true');
    expect(req.request.params.get('diff')).toEqual('true');

  });

  it('should get theme detail', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/detail`;
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
    api.getThemeDetail(themeId, 'test').subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('page')).toEqual('test');

  });

  it('should get snapshot by version id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}/snapshot`;

    api.getSnapshotByVersionId(themeId, versionId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get pages', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/pages`;

    api.getPages(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get page', () => {

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
    api.getPage(themeId, pageId, 'mobile').subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('screen')).toEqual('mobile');

  });

  it('should get page stylesheet', () => {

    const screen = 'tablet';
    const url = `${editorApiPath}/api/theme/${themeId}/page/${pageId}/style/${screen}`;

    api.getPageStylesheet(themeId, pageId, screen).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get page actions', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/page/${pageId}/actions`;
    let req: TestRequest;

    /**
     * argument limit is 20 as default
     */
    api.getPageActions(themeId, pageId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('limit')).toEqual('20');
    expect(req.request.params.get('offset')).toEqual('0');

    /**
     * argument limit is null
     */
    api.getPageActions(themeId, pageId, null).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.has('limit')).toBe(false);
    expect(req.request.params.has('offset')).toBe(false);

  });

  it('should get actions', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/actions`;
    let req: TestRequest;

    /**
     * argument limit is 20 as default
     */
    api.getActions(themeId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('limit')).toEqual('20');
    expect(req.request.params.get('offset')).toEqual('0');

    /**
     * argument limit is null
     */
    api.getActions(themeId, null).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.has('limit')).toBe(false);
    expect(req.request.params.has('offset')).toBe(false);

  });

  it('should get all available themes', () => {

    const url = `${editorApiPath}/api/themes`;

    api.getAllAvailableThemes().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get shop themes list', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/themes`;

    api.getShopThemesList().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get shop theme by id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}`;

    api.getShopThemeById(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get shop active theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/themes/active`;

    api.getShopActiveTheme().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should create shop theme', () => {

    const input = { test: 'input' };
    const url = `${editorApiPath}/api/theme`;

    api.createShopTheme(input).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(input);

  });

  it('should add action', () => {

    const action: any = { id: 'a-001' };
    const url = `${editorApiPath}/api/theme/${applicationId}/action`;

    api.addAction(applicationId, action).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(action);

  });

  it('should undo action', () => {

    const actionId = 'a-001';
    const url = `${editorApiPath}/api/theme/${themeId}/action/${actionId}`;

    api.undoAction(themeId, actionId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should update replicas', () => {

    const actions: any = [{ id: 'a-001' }];
    const url = `${editorApiPath}/api/theme/${themeId}/actions/apply`;

    api.updateReplicas(themeId, actions).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(actions);

  });

  it('should get shop theme versions', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/versions`;

    api.getShopThemeVersions(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should get shop theme version by id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}`;

    api.getShopThemeVersionById(themeId, versionId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get shop theme active version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/active`;

    api.getShopThemeActiveVersion(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should create shop theme version', () => {

    const name = 'Test';
    const url = `${editorApiPath}/api/theme/${themeId}/version`;

    api.createShopThemeVersion(themeId, name).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ name });

  });

  it('should update shop theme preview', () => {

    const imagePreview = 'preview.jpg';
    const url = `${editorApiPath}/api/theme/${themeId}/image-preview`;

    api.updateShopThemePreview(themeId, imagePreview).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({ imagePreview });

  });

  it('should update shop theme name', () => {

    const name = 'Test';
    const url = `${editorApiPath}/api/theme/${themeId}/name`;

    api.updateShopThemeName(themeId, name).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ name });

  });

  it('should delete shop theme version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}`;

    api.deleteShopThemeVersion(themeId, versionId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should activate shop theme version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}/restore`;

    api.activateShopThemeVersion(themeId, versionId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toBeNull();

  });

  it('should publish shop theme version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}/publish`;

    api.publishShopThemeVersion(themeId, versionId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should update theme version', () => {

    const body = { test: true };
    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}`;

    api.updateThemeVersion(themeId, versionId, body).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(body);

  });

  it('should get template themes', () => {

    const url = `${editorApiPath}/api/templates`;

    api.getTemplateThemes().subscribe();

    const req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');

  });

  it('should generate template theme', () => {

    const category = 'category';
    const page = 'page';
    const theme = 'theme';
    const logo = 'logo';
    const url = `${apiGeneratorPath}/api/builder-generator/business/${businessId}/generate`;

    api.generateTemplateTheme(category, page, theme, logo).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      category,
      page,
      theme,
      logo,
    });

  });

  it('should update theme source page previews', () => {

    const sourceId = 's-001';
    const previews = [{ test: true }];
    const url = `${editorApiPath}/api/theme/${themeId}/source/${sourceId}/previews`;

    api.updateThemeSourcePagePreviews(themeId, sourceId, previews).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(previews);

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}`;

    api.deleteTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${posId}/theme/${themeId}/duplicate`;

    api.duplicateTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should get shops', () => {

    const url = `${posApiPath}/business/${businessId}/terminal`;
    let req: TestRequest;

    /**
     * argument isDefault is undefined as default
     */
    api.getShops().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('isDefault')).toBe(false);

    /**
     * argument isDefault is TRUE
     */
    api.getShops(true).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.get('isDefault')).toEqual('true');

  });

  it('should get shop', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/${posId}`;

    api.getShop().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should update shop deploy', () => {

    const accessId = 'access-001';
    const payload = { test: true };
    const url = `${posApiPath}/business/${businessId}/terminal/access/${accessId}`;

    api.updateShopDeploy(accessId, payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should create shop', () => {

    const payload = { test: true };
    const url = `${posApiPath}/business/${businessId}/terminal`;

    api.createShop(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(payload);

  });

  it('should delete shop', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/${applicationId}`;

    api.deleteShop(applicationId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should set as default shop', () => {

    const url = `${posApiPath}/business/${businessId}/terminal/${applicationId}/default`;

    api.setAsDefaultShop(applicationId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should update shop', () => {

    const payload = { test: true };
    const url = `${posApiPath}/business/${businessId}/terminal/${posId}`;

    api.updateShop(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should upload image', () => {

    const container = 'images';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/image/business/${businessId}/${container}`;
    let req: TestRequest;

    /**
     * request throws error
     */
    api.uploadImage(container, file, false).subscribe(result => expect(result).toBeNull());

    req = http.expectOne(url);
    req.flush('Test Error', {
      status: 900,
      statusText: 'Test Error',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);

    /**
     * request returns mocked data
     * argument returnShortPath is FALSE
     */
    api.uploadImage(container, file, false).subscribe(result => expect(result).toEqual({
      blobName: `${mediaStoragePath}/${container}/${file.name}`,
    }));

    req = http.expectOne(url);
    req.flush({ blobName: file.name });

    /**
     * argument returnShortPath is TRUE
     */
    api.uploadImage(container, file, true).subscribe(result => expect(result).toEqual({
      blobName: `/${container}/${file.name}`,
    }));

    req = http.expectOne(url);
    req.flush({ blobName: file.name });

  });

  it('should upload image with progress', () => {

    const container = 'images';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/image/business/${businessId}/${container}`;
    let req: TestRequest;

    /**
     * request throws error
     */
    api.uploadImageWithProgress(container, file, false).pipe(skip(1)).subscribe(result => expect(result).toBeNull());
    // we skip 1, bcoz the first result is event, not the result

    req = http.expectOne(url);
    req.flush('Test Error', {
      status: 900,
      statusText: 'Test Error',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);

    /**
     * request returns mocked event
     * event.type is HttpEventType.UploadProgress
     */
    api.uploadImageWithProgress(container, file, false).pipe(skip(1)).subscribe((result: any) => {
      expect(result.loaded).toBe(10);
    });

    req = http.expectOne(url);
    req.event({
      type: HttpEventType.UploadProgress,
      loaded: 13,
      total: 130,
    });

    /**
     * event.type is HttpEventType.Response
     * argument returnShortPath is FALSE
     */
    api.uploadImageWithProgress(container, file, false).pipe(skip(1)).subscribe((result: any) => {
      expect(result.body.blobName).toEqual(`${mediaStoragePath}/${container}/${file.name}`);
    });

    req = http.expectOne(url);
    req.event({
      type: HttpEventType.Response,
      body: {
        blobName: file.name,
      },
    } as any);

    /**
     * argument returnShortPath is TRUE
     */
    api.uploadImageWithProgress(container, file, true).pipe(skip(1)).subscribe((result: any) => {
      expect(result.body.blobName).toEqual(`/${container}/${file.name}`);
    });

    req = http.expectOne(url);
    req.event({
      type: HttpEventType.Response,
      body: {
        blobName: file.name,
      },
    } as any);

  });

  it('should upload video', () => {

    const container = 'videos';
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;
    let req: TestRequest;

    /**
     * request throws error
     */
    api.uploadVideo(container, file).subscribe(result => expect(result).toBeNull());

    req = http.expectOne(url);
    req.flush('Test Error', {
      status: 900,
      statusText: 'Test Error',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);

    /**
     * request returns mocked data
     */
    api.uploadVideo(container, file).subscribe(result => expect(result).toEqual({
      blobName: `${mediaStoragePath}/${container}/${file.name}`,
      preview: `${mediaStoragePath}/${container}/preview.${file.name}`,
    }));

    req = http.expectOne(url);
    req.flush({
      blobName: file.name,
      preview: `preview.${file.name}`,
    });

  });

  it('should upload video with progress', () => {

    const container = 'videos';
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;
    let req: TestRequest;

    /**
     * request throws error
     */
    api.uploadVideoWithProgress(container, file).pipe(skip(1)).subscribe(result => expect(result).toBeNull());
    // we skip 1, bcoz the first result is event, not the result

    req = http.expectOne(url);
    req.flush('Test Error', {
      status: 900,
      statusText: 'Test Error',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);

    /**
     * request returns mocked event
     * event.type is HttpEventType.UploadProgress
     */
    api.uploadVideoWithProgress(container, file).pipe(skip(1)).subscribe((result: any) => {
      expect(result.loaded).toBe(10);
    });

    req = http.expectOne(url);
    req.event({
      type: HttpEventType.UploadProgress,
      loaded: 13,
      total: 130,
    });

    /**
     * event.type is HttpEventType.Response
     */
    api.uploadVideoWithProgress(container, file).pipe(skip(1)).subscribe((result: any) => {
      expect(result.body).toEqual({
        blobName: `${mediaStoragePath}/${container}/${file.name}`,
        preview: `${mediaStoragePath}/${container}/preview.${file.name}`,
      });
    });

    req = http.expectOne(url);
    req.event({
      type: HttpEventType.Response,
      body: {
        blobName: file.name,
        preview: `preview.${file.name}`,
      },
    } as any);

  });

  it('should get shop preview', () => {

    const include = 'test';
    const url = `${editorApiPath}/api/business/${businessId}/application/${applicationId}/preview`;

    api.getShopPreview(applicationId, include).subscribe();

    const req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('include')).toEqual('test');
    expect(req.request.params.get('page')).toEqual('front');

  });

  it('should get shop preview pages', () => {

    const url = `${editorApiPath}/api/application/${applicationId}/source/pages/`;
    let req: TestRequest;

    /**
     * argument pageId is undefined as default
     */
    api.getShopPreviewPages(applicationId).subscribe();

    req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

    /**
     * argument pageId is set
     */
    api.getShopPreviewPages(applicationId, pageId).subscribe();

    req = http.expectOne(`${url}${pageId}`);
    req.flush({});

  });

  describe('Shaped', () => {

    it('should post shape', () => {

      const shape = { test: 'shape' };
      const url = `${editorApiPath}/api/application/${posId}/shape`;

      api.postShape(shape).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(shape);

    });

    it('should get shapes', () => {

      const url = `${editorApiPath}/api/application/${posId}/shape`;

      api.getShapes().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should get shapes by album', () => {

      const albumId = 'album-001';
      const url = `${editorApiPath}/api/application/${posId}/shape/album`;
      let req: TestRequest;

      /**
       * argument albumId is null
       */
      api.getShapesByAlbum(null).subscribe();

      req = http.expectOne(r => r.url === url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');
      expect(req.request.params.get('offset')).toEqual('0');
      expect(req.request.params.get('limit')).toEqual('100');

      /**
       * argument albumId is set
       */
      api.getShapesByAlbum(albumId).subscribe();

      req = http.expectOne(r => r.url === `${url}/${albumId}`);
      req.flush([]);

    });

    it('should get shape', () => {

      const url = `${editorApiPath}/api/application/${posId}/shape/${shapeId}`;

      api.getShape(shapeId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should patch shape', () => {

      const shape = { id: shapeId };
      const url = `${editorApiPath}/api/application/${posId}/shape/${shapeId}`;

      api.patchShape(shapeId, shape).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(shape);

    });

    it('should delete shape', () => {

      const url = `${editorApiPath}/api/application/${posId}/shape/${shapeId}`;

      api.deleteShape(shapeId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

    it('should patch shape album', () => {

      const album = { id: albumId };
      const url = `${editorApiPath}/api/application/${posId}/shape-album/${albumId}`;

      api.patchShapeAlbum(albumId, album).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(album);

    });

    it('should post shape album', () => {

      const album = { id: albumId };
      const url = `${editorApiPath}/api/application/${posId}/shape-album`;

      api.postShapeAlbum(album).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(album);

    });

    it('should get shape albums', () => {

      const url = `${editorApiPath}/api/application/${posId}/shape-album`;

      api.getShapeAlbums().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should delete shape album', () => {

      const url = `${editorApiPath}/api/application/${posId}/shape-album/${albumId}`;

      api.deleteShapeAlbum(albumId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

    it('should get template shapes', () => {

      const url = `${editorApiPath}/api/application/${posId}/shape/template`;

      api.getTemplateShapes().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should get template shape albums', () => {

      const url = `${editorApiPath}/api/application/${posId}/shape-album/template`;

      api.getTemplateShapeAlbums().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should get template shapes by album', () => {

      const url = `${editorApiPath}/api/application/${posId}/shape/template/album`;
      let req: TestRequest;

      /**
       * argument albumId is null
       */
      api.getTemplateShapesByAlbum(null).subscribe();

      req = http.expectOne(r => r.url === url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');
      expect(req.request.params.get('offset')).toEqual('0');
      expect(req.request.params.get('limit')).toEqual('100');

      /**
       * argument albumId is set
       */
      api.getTemplateShapesByAlbum(albumId).subscribe();

      req = http.expectOne(r => r.url === `${url}/${albumId}`);
      req.flush([]);

    });

  });

  afterAll(() => {

    http.verify();

  });

});
