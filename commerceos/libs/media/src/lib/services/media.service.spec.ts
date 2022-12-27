import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { skip } from 'rxjs/operators';

import { PE_ENV } from '@pe/common';

import { MediaContainerType } from './enums';
import { BlobCreateResponse } from './interfaces';
import { MediaService, MediaUrlTypeEnum } from './media.service';

describe('MediaService', () => {

  let service: MediaService;
  let http: HttpTestingController;
  let mediaEnv: any;

  const businessUuid = 'b-uuid';
  const userUuid = 's-uuid';
  const file = new File(['image.jpg'], 'image.jpg', { type: 'image/jpg' });

  beforeEach(() => {

    mediaEnv = {
      custom: {
        storage: 'c-storage',
        cdn: 'c-cdn',
      },
      backend: {
        media: 'be-media',
      },
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        MediaService,
        { provide: PE_ENV, useValue: mediaEnv },
      ],
    });

    service = TestBed.inject(MediaService);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should create blob by business', () => {

    const blob = {
      blobName: 'blobName',
      brightnessGradation: '110%',
    };
    const response = new HttpResponse<BlobCreateResponse>({
      body: blob,
    });
    const container = MediaContainerType.Images;
    const createBlobSpy = spyOn(service, 'createBlob').and.returnValue(of(response));
    const createEndpointSpy = spyOn<any>(service, 'createBusinessEndpointUrl').and.returnValue('created.endpoint');

    service.createBlobByBusiness(businessUuid, container, file).subscribe((result: HttpResponse<BlobCreateResponse>) => {
      expect(result.body).toEqual(response.body);
    });
    expect(createBlobSpy).toHaveBeenCalledWith('created.endpoint', file);
    expect(createEndpointSpy).toHaveBeenCalledWith(businessUuid, container, 'image');

  });

  it('should crate blobs by business', () => {

    const blob = {
      blobName: 'blobName',
      brightnessGradation: '110%',
    };
    const response = new HttpResponse<BlobCreateResponse[]>({
      body: [blob],
    });
    const container = MediaContainerType.Images;
    const createBlobsSpy = spyOn(service, 'createBlobs').and.returnValue(of(response));
    const createEndpointSpy = spyOn<any>(service, 'createBusinessEndpointUrl').and.returnValue('created.endpoint');

    service.createBlobsByBusiness(businessUuid, container, [file]).subscribe((result: HttpResponse<BlobCreateResponse[]>) => {
      expect(result.body).toEqual(response.body);
    });
    expect(createBlobsSpy).toHaveBeenCalledWith('created.endpoint', [file]);
    expect(createEndpointSpy).toHaveBeenCalledWith(businessUuid, container);

  });

  it('should delete blob by business', () => {

    const container = MediaContainerType.Products;
    const blobName = 'blob';
    const deleteSpy = spyOn(service, 'deleteBlob').and.returnValue(of());
    const createEndpointSpy = spyOn<any>(service, 'createBusinessEndpointUrl').and.returnValue('created.endpoint');

    service.deleteBlobByBusiness(businessUuid, container, blobName).subscribe();

    expect(deleteSpy).toHaveBeenCalledWith('created.endpoint', blobName);
    expect(createEndpointSpy).toHaveBeenCalledWith(businessUuid, container);

  });

  it('should create blob by user', () => {

    const blob = {
      blobName: 'blobName',
      brightnessGradation: '110%',
    };
    const response = new HttpResponse<BlobCreateResponse>({
      body: blob,
    });
    const container = MediaContainerType.Products;
    const createBlobsSpy = spyOn(service, 'createBlob').and.returnValue(of(response));
    const createEndpointSpy = spyOn<any>(service, 'createUserEndpointUrl').and.returnValue('created.endpoint');

    service.createBlobByUser(userUuid, container, file).subscribe((result: HttpResponse<BlobCreateResponse>) => {
      expect(result.body).toEqual(result.body);
    });
    expect(createBlobsSpy).toHaveBeenCalledWith('created.endpoint', file);
    expect(createEndpointSpy).toHaveBeenCalledWith(userUuid, container);

  });

  it('should delete blob by user', () => {

    const container = MediaContainerType.Products;
    const blobName = 'blob';
    const deleteSpy = spyOn(service, 'deleteBlob').and.returnValue(of());
    const createEndpointSpy = spyOn<any>(service, 'createUserEndpointUrl').and.returnValue('created.endpoint');

    service.deleteBlobByUser(userUuid, container, blobName).subscribe();

    expect(deleteSpy).toHaveBeenCalledWith('created.endpoint', blobName);
    expect(createEndpointSpy).toHaveBeenCalledWith(userUuid, container);

  });

  it('should create blob', () => {

    const blob = {
      blobName: 'blobName',
      brightnessGradation: '110%',
    };
    const response = new HttpResponse<BlobCreateResponse>({
      body: blob,
    });
    const endpoint = 'endpoint.url';
    const postSpy = spyOn<any>(service, 'postFile').and.returnValue(of(response));

    service.createBlob(endpoint, file).subscribe((result: HttpResponse<BlobCreateResponse>) => {
      expect(result.body).toEqual(response.body);
    });
    expect(postSpy).toHaveBeenCalledWith(endpoint, file);

  });

  it('should create blobs', () => {

    const blob = {
      blobName: 'blobName',
      brightnessGradation: '110%',
    };
    const endpoint = 'endpoint.url';

    service.createBlobs(endpoint, [file]).pipe(skip(1)).subscribe((result: HttpResponse<BlobCreateResponse[]>) => {
      expect(result.body).toEqual([blob]);
    });

    const req = http.expectOne(endpoint);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.getAll('file')).toEqual([file]);
    expect(req.request.reportProgress).toBe(true);

    req.flush([blob]);

  });

  it('should delete blob', () => {

    const blobName = 'blob';
    const endpoint = 'endpoint.url';

    service.deleteBlob(endpoint, blobName).subscribe();

    const req = http.expectOne(`${endpoint}/${blobName}`);

    expect(req.request.method).toEqual('DELETE');

    req.flush({});

  });

  it('should upload file', () => {

    const response = new HttpResponse<any>({
      body: { id: '1', url: 'url' },
    });
    const postSpy = spyOn<any>(service, 'postFile').and.returnValue(of(response));
    const createEndpointSpy = spyOn<any>(service, 'createFileStorageEndpointUrl').and.returnValue('created.endpoint');

    service.uploadFile(file).subscribe((result: any) => {
      expect(result.body).toEqual(response.body);
    });
    expect(createEndpointSpy).toHaveBeenCalled()
    expect(postSpy).toHaveBeenCalledWith('created.endpoint', file);

  });

  it('should get media url', () => {

    const blob = 'blob';
    const container = MediaContainerType.Images;
    const type = MediaUrlTypeEnum.Blurred;
    const size = 'large';
    let result: string;

    /**
     * argument blob for getMediaUrl function is null
     */
    expect(service.getMediaUrl(null, container)).toBeNull();

    /**
     * argument blob for getMediaUrl function is set with https:// prefix
     */
    expect(service.getMediaUrl(`https://${blob}`, container)).toEqual(`https://${blob}`);

    /**
     * arguments type & size for getMediaUrl function are both null as default
     */
    result = service.getMediaUrl(blob, container);
    expect(result).toEqual(`${mediaEnv.custom.storage}/${container}/${blob}`);

    /**
     * arguments type & size for getMediaUrl function are both set
     */
    result = service.getMediaUrl(blob, container, type, size);
    expect(result).toEqual(`${mediaEnv.custom.storage}/${container}:${size}/${encodeURIComponent(`${blob}-${type}`)}`);

  });

  it('should get icons png url', () => {

    const icon = 'iconBlob';

    expect(service.getIconsPngUrl(icon)).toEqual(`${mediaEnv.custom.cdn}/icons-png/${icon}`);

  });

  it('should post file', () => {

    const endpoint = 'endpoint.url';

    service[`postFile`](endpoint, file).subscribe();

    const req = http.expectOne(endpoint);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('file')).toEqual(file);
    expect(req.request.reportProgress).toBe(true);

    req.flush({});

  });

  it('should create business endpoint url', () => {

    const container = MediaContainerType.Images;
    let result: string;

    /**
     * argument type for createBusinessEndpointUrl function is 'image' as default
     */
    result = service[`createBusinessEndpointUrl`](businessUuid, container);
    expect(result).toEqual(`${mediaEnv.backend.media}/api/image/business/${businessUuid}/${container}`);

    /**
     * argument type for createBusinessEndpointUrl function is 'video'
     */
    result = service[`createBusinessEndpointUrl`](businessUuid, container, 'video');
    expect(result).toEqual(`${mediaEnv.backend.media}/api/video/builder-video`);

  });

  it('should create user endpoint url', () => {

    const container = MediaContainerType.Builder;

    expect(service[`createUserEndpointUrl`](userUuid, container))
      .toEqual(`${mediaEnv.backend.media}/api/image/user/${userUuid}/${container}`);

  });

  it('should create file storage endpoint url', () => {

    expect(service[`createFileStorageEndpointUrl`]()).toEqual(`${mediaEnv.backend.media}/api/storage/file`);

  });

  afterAll(() => {

    http.verify();

  });

});
