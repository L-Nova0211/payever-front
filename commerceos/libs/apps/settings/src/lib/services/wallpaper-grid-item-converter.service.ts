import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { PeGridItemType } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';
import { WallpaperService } from '@pe/wallpaper';

import { WalpaperType } from '../misc/enum';
import { WallpaperGridItemInterface } from '../misc/interfaces';

import { WallpaperDataInterface } from './api.service';


@Injectable()
export class WallpaperGridItemConverterService {
  mediaContainerType = MediaContainerType.Wallpapers;
  industryTranslationKey = 'assets.industry.';
  constructor(
    private mediaUrlPipe: MediaUrlPipe,
    private translateService: TranslateService,
    private peWallpaper: WallpaperService,
  ) { 
    const business = JSON.parse(localStorage.getItem('pe_opened_business'))
    this.peWallpaper.backgroundImage = business?.currentWallpaper?.wallpaper
  }

  private activeItem = new Subject<WallpaperGridItemInterface>();
  public get activeItem$() {return this.activeItem.asObservable()};

  getDataGridItems(wallpapers: WallpaperDataInterface[], 
      wallpaperType:WalpaperType = WalpaperType.Custom ): WallpaperGridItemInterface[] {
    return wallpapers.map((wallpaper) => {
      if (wallpaper.industry && !wallpaper.industry.includes(this.industryTranslationKey)) {
        wallpaper.industry = this.translateService.translate(`${this.industryTranslationKey + wallpaper.industry}`);
      }
      const industry = wallpaper.industry.replace(/assets.industry./, '');
      const currentWallpaper = this.peWallpaper.backgroundImage;
      const itemImage = this.mediaUrlPipe.transform(wallpaper.wallpaper, this.mediaContainerType);

      const item =  {
        wallpaperType:wallpaperType ,
        id: wallpaper,
        wallpaper,
        type: PeGridItemType.Item,
        image: this.mediaUrlPipe.transform(wallpaper.wallpaper, this.mediaContainerType),
        title: wallpaper.name ?? wallpaper.wallpaper.split('.')[0],
        badge:{
          label: currentWallpaper ==  itemImage ? 'Set' :'',
          backgroundColor:'',
          color:'',
        },
        industry: [industry],
        action: {
          label: null,
          more:true,
        },
        columns: [
          {
            name: 'name',
            value: this.translateService.translate('info_boxes.panels.wallpaper.sort_by_action.name'),
          },
          {
            name: 'industry',
            value: wallpaper.industry,
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
      };

      if(item.badge?.label == 'Set'){
          this.activeItem.next(item)
      }

      return item;
    });
  }

  getFilteredWallpapers(galleryWallpapers: WallpaperDataInterface[], 
      wallPaperType:WalpaperType): WallpaperGridItemInterface[] {
    return this.getDataGridItems(galleryWallpapers, wallPaperType);
  }

  isWallpaperSet(wallpaper, activeWallpaper): boolean {
    return wallpaper.wallpaper === activeWallpaper?.wallpaper && wallpaper.name === activeWallpaper?.name;
  }

  filterDataGrid(filters, items) {
    let itemsAfterFilters = items;
    filters.forEach((filter) => {
      itemsAfterFilters = itemsAfterFilters.filter((item) => {
        const searchEl =  item[filter.filter];
        const isFound = (new RegExp(filter.search as string, 'i')).test(searchEl);

        return filter.contain === 'contains' ? isFound : !isFound;
      });
    });

    return itemsAfterFilters;
  }
}
