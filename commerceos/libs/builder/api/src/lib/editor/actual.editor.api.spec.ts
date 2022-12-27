import { HttpEventType } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { skipWhile } from 'rxjs/operators';

import { PebEnvService, PebScreen } from '@pe/builder-core';

import { PEB_GENERATOR_API_PATH, PEB_MEDIA_API_PATH, PEB_STORAGE_PATH } from '../constants';
import { PEB_SHOPS_API_PATH } from '../shops/actual.shops.api';

import { PEB_EDITOR_API_PATH, PebActualEditorApi } from './actual.editor.api';

describe('PebActualEditorApi', () => {

  let api: PebActualEditorApi;
  let http: HttpTestingController;

  const editorApiPath = 'editor-api';
  const shopApiPath = 'shops-api';
  const generatorApiPath = 'generator-api';
  const apiMediaPath = 'media-api';
  const mediaStoragePath = 'storage-api';
  const entityName = 'test-entity';

  const themeId = 'theme-001';
  const versionId = 'version-001';
  const pageId = 'page-001';
  const shopId = '222';
  const businessId = '000-111';
  const albumId = 'alm-001';

  beforeEach(() => {

    const envServiceMock = {
      businessId,
      shopId,
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PebActualEditorApi,
        { provide: PEB_EDITOR_API_PATH, useValue: editorApiPath },
        { provide: PEB_SHOPS_API_PATH, useValue: shopApiPath },
        { provide: PEB_GENERATOR_API_PATH, useValue: generatorApiPath },
        { provide: PEB_MEDIA_API_PATH, useValue: apiMediaPath },
        { provide: PEB_STORAGE_PATH, useValue: mediaStoragePath },
        { provide: PebEnvService, useValue: envServiceMock },
        { provide: 'PEB_ENTITY_NAME', useValue: entityName },
      ],
    });

    api = TestBed.inject(PebActualEditorApi);

    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get theme detail', () => {

    const page = 'test.page';
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
    api.getThemeDetail(themeId, page).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('page')).toEqual(page);

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

    const screen = PebScreen.Desktop;
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
    api.getPage(themeId, pageId, screen).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('screen')).toEqual(screen);

  });

  it('should get page stylesheet', () => {

    const screen = PebScreen.Tablet;
    const url = `${editorApiPath}/api/theme/${themeId}/page/${pageId}/style/${screen}`;

    api.getPageStylesheet(themeId, pageId, screen).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get page actions', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/page/${pageId}/actions`;
    let req: TestRequest;

    // w/ default limit = 20
    api.getPageActions(themeId, pageId).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('limit')).toBe(true);
    expect(req.request.params.has('offset')).toBe(true);

    // w/o limit
    api.getPageActions(themeId, pageId, null).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
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
     * argument limit is 0
     */
    api.getActions(themeId, 0).subscribe();

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

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/themes`;

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

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/themes/active`;

    api.getShopActiveTheme().subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should create theme', () => {

    const input: any = { name: 'Theme 1' };
    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme`;

    api.createTheme(input).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(input);

  });

  it('should create shop theme', () => {

    const input = { test: true };
    const url = `${editorApiPath}/api/theme`;

    api.createShopTheme(input as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(input);

  });

  it('should add action', () => {

    const action = { test: true };
    const url = `${editorApiPath}/api/theme/${shopId}/action`;

    api.addAction(shopId, action as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(action);

  });

  it('should undo action', () => {

    const actionId = 'actin-001';
    const url = `${editorApiPath}/api/theme/${themeId}/action/${actionId}`;

    api.undoAction(themeId, actionId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should update replicas', () => {

    const actions = [
      { id: '001' },
      { id: '002' },
    ];
    const url = `${editorApiPath}/api/theme/${themeId}/actions/apply`;

    api.updateReplicas(themeId, actions as any).subscribe();

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

    const name = 'test';
    const url = `${editorApiPath}/api/theme/${themeId}/version`;

    api.createShopThemeVersion(themeId, name).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ name });

  });

  it('should udpate shop theme preview', () => {

    const imagePreview = 'test';
    const url = `${editorApiPath}/api/theme/${themeId}/image-preview`;

    api.updateShopThemePreview(themeId, imagePreview).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({ imagePreview });

  });

  it('should update shop theme name', () => {

    const name = 'new test';
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

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}`;
    const body = { test: true };

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
    const page = 'name';
    const theme = 'theme';
    const logo = 'logo.jpg';
    const url = `${generatorApiPath}/api/builder-generator/business/${businessId}/generate`;

    api.generateTemplateTheme(category, page, theme, logo).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ category, page, theme, logo });

  });

  it('should update theme source page previews', () => {

    const sourceId = 'source-001';
    const previews = {
      '001': { test: true },
    };
    const url = `${editorApiPath}/api/theme/${themeId}/source/${sourceId}/previews`;

    api.updateThemeSourcePagePreviews(themeId, sourceId, previews as any).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(previews);

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should instant install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}`;

    api.deleteTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('DELETE');

  });

  it('should duplicate template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/duplicate`;

    api.duplicateTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

  });

  it('should get apps', () => {

    const url = `${shopApiPath}/business/${businessId}/${entityName}`;
    let req: TestRequest;

    // argument isDefault is undefined as default
    api.getApps().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('isDefault')).toBe(false);

    /**
     * argument isDefault is set
     */
    api.getApps(true).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.get('isDefault')).toEqual(JSON.stringify(true));

  });

  it('should get app', () => {

    const url = `${shopApiPath}/business/${businessId}/${entityName}/${shopId}`;

    api.getApp(shopId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should update app deploy', () => {

    const accessId = 'access-001';
    const payload = { test: true };
    const url = `${shopApiPath}/business/${businessId}/${entityName}/access/${accessId}`;

    api.updateAppDeploy(accessId, payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should create app', () => {

    const payload = { test: true };
    const url = `${shopApiPath}/business/${businessId}/${entityName}`;

    api.createApp(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(payload);

  });

  it('should delete app', () => {

    const url = `${shopApiPath}/business/${businessId}/${entityName}/${shopId}`;

    api.deleteApp(shopId).subscribe();

    const req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('DELETE');

  });

  it('should set as default app', () => {

    const url = `${shopApiPath}/business/${businessId}/${entityName}/${shopId}/default`;

    api.setAsDefaultApp(shopId).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

  });

  it('should update app', () => {

    const payload = { test: true };
    const url = `${shopApiPath}/business/${businessId}/${entityName}/${shopId}`;

    api.updateApp(payload).subscribe();

    const req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(payload);

  });

  it('should upload image - ERROR', () => {

    const container = 'container';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/image/business/${businessId}/${container}`;

    api.uploadImage(container, file, false).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = http.expectOne(url);
    req.flush('Upload failed', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.jpg');

  });

  it('should upload image - SUCCESS', () => {

    const container = 'container';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/image/business/${businessId}/${container}`;
    let req: TestRequest;

    /**
     * argument returnShortPath is FALSE
     */
    api.uploadImage(container, file, false).subscribe((response) => {
      expect(response.blobName).toEqual(`${mediaStoragePath}/${container}/blob`);
    });

    req = http.expectOne(url);
    req.flush({
      blobName: 'blob',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.jpg');

    /**
     * argument returnShortPath is TRUE
     */
    api.uploadImage(container, file, true).subscribe((response) => {
      expect(response.blobName).toEqual(`/${container}/blob`);
    });

    req = http.expectOne(url);
    req.flush({
      blobName: 'blob',
    });

  });

  it('should upload image with progress - ERROR', () => {

    const container = 'container';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/image/business/${businessId}/${container}`;

    api.uploadImageWithProgress(container, file, false).pipe(
      skipWhile(response => response !== null),
    ).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = http.expectOne(url);
    req.flush('Upload failed', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.jpg');

  });

  it('should upload image with progress - SUCCESS', () => {

    const container = 'container';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/image/business/${businessId}/${container}`;
    let req: TestRequest;
    let event: any;

    /**
     * event.type is HttpEventType.UploadProgress
     */
    api.uploadImageWithProgress(container, file, false).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.UploadProgress);
      expect(response.loaded).toBe(50);
    });

    req = http.expectOne(url);
    event = {
      type: HttpEventType.UploadProgress,
      loaded: 10,
      total: 20,
    };
    req.event(event);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.jpg');
    expect(req.request.reportProgress).toBe(true);

    /**
     * event.type is HttpEventType.Response
     * argument returnShortPath is FALSE
     */
    api.uploadImageWithProgress(container, file, false).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.Response);
      expect(response.body.blobName).toEqual(`${mediaStoragePath}/${container}/blob`);
    });

    req = http.expectOne(url);
    event = {
      type: HttpEventType.Response,
      body: {
        blobName: 'blob',
      },
    };
    req.event(event);

    /**
     * argument returnShortPath is TRUE
     */
    api.uploadImageWithProgress(container, file, true).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.Response);
      expect(response.body.blobName).toEqual(`/${container}/blob`);
    });

    req = http.expectOne(url);
    event = {
      type: HttpEventType.Response,
      body: {
        blobName: 'blob',
      },
    };
    req.event(event);

  });

  it('should upload video - ERROR', () => {

    const container = 'container';
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;

    api.uploadVideo(container, file).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = http.expectOne(url);
    req.flush('Upload failed', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.mp4');

  });

  it('should upload video - SUCCESS', () => {

    const container = 'container';
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;

    api.uploadVideo(container, file).subscribe((response) => {
      expect(response.blobName).toEqual(`${mediaStoragePath}/${container}/blob`);
      expect(response.preview).toEqual(`${mediaStoragePath}/${container}/preview`);
    });

    const req = http.expectOne(url);
    req.flush({
      blobName: 'blob',
      preview: 'preview',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.mp4');

  });

  it('should upload video with progress - ERROR', () => {

    const container = 'container';
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;

    api.uploadVideoWithProgress(container, file).pipe(
      skipWhile(response => response !== null),
    ).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = http.expectOne(url);
    req.flush('Upload failed', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.mp4');

  });

  it('should upload video with progress - SUCCESS', () => {

    const container = 'container';
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;
    let req: TestRequest;
    let event: any;

    /**
     * event.type is HttpEventType.UploadProgress
     */
    api.uploadVideoWithProgress(container, file).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.UploadProgress);
      expect(response.loaded).toBe(50);
    });

    req = http.expectOne(url);
    event = {
      type: HttpEventType.UploadProgress,
      loaded: 10,
      total: 20,
    };
    req.event(event);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.mp4');
    expect(req.request.reportProgress).toBe(true);

    /**
     * eveny.type is HttpEventType.Response
     */
    api.uploadVideoWithProgress(container, file).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.Response);
      expect(response.body.blobName).toEqual(`${mediaStoragePath}/${container}/blob`);
      expect(response.body.preview).toEqual(`${mediaStoragePath}/${container}/preview`);
    });

    req = http.expectOne(url);
    event = {
      type: HttpEventType.Response,
      body: {
        blobName: 'blob',
        preview: 'preview',
      },
    };
    req.event(event);

  });

  it('should get shop preview', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/preview`;

    api.getShopPreview(shopId).subscribe();

    const req = http.expectOne(req => req.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('include')).toEqual('published');
    expect(req.request.params.get('page')).toEqual('front');

  });

  it('should get current shop preview', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/preview`;
    const page = 'test.page';
    let req: TestRequest;

    /**
     * arguments currentDetail & diff are FALSE
     * argument page is null as default
     */
    api.getCurrentShopPreview(shopId, false, false).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('currentDetail')).toBe(false);
    expect(req.request.params.has('diff')).toBe(false);
    expect(req.request.params.has('page')).toBe(false);

    /**
     * arguments currentDetail & diff are set
     * argument page is set
     */
    api.getCurrentShopPreview(shopId, true, true, page).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('currentDetail')).toEqual(JSON.stringify(true));
    expect(req.request.params.get('diff')).toEqual(JSON.stringify(true));
    expect(req.request.params.get('page')).toEqual(page);

  });

  it('should get shop preview pages', () => {

    const url = `${editorApiPath}/api/application/${shopId}/source/pages/`;
    let req: TestRequest;

    // w/o page id
    api.getShopPreviewPages(shopId).subscribe();

    req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

    // w/ page id
    api.getShopPreviewPages(shopId, pageId).subscribe();

    req = http.expectOne(`${url}${pageId}`);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  it('should get theme preview pages', () => {

    const url = `${editorApiPath}/api/application/${shopId}/source/pages/`;
    let req: TestRequest;

    // w/o page id
    api.getThemePreviewPages(shopId).subscribe();

    req = http.expectOne(url);
    req.flush({});

    expect(req.request.method).toEqual('GET');

    // w/ page id
    api.getThemePreviewPages(shopId, pageId).subscribe();

    req = http.expectOne(`${url}${pageId}`);
    req.flush({});

    expect(req.request.method).toEqual('GET');

  });

  describe('PAGES', () => {

    it('should get page albums flat tree', () => {

      const url = `${editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/flattree`;

      api.getPageAlbumsFlatTree(shopId, themeId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should get page albums tree', () => {

      const url = `${editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/tree`;

      api.getPageAlbumsTree(shopId, themeId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should get page albums', () => {

      const url = `${editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album`;

      api.getPageAlbums(shopId, themeId).subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should create page album', () => {

      const albumMock = { id: 'alm-001' };
      const url = `${editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album`;

      api.createPageAlbum(shopId, themeId, albumMock).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(albumMock);

    });

    it('should delete page album', () => {

      const url = `${editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/${albumId}`;

      api.deletePageAlbum(shopId, themeId, albumId, {}).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

    it('should update page album', () => {

      const albumMock: any = { id: albumId };
      const url = `${editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/${albumId}`;

      api.updatePageAlbum(shopId, themeId, albumId, albumMock).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(albumMock);

    });

    it('should get page album by id', () => {

      const url = `${editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/${albumId}`;

      api.getPageAlbumById(shopId, themeId, albumId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should get page album by parent', () => {

      const parentId = 'p-001';
      const url = `${editorApiPath}/api/application/${shopId}/theme/${themeId}/page-album/parent/${parentId}`;

      api.getPageAlbumByParent(shopId, themeId, parentId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should get page by album', () => {

      const url = `${editorApiPath}/api/application/${shopId}/page/album/${albumId}`;

      api.getPageByAlbum(shopId, themeId, albumId).subscribe();

      const req = http.expectOne(r => r.url === url);
      req.flush({});

      expect(req.request.method).toEqual('GET');
      expect(req.request.params.get('page')).toEqual('1');
      expect(req.request.params.get('limit')).toEqual('10');

    });

    it('should link page to album', () => {

      const url = `${editorApiPath}/api/application/${shopId}/page/${pageId}/album/${albumId}`;

      api.linkPageToAlbum(shopId, themeId, pageId, albumId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({});

    });

    it('should unlink page from album', () => {

      const url = `${editorApiPath}/api/application/${shopId}/page/${pageId}/album`;

      api.unlinkPageFromAlbum(shopId, themeId, pageId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

  });

  describe('SHAPES', () => {

    it('should post shapes', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape`;
      const shapeMock = { id: 'sh-001' };

      api.postShape(shapeMock).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(shapeMock);

    });

    it('should get shapes', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape`;

      api.getShapes().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should get shapes by album', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape/album`;
      let req: TestRequest;

      /**
       * argument albumId is null
       */
      api.getShapesByAlbum(null).subscribe();

      req = http.expectOne(r => r.url === url);
      req.flush({});

      expect(req.request.method).toEqual('GET');
      expect(req.request.params.get('offset')).toEqual('0');
      expect(req.request.params.get('limit')).toEqual('100');

      /**
       * argument albumId is set
       */
      api.getShapesByAlbum(albumId, { offset: 20, limit: 10 }).subscribe();

      req = http.expectOne(r => r.url === `${url}/${albumId}`);
      req.flush({});

      expect(req.request.params.get('offset')).toEqual('20');
      expect(req.request.params.get('limit')).toEqual('10');

    });

    it('should get shape', () => {

      const shapeId = 'sh-001';
      const url = `${editorApiPath}/api/application/${shopId}/shape/${shapeId}`;

      api.getShape(shapeId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should patch shape', () => {

      const shapeMock = { id: 'sh-001' };
      const url = `${editorApiPath}/api/application/${shopId}/shape/${shapeMock.id}`;

      api.patchShape(shapeMock.id, shapeMock).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(shapeMock);

    });

    it('should delete shape', () => {

      const shapeId = 'sh-001';
      const url = `${editorApiPath}/api/application/${shopId}/shape/${shapeId}`;

      api.deleteShape(shapeId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

    it('should patch shape album', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape-album/${albumId}`;
      const albumMock = { id: albumId };

      api.patchShapeAlbum(albumId, albumMock).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(albumMock);

    });

    it('should post shape album', () => {

      const albumMock = { id: albumId };
      const url = `${editorApiPath}/api/application/${shopId}/shape-album`;

      api.postShapeAlbum(albumMock).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(albumMock);

    });

    it('should get shape albums', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape-album`;

      api.getShapeAlbums().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should delete shape album', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape-album/${albumId}`;

      api.deleteShapeAlbum(albumId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

    it('should get template shapes', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape/template`;

      api.getTemplateShapes().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should get template shape albums', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape-album/template`;

      api.getTemplateShapeAlbums().subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should get template shapes by album', () => {

      const url = `${editorApiPath}/api/application/${shopId}/shape/template/album`;
      let req: TestRequest;

      /**
       * argument albumId is null
       */
      api.getTemplateShapesByAlbum(null).subscribe();

      req = http.expectOne(r => r.url === url);
      req.flush({});

      expect(req.request.method).toEqual('GET');
      expect(req.request.params.get('offset')).toEqual('0');
      expect(req.request.params.get('limit')).toEqual('100');

      /**
       * argument albumId is set
       */
      api.getTemplateShapesByAlbum(albumId, { offset: 20, limit: 10 }).subscribe();

      req = http.expectOne(r => r.url === `${url}/${albumId}`);
      req.flush({});

      expect(req.request.params.get('offset')).toEqual('20');
      expect(req.request.params.get('limit')).toEqual('10');

    });

  });

  afterAll(() => {

    http.verify();

  });

});
