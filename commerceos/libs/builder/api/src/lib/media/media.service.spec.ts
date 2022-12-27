import { HttpEventType } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { skip } from 'rxjs/operators';

import { MediaItemType, PebMediaSidebarCollectionFilters } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import {
  BUILDER_MEDIA_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
} from '../constants';

import { SynchronizationTasKindEnum } from './enums/synchronization-task-kind.enum';
import { MediaService } from './media.service';

describe('MediaService', () => {

  let api: MediaService;
  let http: HttpTestingController;
  let envService: jasmine.SpyObj<EnvService>;
  let filters: PebMediaSidebarCollectionFilters;

  const builderMediaPath = 'builder-media-api';
  const mediaPath = 'peb-media-api';
  const storagePath = 'storage';
  const studioPath = 'studio-api';
  const synchronizerPath = 'synchronizer-api';

  beforeEach(() => {

    filters = {
      categories: ['Nature', 'Business'],
      styles: ['Vivid'],
      formats: ['Album'],
      hasPeople: false,
      sortBy: 'asc',
    };

    const envServiceMock = {
      businessId: '000-111',
      shopId: '222',
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MediaService,
        { provide: BUILDER_MEDIA_API_PATH, useValue: builderMediaPath },
        { provide: PEB_MEDIA_API_PATH, useValue: mediaPath },
        { provide: PEB_STORAGE_PATH, useValue: storagePath },
        { provide: PEB_STUDIO_API_PATH, useValue: studioPath },
        { provide: PEB_SYNCHRONIZER_API_PATH, useValue: synchronizerPath },
        { provide: EnvService, useValue: envServiceMock },
      ],
    });

    api = TestBed.inject(MediaService);

    http = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(EnvService) as jasmine.SpyObj<EnvService>;

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should get business id', () => {

    expect(api[`businessId`]).toEqual(envService.businessId);

  });

  it('should get collection', () => {

    const pagination = {
      offset: 50,
      limit: 10,
    };
    const url = `${builderMediaPath}/api/selection`;
    let req: TestRequest;

    /**
     * pagination & filters are {} as default
     */
    api.getCollection().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.get('offset')).toEqual('0');
    expect(req.request.params.get('limit')).toEqual('100');

    /**
     * pagination & filters are set
     */
    filters.formats = undefined;

    api.getCollection({ pagination, filters }).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush({});

    expect(req.request.params.get('offset')).toEqual('50');
    expect(req.request.params.get('limit')).toEqual('10');
    expect(req.request.params.get('filters[0][field]')).toEqual('categories');
    expect(req.request.params.get('filters[0][condition]')).toEqual('is');
    expect(req.request.params.get('filters[0][value][0]')).toEqual('Nature');
    expect(req.request.params.get('filters[0][value][1]')).toEqual('Business');
    expect(req.request.params.get('filters[1][field]')).toEqual('styles');
    expect(req.request.params.get('filters[1][condition]')).toEqual('is');
    expect(req.request.params.get('filters[1][value][0]')).toEqual('Vivid');
    expect(req.request.params.get('filters[3][field]')).toEqual('hasPeople');
    expect(req.request.params.get('filters[3][condition]')).toEqual('is');
    expect(req.request.params.get('filters[3][value]')).toEqual('false');
    expect(req.request.params.get('sortBy')).toEqual('asc');

  });

  it('should get image collection', () => {

    const url = `${builderMediaPath}/api/selection`;

    api.getImageCollection(filters).subscribe();

    const request = http.expectOne(req => req.url === url);

    expect(request.request.method).toEqual('GET');
    expect(request.request.params.get('page')).toEqual('1');
    expect(request.request.params.get('perPage')).toEqual('54');
    expect(request.request.params.get('sortBy')).toEqual('asc');
    expect(request.request.params.get('filters[0][value]')).toEqual('image');
    expect(request.request.params.get('filters[1][value][0]')).toEqual('Nature');
    expect(request.request.params.get('filters[1][value][1]')).toEqual('Business');
    expect(request.request.params.get('filters[2][value][0]')).toEqual('Album');
    expect(request.request.params.get('filters[3][value][0]')).toEqual('Vivid');
    expect(request.request.params.get('filters[4][value]')).toEqual('false');

  });

  it('should get image collection', () => {

    const url = `${builderMediaPath}/api/selection`;

    api.getVideoCollection(filters).subscribe();

    const request = http.match(req => req.url === url)[0];

    expect(request.request.method).toEqual('GET');
    expect(request.request.params.get('page')).toEqual('1');
    expect(request.request.params.get('perPage')).toEqual('54');
    expect(request.request.params.get('sortBy')).toEqual('asc');
    expect(request.request.params.get('filters[0][value]')).toEqual('video');
    expect(request.request.params.get('filters[1][value][0]')).toEqual('Nature');
    expect(request.request.params.get('filters[1][value][1]')).toEqual('Business');
    expect(request.request.params.get('filters[2][value][0]')).toEqual('Album');
    expect(request.request.params.get('filters[3][value][0]')).toEqual('Vivid');
    expect(request.request.params.get('filters[4][value]')).toEqual('false');

  });

  it('should get categories', () => {

    const types = [MediaItemType.Image];
    const url = `${builderMediaPath}/api/selection/categories`;
    let req: TestRequest;

    /**
     * argument types is undefined as default
     */
    api.getCategories().subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('types')).toBe(false);

    /**
     * argument types is set
     */
    api.getCategories(types).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.getAll('types')).toEqual(types);

  });

  it('should get formats', () => {

    const types = [MediaItemType.Image];
    const url = `${builderMediaPath}/api/selection/formats`;
    let req: TestRequest;

    /**
     * argument types is undefined as default
     */
    api.getFormats().subscribe();

    req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('types')).toBe(false);

    /**
     * argument types is set
     */
    api.getFormats(types).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.getAll('types')).toEqual(types);

  });

  it('should get styles', () => {

    const types = [MediaItemType.Image];
    const url = `${builderMediaPath}/api/selection/styles`;
    let req: TestRequest;

    /**
    * argument types is undefined as default
    */
    api.getStyles().subscribe();

    req = http.expectOne(url);
    req.flush([]);

    expect(req.request.method).toEqual('GET');
    expect(req.request.params.has('types')).toBe(false);

    /**
     * argument types is set
     */
    api.getStyles(types).subscribe();

    req = http.expectOne(r => r.url === url);
    req.flush([]);

    expect(req.request.params.getAll('types')).toEqual(types);

  });

  it('should upload image', () => {

    const { businessId } = envService;
    const container = 'container';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${mediaPath}/api/image/business/${businessId}/${container}`;
    let request: TestRequest;

    // w/o blob name
    api.uploadImage(file, container).subscribe((response) => {
      expect(response.blobName).toEqual(`${storagePath}/${container}/blob`);
      expect(response.thumbnail).toEqual(`${storagePath}/${container}/thumb`);
    });

    request = http.expectOne(url);
    expect(request.request.method).toEqual('POST');
    expect(request.request.body.get('buffer').name).toEqual('test.jpg');

    request.flush({
      blobName: 'blob',
      thumbnail: 'thumb',
    });

    // w/ blob name
    api.uploadImage(file, container, 'blob').subscribe((response) => {
      expect(response.blobName).toEqual(`${storagePath}/${container}/blob`);
      expect(response.thumbnail).toEqual(`${storagePath}/${container}/thumb`);
    });

    request = http.expectOne(`${url}/blob`);
    expect(request.request.method).toEqual('POST');
    expect(request.request.body.get('buffer').name).toEqual('test.jpg');

    request.flush({
      blobName: 'blob',
      thumbnail: 'thumb',
    });

  });

  it('should upload image with progress', () => {

    const { businessId } = envService;
    const container = 'container';
    const file = new File(['test'], 'test.jpg', { type: 'image/jpg' });
    const url = `${mediaPath}/api/image/business/${businessId}/${container}`;
    let request: TestRequest;
    let event: any;

    // event.type = upload progress
    api.uploadImageWithProgress(file, container).pipe(skip(1)).subscribe((response) => {
      expect(response.progress).toBe(50);
    });

    // event.type = response
    api.uploadImageWithProgress(file, container).pipe(skip(1)).subscribe((response) => {
      expect(response.body.blobName).toEqual(`${storagePath}/${container}/blob`);
      expect(response.body.thumbnail).toEqual(`${storagePath}/${container}/thumb`);
    });

    const reqList = http.match(req => req.url === url);

    expect(reqList.length).toBe(2);
    expect(reqList.every(req => req.request.method === 'POST')).toBe(true);
    expect(reqList.every(req => req.request.body.get('buffer').name === 'test.jpg')).toBe(true);

    // event.type = upload progress
    event = {
      type: HttpEventType.UploadProgress,
      loaded: 10,
      total: 20,
    };
    request = reqList[0];
    request.event(event);

    // event.type = response & return short path = FALSE
    event = {
      type: HttpEventType.Response,
      body: {
        blobName: 'blob',
        thumbnail: 'thumb',
      },
    };
    request = reqList[1];
    request.event(event);

  });

  it('should upload video', () => {

    const { businessId } = envService;
    const container = 'container';
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const url = `${mediaPath}/api/video/business/${businessId}/${container}`;

    api.uploadVideo(file, container).subscribe((response) => {
      expect(response.blobName).toEqual(`${storagePath}/${container}/blob`);
      expect(response.thumbnail).toEqual(`${storagePath}/${container}/thumb`);
    });

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('buffer').name).toEqual('test.mp4');

    req.flush({
      blobName: 'blob',
      thumbnail: 'thumb',
    });

  });

  it('should search media', () => {

    const { businessId } = envService;
    const keyword = 'search';
    const url = `${studioPath}/api/${businessId}/media/search`;

    api.searchMedia(keyword).subscribe();

    const request = http.expectOne(req => req.url === url);

    expect(request.request.method).toEqual('GET');
    expect(request.request.params.get('name')).toEqual(keyword);

  });

  it('should apply filters', () => {

    const filtersMock = {
      categories: [],
      styles: [],
      formats: [],
      sortBy: 'ASC',
      hasPeople: false,
    };

    const result = api.applyFilters(filtersMock, 'image', 1, 10);

    expect(result.params[`updates`].find(p => p.param === 'page').value).toEqual('1');
    expect(result.params[`updates`].find(p => p.param === 'perPage').value).toEqual('10');
    expect(result.params[`updates`].find(p => p.param === 'sortBy').value).toEqual('ASC');

  });

  it('should upload file', () => {

    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const url = `${mediaPath}/api/storage/file`;

    api.uploadFile(file).subscribe();

    const req = http.expectOne(url);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file').name).toEqual('test.mp4');

    req.flush(of({}));

  });

  it('should import from file', () => {

    const { businessId } = envService;
    const fileUrl = 'https://test.com/test.jpg';
    const url = `${synchronizerPath}/api/synchronization/business/${businessId}/tasks`;

    api.importFromFile(fileUrl, true).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PUT');
    expect(req.request.body.kind).toEqual(SynchronizationTasKindEnum.FileImport);
    expect(req.request.body.fileImport).toEqual({
      fileUrl,
      overwriteExisting: true,
      uploadedImages: undefined,
    });

  });

  it('should get user albums', () => {

    const { businessId } = envService;
    const url = `${studioPath}/api/${businessId}/album?limit=100`;

    api.getUserAlbums().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush({});

  });

  it('should get studio grid filters', () => {

    const url = `${studioPath}/api/attribute?limit=1000`;

    api.getStudioGridFilters().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush({});

  });

  it('should get user filters', () => {

    const { businessId } = envService;
    const url = `${studioPath}/api/${businessId}/attribute?limit=1000`;

    api.getUserFilters().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush({});

  });

  it('should get all media', () => {

    const { businessId } = envService;
    const url = `${studioPath}/api/${businessId}/subscription`;

    api.getAllMedia().subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush({});

  });

  it('should search user media', () => {

    const { businessId } = envService;
    const options = {
      sort: {
        order: 'asc',
        param: 'date',
      },
    };
    const url = `${studioPath}/api/${businessId}/media/search`;
    let request: TestRequest;

    // w/o sort
    api.searchUserMedia('name').subscribe();

    // w/ sort
    api.searchUserMedia('name', options).subscribe();

    const reqList = http.match(req => req.url === url);

    // w/o sort
    request = reqList[0];

    expect(request.request.method).toEqual('GET');

    // w/ sort
    request = reqList[1];

    expect(request.request.method).toEqual('GET');

  });

  it('should search subscriptions', () => {

    const { businessId } = envService;
    const options = {
      sort: {
        order: 'asc',
        param: 'date',
      },
    };
    const url = `${studioPath}/api/${businessId}/subscription/search`;
    let request: TestRequest;

    // w/o sort
    api.searchSubscriptions('name').subscribe();

    // w/ sort
    api.searchSubscriptions('name', options).subscribe();

    const reqList = http.match(req => req.url === url);

    // w/o sort
    request = reqList[0];

    expect(request.request.method).toEqual('GET');

    // w/ sort
    request = reqList[1];

    expect(request.request.method).toEqual('GET');

  });

  it('should get album media by id', () => {

    const { businessId } = envService;
    const albumId = 'album';
    const url = `${studioPath}/api/${businessId}/media/album/${albumId}`;

    api.getAlbumMediaById(albumId).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush({});

  });

  it('should create album', () => {

    const { businessId } = envService;
    const body = { id: 'album-001' };
    const url = `${studioPath}/api/${businessId}/album`;

    api.createAlbum(body).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ...body,
      businessId,
    });

    req.flush({});

  });

  it('should update album', () => {

    const { businessId } = envService;
    const albumId = 'album-001';
    const body = { id: 'album-001', active: false };
    const url = `${studioPath}/api/${businessId}/album/${albumId}`;

    api.updateAlbum(albumId, body).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('PATCH');
    expect(req.request.body).toEqual({
      ...body,
      businessId,
    });

    req.flush({});

  });

  it('should get albums by attribute', () => {

    const { businessId } = envService;
    const attribute = {
      _id: 'attr-001',
      name: 'attr',
    };
    const url = `${studioPath}/api/${businessId}/album/by-user-attribute/${attribute._id}/${attribute.name}?limit=1000&page=1&asc=name&desc=updatedAt&asc=url`;

    api.getAlbumsByAttribute(attribute).subscribe();

    const req = http.expectOne(url);

    expect(req.request.method).toEqual('GET');

    req.flush({});

  });

  afterAll(() => {

    http.verify();

  });

});
