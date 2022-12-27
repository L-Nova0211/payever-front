import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeGridBaseColumnsService } from '../misc/services/base-columns.service';

export const MOBILE_ROW_HEIGHT = 91;
export const CHECKBOX_WIDTH = 42;

interface ColumnSizes {
  [key: number]: string; // key - column name
}

@Injectable({
  providedIn: 'root',
})
export class PeGridTableService extends PeGridBaseColumnsService {

  updateHeaderWidths$ = new Subject<any>();
  mobileRowHeight$ = new BehaviorSubject<number>(MOBILE_ROW_HEIGHT);

  showHeadInMobile = false;

  hasActionButton = false;
  hasPreviewButton = false;
  hasBadgeButton = false;
  isMobile = false;
  columnSizes: ColumnSizes = {};
  destroyed$ = new Subject<void>();

  constructor() {
    super();
    this.displayedColumns$.pipe(
      tap((columns) => {
        this.columnSizes = columns.reduce((acc, item, index) => {
          return {
            ...acc,
            [index]: item?.widthCellForMobile ?
              item?.widthCellForMobile :
              item?.widthCellForMobile$ ?
                `${item?.widthCellForMobile$.value}px` :
                '150px',
          };
        }, {});
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  destroy(): void {
    this.hasActionButton = false;
    this.hasPreviewButton = false;
    this.hasBadgeButton = false;
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
