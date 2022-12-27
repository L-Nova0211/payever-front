import { Injectable } from '@angular/core';

import { WallpaperDataInterface } from './api.service';


@Injectable()
export class PebWallpaperStorageService {
  private readonly DEFAULT_WALLPAPER: WallpaperDataInterface = {
    wallpaper: '81d7803f-df05-407d-9676-89a5f9b24118-default-wallpaper.jpg',
    theme: 'default',
  };

  constructor() { }

  get defaultWallpaper() {
    return this.DEFAULT_WALLPAPER;
  }
}
