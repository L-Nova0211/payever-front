import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PeGridItem, PeGridService } from '@pe/grid';

export enum PeGridView {
  List = 'list',
  Table = 'table',
}

@Injectable()
export class PeGridViewportProductsService {
  private viewSubject$ = new BehaviorSubject<PeGridView>(PeGridView.Table);

  selectable: boolean;
  viewChange$ = this.viewSubject$.asObservable();

  get view(): PeGridView {
    return this.viewSubject$.value;
  }

  set view(view: PeGridView) {
    this.viewSubject$.next(view);
  }

  constructor(private peGridService: PeGridService) {}

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
      this.peGridService.selectedItems = [...items];
    }
  }

  isSelected(item: PeGridItem): boolean {
    return this.peGridService.selectedItems.findIndex(selectedItem => selectedItem.id === item.id) !== -1;
  }

  isSelectedAll(): boolean {
    const items = this.peGridService.items;
    const selectedItem = this.peGridService.selectedItems;

    return items.length && items.length === selectedItem.length;
  }
}
