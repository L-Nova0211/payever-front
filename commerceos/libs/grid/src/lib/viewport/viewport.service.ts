
import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { debounceTime, map, shareReplay } from 'rxjs/operators';

import { MAX_COLUMNS, MIN_ITEM_WIDTH } from '../constants';
import { PeGridService } from '../grid.service';
import { PeGridView } from '../misc/enums';
import { PeGridItem, PeGridMenuItemConfig } from '../misc/interfaces';

@Injectable({ providedIn: 'any' })
export class PeGridViewportService {
  private menuItemConfig = {
    minItemWidth: MIN_ITEM_WIDTH,
    maxColumns: MAX_COLUMNS,
  };

  private viewSubject$ = new BehaviorSubject<PeGridView>(PeGridView.Table);
  private configSubject$ = new BehaviorSubject<PeGridMenuItemConfig>(this.menuItemConfig);

  selectable: boolean;
  viewChange$ = this.viewSubject$.asObservable();
  isMobile = window.innerWidth <= 720;
  deviceTypeChange$ = new BehaviorSubject<{
    isMobile: boolean
  }>({ isMobile: this.isMobile });

  isMobile$ = merge(
    of(this.isMobile),
    fromEvent(window, 'resize').pipe(
      debounceTime(50),
      map(() => window.innerWidth <= 720),
    ),
  ).pipe(
    shareReplay(1),
  );

  get view(): PeGridView {
    return this.viewSubject$.value;
  }

  set view(view: PeGridView) {
    this.viewSubject$.next(view);
  }

  get config(): PeGridMenuItemConfig {
    return this.configSubject$.value;
  }

  set config(config: PeGridMenuItemConfig) {
    this.configSubject$.next(config);
  }

  constructor(
    private peGridService: PeGridService,
  ) { }

  onSelect(item: PeGridItem): void {
    let items = this.peGridService.selectedItems;

    if (!this.isSelected(item)) {
      items.push(item);
    } else {
      items = items.filter(el => el.id !== item.id);
    }

    this.peGridService.selectedItems = items;
  }

  onSelectAll(): void {
    const items = this.peGridService.items;
    const selectedItem = this.peGridService.selectedItems;

    if (items.length === selectedItem.length) {
      this.peGridService.selectedItems = [];
    } else {
      this.peGridService.selectedItems = [ ...items ];
    }
  }

  isSelected(item: PeGridItem): boolean {
    return this.peGridService.selectedItems.findIndex(selectedItem => selectedItem.id === item.id) !== -1;
  }

  isBasic(item: PeGridItem): boolean {
    return !!item.basic;
  }

  isSelectedAll(): boolean {
    const items = this.peGridService.items;
    const selectedItem = this.peGridService.selectedItems;

    return items.length && items.length === selectedItem.length;
  }
}
