import { Injectable } from '@angular/core';
import uniqBy from 'lodash-es/uniqBy';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, Subject } from 'rxjs';

import { AppThemeEnum, EnvService } from '@pe/common';
import { FolderItem } from '@pe/folders';

import {
  PeFilterChange,
  PeGridItem,
  PeGridItemType,
  PeGridSearchFilterInterface,
  PeGridSearchFiltersInterface,
} from './misc/interfaces';
import { PeListImagesService } from './misc/services/list-images.service';

@Injectable({ providedIn: 'any' })
export class PeGridService {
  items$ = new BehaviorSubject<PeGridItem[]>([]);
  selectedItems$ = new BehaviorSubject<PeGridItem[]>([]);
  restoreScroll$ = new Subject<boolean>();

  embedMod = false;

  theme = this.envService?.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  constructor(
    private envService: EnvService,
    private peListImagesService: PeListImagesService
  ) {}

  get selectedItems() {
    return this.selectedItems$.value;
  }

  get selectedItemsIds(): string[] {
    return this.getSelectedIds('item');
  }

  get selectedFoldersIds(): string[] {
    return this.getSelectedIds('folder');
  }

  get items() {
    return this.items$.value;
  }

  set items(items: PeGridItem[]) {
    const uniqItems = uniqBy(items, 'id');
    this.peListImagesService.imagesLoad = [];
    this.items$.next(uniqItems);
    this.checkSelected(uniqItems);
  }

  set selectedItems(items: PeGridItem[]) {
    this.selectedItems$.next(items);
  }

  isAllSelected(): boolean {
    return this.selectedItems.length === this.items.length;
  }

  removeSelected(ids: string[]): void {
    const items = this.selectedItems.filter(item => !ids?.includes(item.id));
    this.selectedItems = items;
  }

  private getSelectedIds(type?: string) {
    return this.selectedItems
      .filter((item: PeGridItem) => type ? item.type === type : true)
      .map((item: PeGridItem) => item.id);
  }

  private checkSelected(items: PeGridItem[]) {
    const selectedIds = this.getSelectedIds();
    this.selectedItems = items.filter((item) => selectedIds.includes(item.id));
  }

  public filtersChange(filters: PeFilterChange[]): PeGridSearchFiltersInterface {
    let filterConfiguration = null;
    filters.forEach((filterItem) => {
      const filterID = filterItem.filter;
      const issetFilter = filterConfiguration?.hasOwnProperty(filterID);
      const searchFilter: PeGridSearchFilterInterface = {
        condition: filterItem.contain,
        value: [filterItem.search],
      };
      const conditionIndex = issetFilter
        ? filterConfiguration[filterID]
            .findIndex(((filter: PeGridSearchFilterInterface) => filter.condition === searchFilter.condition))
        : -1;

      if (!issetFilter || conditionIndex === -1) {
        filterConfiguration = {
          ...filterConfiguration,
          [filterID]: !issetFilter
            ? [searchFilter]
            : [
                ...filterConfiguration[filterID] as [],
                searchFilter,
              ],
        };
      } else if (issetFilter && conditionIndex !== -1) {
        filterConfiguration = {
          ...filterConfiguration,
          [filterID]: [{
            ...filterConfiguration[filterID][conditionIndex],
            value: [
              ...(filterConfiguration[filterID][conditionIndex] as PeGridSearchFilterInterface).value,
              ...searchFilter.value,
            ],
          }],
        };
      }
    });

    return filterConfiguration;
  }

  public foldersToGridItemMapper(folders: FolderItem[]): PeGridItem[] {
    return folders.map((folder: FolderItem): PeGridItem => {
      return {
        action: {
          label: 'grid.actions.open',
          more: true,
        },
        data: {
          position: folder.position ? cloneDeep(folder.position) : null,
          children: folder.children ? cloneDeep(folder.children) : null,
        },
        columns: [
          {
            name: 'name',
            value: 'name',
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        id: folder._id,
        image: folder.image,
        isDraggable: true,
        title: folder.name,
        type: PeGridItemType.Folder,
      };
    });
  }
}
