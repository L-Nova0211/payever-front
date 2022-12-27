import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

import { StorageService } from './storage.service';

export interface UploadResponseInterface {
  blobName: string;
  brightnessGradation: string;
  preview: string;
}

@Injectable()
export class UploaderService {

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private http: HttpClient,
    private storageService: StorageService
  ) {
  }

  // This method is copy-pasted from @pe/builder-api
  // Now it's here, becuase we have problems with dependencies
  uploadImageWithProgress(
    container: string,
    file: File,
    returnShortPath: boolean,
  ): Observable<HttpEvent<UploadResponseInterface>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<UploadResponseInterface>(
      `${this.env.backend.media}/api/image/business/${this.storageService.businessUuid}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: HttpEvent<UploadResponseInterface>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number(((event.loaded / event.total) * 100).toFixed(0)),
            };
          }
          case HttpEventType.Response: {
            return {
              ...event,
              body: {
                ...event.body,
                blobName: `${returnShortPath ? '' : this.env.custom.storage}/${container}/${event.body.blobName}`,
              },
            };
          }
          default:
            return event;
        }
      }),
      catchError((_) => {
        return of(null);
      }));
  }


}
