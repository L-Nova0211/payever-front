import { Injectable } from '@angular/core';

import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';

import { WallpaperViewEnum } from '../misc/enum';
import { WallpaperTreeInterface } from '../misc/interfaces';

@Injectable()
export class PebWallpaperSidebarService {
  categoryTranslationKey = 'assets.product.';
  industryTranslationKey = 'assets.industry.';
  filename = 'folder.png';

  constructor(
    private translateService: TranslateService,
    private mediaService: MediaService,
    ) {
  }

  getTreeData(arr): WallpaperTreeInterface {
    return {
      name: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.industry'),
      folder: WallpaperViewEnum.gallery,
      isHideMenu: true,
      _id: WallpaperViewEnum.gallery,
      children: arr.map((category) => {
        return {
          category: category.code,
          name: this.translateService.translate(`${this.categoryTranslationKey + category.code}`),
          image: this.mediaService.getMediaUrl(this.filename, 'cdn/images'),
          _id: category._id,
          isHideMenu: true,
          children: category.industries.map((industry) => {
            return {
              category: this.translateService.translate(`${this.industryTranslationKey + industry.code}`),
              folder: category.code,
              _id: industry._id,
              isHideMenu: true,
              name: this.translateService.translate(`${this.industryTranslationKey + industry.code}`),
              data: industry.wallpapers.map((wallpaper) => {
                return {
                  isFolder: false,
                  category: wallpaper.name,
                };
              }),
            };
          }),
        };
      }),
      editMode: false,
    };
  }

  getMyWallpaperTree(): WallpaperTreeInterface {
    return {
      name: this.translateService.translate('info_boxes.panels.wallpaper.tabs.my_wallpapers'),
      folder: WallpaperViewEnum.myWallpapers,
      children: [],
      _id: WallpaperViewEnum.myWallpapers,
    };
  }
}
