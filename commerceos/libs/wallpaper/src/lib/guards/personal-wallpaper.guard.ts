import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Data } from '@angular/router';

import { ApiService } from '@pe/api';

import { BackgroundService } from '../services/background.service';
import { WallpaperService } from '../services/wallpaper.service';

@Injectable({ providedIn: 'any' })
export class PersonalWallpaperGuard implements CanActivate {

  platformElements = [
    '.platform-background-wrap',
    '.platform-background',
    '.platform-background-overlay',
  ];

  constructor(
    private apiService: ApiService,
    private backgroundService: BackgroundService,
    private wallpaperService: WallpaperService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const path = route.parent.url[0].path;
    this.apiService.getPersonalWallpaper().subscribe(
      (wallpapersData: Data) => {
        if ( wallpapersData && wallpapersData.currentWallpaper ) {
          this.wallpaperService.setBackgrounds(wallpapersData.currentWallpaper.wallpaper);
        }
        else {
          this.wallpaperService.showDashboardBackground(false);
          this.wallpaperService.resetBackgroundsToDefault();
        }
      },
      () => {
        this.wallpaperService.showDashboardBackground(false);
        this.wallpaperService.resetBackgroundsToDefault();
      },
      () => {
        this.backgroundService.setBackgroundImage(this.wallpaperService.blurredBackgroundImage, this.platformElements);
      }
    );

    return true;
  }
}
