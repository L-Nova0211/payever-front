import { HttpClient, HttpEvent } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Injectable({ providedIn: 'root' })
export class UploadMediaService {
  type: 'image' | 'video';
  container: string;
  file: File;
  uploadProgress: number;
  totalUploadProgress: number;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface, private http: HttpClient) {
  }

  postMediaBlob(file: File, businessId: string) {
    const type = file && file.type.split('/')[0] === 'image' ? 'image' : 'video';
    this.container = type === 'image' ? 'builder' : 'builder-video';

    const uploadFile$ = this.sendMediaFile(
      file,
      businessId,
      type,
      this.container,
    );

    return uploadFile$;
  }

  sendMediaFile<T>(file: File, businessId: string, type: 'video' | 'image', container: string):
    Observable<HttpEvent<T>> {
    const formData = new FormData();
    formData.set('file', file);

    return this.http.post<any>(
      `${this.env.backend.media}/api/${type}/business/${businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    );
  }

  sendAttachments<T>(files: File, businessId: string, invoiceId: string):
    Observable<HttpEvent<T>> {
    const formData = new FormData();
    formData.set('file', files);

    return this.http.post<any>(
      `${this.env.backend.media}/api/file/business/${businessId}/invoice/application/${invoiceId}`,
      formData,
      { reportProgress: true, observe: 'events' },
    );
  }

  getAttachments(businessId: string, invoiceId: string): Observable<any[]> {

    return this.http.get<any>(
      `${this.env.backend.media}/api/file/business/${businessId}/invoice/${invoiceId}`
    );
  }

  deleteAttachment<T>(businessId: string, blobName: string): Observable<T> {

    return this.http.delete<any>(
      `${this.env.backend.media}/api/file/business/${businessId}/invoice/${blobName}`
    );
  }
}
