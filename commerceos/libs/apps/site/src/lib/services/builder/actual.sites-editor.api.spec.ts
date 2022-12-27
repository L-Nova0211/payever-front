import { HttpEventType } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

import { PEB_GENERATOR_API_PATH, PEB_MEDIA_API_PATH, PEB_STORAGE_PATH } from '@pe/builder-api';
import { EnvService } from '@pe/common';

import { PEB_SITE_API_BUILDER_PATH } from '../../constants';

import { ActualPebSitesEditorApi } from './actual.sites-editor.api';

describe('ActualPebSitesEditorApi', () => {

  let api: ActualPebSitesEditorApi;
  let http: HttpTestingController;

  const editorApiPath = '/editor/api';
  const apiMediaPath = '/media/api';
  const mediaStoragePath = '/storage/media';
  const apiGeneratorPath = '/generator/api';
  const businessId = 'b-001';
  const shopId = 'shop-001';
  const themeId = 'theme-001';
  const versionId = 'v-001';

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
        ActualPebSitesEditorApi,
        { provide: EnvService, useValue: envServiceMock },
        { provide: PEB_SITE_API_BUILDER_PATH, useValue: editorApiPath },
        { provide: PEB_MEDIA_API_PATH, useValue: apiMediaPath },
        { provide: PEB_STORAGE_PATH, useValue: mediaStoragePath },
        { provide: PEB_GENERATOR_API_PATH, useValue: apiGeneratorPath },
      ],
    });

    api = TestBed.inject(ActualPebSitesEditorApi);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should activate shop theme version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}/restore`;

    api.activateShopThemeVersion(themeId, versionId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toBeNull();

    req.flush(of({}));

  });

  it('should add action', () => {

    const action = { id: 'a-001' };
    const url = `${editorApiPath}/api/theme/${shopId}/action`;

    api.addAction(shopId, action as any).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(action);

    req.flush(of({}));

  });

  it('should return undefined on create shop', () => {

    expect(api.createShop(null)).toBeUndefined();

  });

  it('should create shop theme', () => {

    const input = {
      content: { id: shopId },
    };
    const url = `${editorApiPath}/api/theme`;

    api.createShopTheme(input as any).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(input);

    req.flush(of({}));

  });

  it('should create shop theme version', () => {

    const name = 'version';
    const url = `${editorApiPath}/api/theme/${themeId}/version`;

    api.createShopThemeVersion(themeId, name).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ name });

    req.flush(of({}));

  });

  it('should return undefined on delete shop', () => {

    expect(api.deleteShop(shopId)).toBeUndefined();

  });

  it('should delete shop theme version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}`;

    api.deleteShopThemeVersion(themeId, versionId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of({}));

  });

  it('should delete template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}`;

    api.deleteTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

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

  it('should generate template theme', () => {

    const category = 'category';
    const page = 'page';
    const theme = 'theme';
    const logo = 'logo';
    const url = `${apiGeneratorPath}/api/builder-generator/business/${businessId}/generate`;

    api.generateTemplateTheme(category, page, theme, logo).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ category, page, theme, logo });

    req.flush(of({}));

  });

  it('should get actions', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/actions`;
    let req: TestRequest;

    // w/o limit & offset
    api.getActions(themeId).subscribe();

    req = http.expectOne(r => r.url === url);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('limit')).toBe(false);
    expect(req.request.params.has('offset')).toBe(false);

    req.flush(of([]));

    // w/ limit & offset
    api.getActions(themeId, 20, 10).subscribe();

    req = http.expectOne(r => r.url === url);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('limit')).toEqual('20');
    expect(req.request.params.get('offset')).toEqual('10');

    req.flush(of([]));

  });

  it('should get all available themes', () => {

    const url = `${editorApiPath}/api/themes`;

    api.getAllAvailableThemes().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should get page actions', () => {

    const pageId = 'p-001';
    const url = `${editorApiPath}/api/theme/${themeId}/pages/${pageId}/actions`;

    api.getPageActions(themeId, pageId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should return undefined on get shop', () => {

    expect(api.getShop()).toBeUndefined();

  });

  it('should get page', () => {

    const pageId = 'p-001';
    const url = `${editorApiPath}/api/theme/${themeId}/page/${pageId}`;

    api.getPage(themeId, pageId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get pages', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/pages`;

    api.getPages(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should get shop active theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/themes/active`;

    api.getShopActiveTheme().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get shop preview', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/preview`;

    api.getShopPreview(shopId, 'true').subscribe();

    const req = http.expectOne(r => r.url === url);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('include')).toEqual('published');
    expect(req.request.params.get('page')).toEqual('front');

    req.flush(of({}));

  });

  it('should get shop theme active version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/active`;

    api.getShopThemeActiveVersion(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get shop theme by id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}`;

    api.getShopThemeById(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get shop theme version by id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}`;

    api.getShopThemeVersionById(themeId, versionId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get shop theme versions', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/versions`;

    api.getShopThemeVersions(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should get shop themes list', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/themes`;

    api.getShopThemesList().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should return undefined on get shops', () => {

    expect(api.getShops()).toBeUndefined();

  });

  it('should get snapshot', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/snapshot`;

    api.getThemeDetail(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get snapshot by version id', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/version/${versionId}/snapshot`;

    api.getSnapshotByVersionId(themeId, versionId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should get template themes', () => {

    const url = `${editorApiPath}/api/templates`;

    api.getTemplateThemes().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/theme/${themeId}/install`;

    api.installTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should instantly install template theme', () => {

    const url = `${editorApiPath}/api/business/${businessId}/application/${shopId}/template/${themeId}/instant-setup`;

    api.instantInstallTemplateTheme(themeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should publish shop theme version', () => {

    const url = `${editorApiPath}/api/theme/${themeId}/publish`;

    api.publishShopThemeVersion(themeId, versionId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});

    req.flush(of({}));

  });

  it('should return undefined on set as default shop', () => {

    expect(api.setAsDefaultShop(shopId)).toBeUndefined();

  });

  it('should undo action', () => {

    const actionId = 'a-001';
    const url = `${editorApiPath}/api/theme/${themeId}/action/${actionId}`

    api.undoAction(themeId, actionId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('DELETE');

    req.flush(of({}));

  });

  it('should update replicas', () => {

    const actions = [{ id: 'a-001' }];
    const url = `${editorApiPath}/api/theme/${themeId}/actions/apply`

    api.updateReplicas(themeId, actions as any).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(actions);

    req.flush(of({}));

  });

  it('should return undefined on update shop', () => {

    expect(api.updateShop({})).toBeUndefined();

  });

  it('should return undefined on update shop deploy', () => {

    expect(api.updateShopDeploy(shopId, {})).toBeUndefined();

  });

  it('should update shop theme name', () => {

    const name = 'name';
    const url = `${editorApiPath}/api/theme/${themeId}/name`;

    api.updateShopThemeName(themeId, name).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({ name });

    req.flush(of({}));

  });

  it('should update shop theme preview', () => {

    const imagePreview = 'preview.jpg';
    const url = `${editorApiPath}/api/theme/${themeId}/image-preview`;

    api.updateShopThemePreview(themeId, imagePreview).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({ imagePreview });

    req.flush(of(() => { }));

  });

  it('should update theme soure page preview', () => {

    const sourceId = 'src-001';
    const previews = {
      'p-001': { test: true },
    };
    const url = `${editorApiPath}/api/theme/${themeId}/source/${sourceId}/previews`;

    api.updateThemeSourcePagePreviews(themeId, sourceId, previews as any).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(previews);

    req.flush(of({}));

  });

  it('should upload image', () => {

    const container = 'container';
    const file = new File(['image.jpg'], 'image.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/image/business/${businessId}/${container}`;
    let req: TestRequest;

    // w/o return short path
    // w/o error
    api.uploadImage(container, file).subscribe(result => expect(result.blobName).toEqual(`${mediaStoragePath}/${container}/blob`));

    req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);

    req.flush({
      blobName: 'blob',
    });

    // w/ return short path
    api.uploadImage(container, file, true).subscribe(result => expect(result.blobName).toEqual(`/${container}/blob`));

    req = http.expectOne(url);

    req.flush({
      blobName: 'blob',
    });

    // w/ error
    api.uploadImage(container, file, true).subscribe(result => expect(result).toBe(null));

    req = http.expectOne(url);

    req.flush('Upload failed', {
      status: 500,
      statusText: 'Internal Server Error',
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

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);

    req.flush('Upload failed', {
      status: 500,
      statusText: 'Internal Server Error',
    });

  });

  it('should upload image with progress - SUCCESS', () => {

    const container = 'container';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/image/business/${businessId}/${container}`;
    let req: TestRequest;
    let event: any;

    // event.type = upload progress
    api.uploadImageWithProgress(container, file, false).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.UploadProgress);
      expect(response.loaded).toBe(50);
    });

    // event.type = response & return short path = FALSE
    api.uploadImageWithProgress(container, file, false).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.Response);
      expect(response.body.blobName).toEqual(`${mediaStoragePath}/${container}/blob`);
    });

    // event.type = response & return short path = TRUE
    api.uploadImageWithProgress(container, file, true).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.Response);
      expect(response.body.blobName).toEqual(`/${container}/blob`);
    });

    const reqList = http.match(r => r.url === url);

    expect(reqList.length).toBe(3);
    expect(reqList.every(r => r.request.method === 'POST')).toBe(true);
    expect(reqList.every(r => r.request.body.get('file').name === 'test.jpg')).toBe(true);

    // event.type = upload progress
    event = {
      type: HttpEventType.UploadProgress,
      loaded: 10,
      total: 20,
    };
    req = reqList[0];
    req.event(event);

    // event.type = response & return short path = FALSE
    event = {
      type: HttpEventType.Response,
      body: {
        blobName: 'blob',
      },
    };
    req = reqList[1];
    req.event(event);

    // event.type = response & return short path = TRUE
    req = reqList[2];
    req.event(event);

  });

  it('should upload video', () => {

    const container = 'container';
    const file = new File(['video.mp4'], 'video.mp4', { type: 'video/mp4' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;
    let req: TestRequest;

    // w/o error
    api.uploadVideo(container, file).subscribe(result => expect(result).toEqual({
      blobName: `${mediaStoragePath}/${container}/blob`,
      preview: `${mediaStoragePath}/${container}/preview`,
    } as any));

    req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);

    req.flush({
      blobName: 'blob',
      preview: 'preview',
    });

    // w/ error
    api.uploadVideo(container, file).subscribe(result => expect(result).toBe(null));

    req = http.expectOne(url);

    req.flush('Upload failed', {
      status: 500,
      statusText: 'Internal Server Error',
    });

  });

  it('should upload video with progress - ERROR', () => {

    const container = 'container';
    const file = new File(['video.mp4'], 'video.mp4', { type: 'video/mp4' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;

    api.uploadVideoWithProgress(container, file).pipe(
      skipWhile(response => response !== null),
    ).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);

    req.flush('Upload failed', {
      status: 500,
      statusText: 'Internal Server Error',
    });

  });

  it('should upload video with progress - SUCCESS', () => {

    const container = 'container';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${apiMediaPath}/api/video/business/${businessId}/${container}`;
    let req: TestRequest;
    let event: any;

    // event.type = upload progress
    api.uploadVideoWithProgress(container, file).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.UploadProgress);
      expect(response.loaded).toBe(50);
    });

    // event.type = response
    api.uploadVideoWithProgress(container, file).pipe(
      skipWhile(response => response.type === 0),
    ).subscribe((response: any) => {
      expect(response.type).toEqual(HttpEventType.Response);
      expect(response.body.blobName).toEqual(`${mediaStoragePath}/${container}/blob`);
      expect(response.body.preview).toEqual(`${mediaStoragePath}/${container}/preview`);
    });

    const reqList = http.match(r => r.url === url);

    expect(reqList.length).toBe(2);
    expect(reqList.every(r => r.request.method === 'POST')).toBe(true);
    expect(reqList.every(r => r.request.body.get('file').name === 'test.jpg')).toBe(true);

    // event.type = upload progress
    event = {
      type: HttpEventType.UploadProgress,
      loaded: 10,
      total: 20,
    };
    req = reqList[0];
    req.event(event);

    // event.type = response & return short path = FALSE
    event = {
      type: HttpEventType.Response,
      body: {
        blobName: 'blob',
        preview: 'preview',
      },
    };
    req = reqList[1];
    req.event(event);

  });

  it('should post shape', () => {

    const shape = { id: 'sh-001' };
    const url = `${editorApiPath}/api/application/${shopId}/shape`;

    api.postShape(shape).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(shape);

    req.flush(of({}));

  });

  it('should get shapes', () => {

    const url = `${editorApiPath}/api/application/${shopId}/shape`;

    api.getShapes().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should get shape', () => {

    const shapeId = 'sh-001';
    const url = `${editorApiPath}/api/application/${shopId}/shape/${shapeId}`;

    api.getShape(shapeId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of({}));

  });

  it('should patch shape album', () => {

    const albumId = 'album-001';
    const album = { id: 'album-001' };
    const url = `${editorApiPath}/api/application/${shopId}/shape-album/${albumId}`;

    api.patchShapeAlbum(albumId, album).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');

    req.flush(of({}));

  });

  it('should post shape album', () => {

    const album = { id: 'album-001' };
    const url = `${editorApiPath}/api/application/${shopId}/shape-album`;

    api.postShapeAlbum(album).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(album);

    req.flush(of({}));

  });

  it('should get shape albums', () => {

    const url = `${editorApiPath}/api/application/${shopId}/shape-album`;

    api.getShapeAlbums().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush(of([]));

  });

  it('should update shape theme version', () => {

    const body = { test: true };
    const url = `${editorApiPath}/theme/${themeId}/version/${versionId}`;

    api.updateThemeVersion(themeId, versionId, body).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual(body);

    req.flush(of({}));

  });

  afterAll(() => {

    http.verify();

  });

});
