import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebMediaService, PebMediaSidebarCollectionFilters, PebMediaSidebarCollectionItem } from '@pe/builder-core';

import { mockMediaData } from './media.constants';

@Injectable({ providedIn: 'root' })
export class MockMediaService extends PebMediaService {

  constructor(
    private http: HttpClient,
  ) {
    super();
  }

  getImageCollection(filters: PebMediaSidebarCollectionFilters): Observable<PebMediaSidebarCollectionItem> {
    return this.getMockData();
  }

  getVideoCollection(filters: PebMediaSidebarCollectionFilters): Observable<PebMediaSidebarCollectionItem> {
    return this.getMockData();
  }

  getCategories() {
    return this.getMockData()
      .pipe(
        map(mock => mock.categories),
      );
  }

  getFormats() {
    return this.getMockData()
      .pipe(
        map(mock => mock.formats),
      );
  }

  getStyles() {
    return this.getMockData()
      .pipe(
        map(mock => mock.styles),
      );
  }


  getMockData(): Observable<PebMediaSidebarCollectionItem> {
    return of(mockMediaData);
  }

  uploadImage(blob: Blob): Observable<string> {
    return of(URL.createObjectURL(blob));
  }

  uploadVideo(videoBlob: Blob): Observable<string> {
    return of(URL.createObjectURL(videoBlob));
  }
}
