import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, Observer } from 'rxjs';
import { filter, finalize, map, mergeMap } from 'rxjs/operators';

import { BlobCreateResponse, MediaContainerType, MediaService } from '@pe/media';

import { BusinessEnvService } from './index';

const ONE_HUNDRED_PERCENTS = 100;

export interface ImageDetailsInterface {
  originalName: string;
  url: string;
}

export enum UploadEventTypeEnum {
  PROGRESS = 'progress',
  RESULT = 'data'
}

export interface UploadEvent<T> {
  type: UploadEventTypeEnum;
  data: T;
}

export interface UploadProgressEvent {
  currentProgress: number;
  totalProgress: number;
}

export interface UploadResultEvent {
  uploadedImages: ImageDetailsInterface[];
  lastUploadedImage: ImageDetailsInterface;
}

@Injectable()
export class ImagesUploaderService {
  constructor(
    private mediaService: MediaService,
    private envService: BusinessEnvService) {
  }

  uploadImages(images: File[]): Observable<UploadEvent<UploadProgressEvent | UploadResultEvent>> {
    const uploadedImages: ImageDetailsInterface[] = [];

    return new Observable<UploadEvent<UploadProgressEvent | UploadResultEvent>>(
      (observer: Observer<UploadEvent<UploadProgressEvent | UploadResultEvent>>) => {
        from(images)
          .pipe(
            mergeMap(
              (file: File) =>
                this.mediaService
                  .createBlobByBusiness(
                    this.envService.businessUuid,
                    MediaContainerType.Images,
                    file
                  )
                  .pipe(
                    filter((event: HttpEvent<BlobCreateResponse>) =>
                      event.type === HttpEventType.UploadProgress ||
                      event.type === HttpEventType.Response),
                    map((event: HttpEvent<BlobCreateResponse>): UploadEvent<number | ImageDetailsInterface> => {
                      if (event.type === HttpEventType.UploadProgress) {
                        return {
                          type: UploadEventTypeEnum.PROGRESS,
                          data: Number(
                            (event.loaded / event.total * ONE_HUNDRED_PERCENTS).toFixed(0)
                          ),
                        };
                      } else if (event.type === HttpEventType.Response) {
                        return {
                          type: UploadEventTypeEnum.RESULT,
                          data: {
                            url: event.body.blobName,
                            originalName: file.name,
                          },
                        };
                      }
                    })
                  ),
              1
            ),
            finalize(() => {
              observer.complete();
            })
          )
          .subscribe((event: UploadEvent<number | ImageDetailsInterface>) => {
            if (event.type === UploadEventTypeEnum.RESULT) {
              const image = event.data as ImageDetailsInterface;
              uploadedImages.push(image);
              observer.next({
                type: UploadEventTypeEnum.RESULT,
                data: {
                  uploadedImages,
                  lastUploadedImage: image,
                },
              });
            } else if (event.type === UploadEventTypeEnum.PROGRESS) {
              const currentProgress = event.data as number;
              const uploadedImagesPart = uploadedImages.length / images.length * ONE_HUNDRED_PERCENTS;
              const currentProgressPart = currentProgress / images.length;
              const totalProgress = Number((uploadedImagesPart + currentProgressPart).toFixed(0));

              observer.next({
                type: UploadEventTypeEnum.PROGRESS,
                data: {
                  currentProgress,
                  totalProgress,
                },
              });
            }
          });
      });
  }


}
