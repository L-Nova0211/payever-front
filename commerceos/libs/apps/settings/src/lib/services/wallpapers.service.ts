import { HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, zip } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { BlobCreateResponse, MediaContainerType, MediaService } from '@pe/media';

import { OwnerTypesEnum } from '../misc/enum';

import { AbstractService } from './abstract.service';
import { ApiService, BusinessProductWallpaperInterface, WallpaperDataInterface } from './api.service';
import { BusinessEnvService } from './env.service';

@Injectable()
export class PebWallpapersService extends AbstractService {

  mediaContainerType = MediaContainerType.Wallpapers;

  constructor(
    private apiService: ApiService,
    private envService: BusinessEnvService,
    private mediaService: MediaService,
  ) {
    super();
  }

  get businessId() {
    return this.envService.businessUuid;
  }

  loadAllWallpapers(page, limit): Observable<WallpaperDataInterface[]> {
    return this.apiService.getAllWallpapers(page, limit);
  }

  loadWallpapersTree(): Observable<BusinessProductWallpaperInterface[]> {
    return this.apiService.getWallpaperTree();
  }

  loadWallpaperByCode(code, page, limit): Observable<WallpaperDataInterface[]> {
    return this.apiService.getWallpapersByCode(code, page, limit);
  }

  searchWallpaper(searchItems, navId, page, limit): Observable<WallpaperDataInterface[]> {
    return this.apiService.searchWallpaper(searchItems, page, limit, navId);
  }

  loadWallpapers(page, limit): Observable<any> {
    return this.apiService.getAllWallpapers(page, limit)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((galleryWallpapers) => {
          return zip(of(galleryWallpapers),
            this.envService.ownerType === OwnerTypesEnum.Personal
              ? this.apiService.getMyPersonalWallpapers()
              : this.apiService.getMyBusinessWallpapers(this.envService.businessUuid),
          );
        }),
      );
  }

  setWallpaper(wallpaper): Observable<Object> {
    if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.apiService.setPersonalWallpaper(wallpaper);
    } else {
      return this.apiService.setBusinessWallpaper(this.businessId , wallpaper);
    }
  }

  public postImageBlob = (file: File): Observable<HttpEvent<BlobCreateResponse>> => {
    if (this.envService.ownerType === OwnerTypesEnum.Business) {
      return this.mediaService.createBlobByBusiness(this.envService.businessUuid, this.mediaContainerType, file);
    } else if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.mediaService.createBlobByUser(this.envService.userUuid, this.mediaContainerType, file);
    }
  }

  onWallpaperUploaded(wallpaper: string, theme: string): WallpaperDataInterface {
    const data: WallpaperDataInterface = { wallpaper, theme };
    if (this.envService.ownerType === OwnerTypesEnum.Business) {
      this.apiService.addBusinessWallpaper(this.envService.businessUuid, data).subscribe({
        error: (err) => {
          this.apiService.handleError(err, true);
        },
      });
    } else if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      this.apiService.addPersonalWallpaper(data).subscribe({
        error: (err) => {
          this.apiService.handleError(err, true);
        },
      });
    }

    return data;
  }

  deleteWallpaper(wallpaper): Observable<Object> {
    if (this.envService.ownerType === OwnerTypesEnum.Personal) {
      return this.apiService.deletePersonalWallpaper(wallpaper.wallpaper);
    } else {
      return this.apiService.deleteBusinessWallpaper(this.envService.businessUuid, encodeURI(wallpaper.wallpaper));
    }
  }
}
