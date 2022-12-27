import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PeDragDropService {
  dragItem = null;
  dropItem = null;
  dragDropStart$ = new BehaviorSubject<any>(null);
  dragDropChange$ = new BehaviorSubject<{dragItem: any, dropItem: any}>(null);

  setDragItem(item: any): void {
    this.dragItem = item;
    if (item) { this.dragDropStart$.next(item); }
  }

  setDropItem(item: any): void {
    this.dropItem = item;
    if (item) { this.dragDropChange$.next({ dragItem: this.dragItem, dropItem: this.dropItem }); }
  }
}
