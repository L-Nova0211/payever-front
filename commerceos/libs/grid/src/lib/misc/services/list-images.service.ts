import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { switchMap, tap, takeUntil } from 'rxjs/operators';

import { GRID_LIST_ITEMS_TYPES } from '../../constants';
import { PeGridView } from '../enums';

@Injectable({ providedIn: 'root' })
export class PeListImagesService {
  imagesLoad: BehaviorSubject<boolean>[] = [];
  addNewImageLoader$ = new BehaviorSubject<boolean>(true);
  allImagesLoad$ = new BehaviorSubject<boolean>(true);
  view: PeGridView;

  initListener(destroy$: Subject<any>) {
    if (!GRID_LIST_ITEMS_TYPES.includes(this.view)) {
      this.allImagesLoad$.next(false);

      return;
    }

    this.addNewImageLoader$.pipe(
      switchMap(() => {
        return combineLatest(this.imagesLoad).pipe(
          tap((imagesLoad) => {
            if (imagesLoad.every(load => !load)) {
              this.allImagesLoad$.next(false);
            }
          }),
        );
      }),
      takeUntil(destroy$)
    ).subscribe();

  }
}
