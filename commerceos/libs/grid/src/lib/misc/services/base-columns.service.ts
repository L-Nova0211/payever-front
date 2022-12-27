import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { PeGridItem, PeGridItemColumn, PeGridTableDisplayedColumns } from '../interfaces';

@Injectable()

export class PeGridBaseColumnsService {
  firstRow: PeGridItem = null;
  lastRow: PeGridItem = null;
  transformColumns: {
    [id: string]: {
      [name: string]: PeGridItemColumn
    }
  } = {};

  private columnsSubject$ = new BehaviorSubject<PeGridTableDisplayedColumns[]>([]);

  set columns(columns: PeGridTableDisplayedColumns[]) {
    this.columnsSubject$.next(columns);
  }

  get columns(): PeGridTableDisplayedColumns[] {
    return this.columnsSubject$.value;
  }

  get displayedColumns$(): Observable<PeGridTableDisplayedColumns[]> {
    return this.columnsSubject$.pipe(
      flatMap(columns => {
        if (columns.every(c => !c?.selected$)) {
          return of(columns);
        }

        return combineLatest(columns.filter(c => c?.selected$).map(c => c.selected$));
      }),
      map(() => {
        return this.columns.filter(c => c?.selected$ ? c.selected$.value : true);
      }),
    );
  }

  transformByNameColumns(item: PeGridItem) {
    if (this.transformColumns[item.id]) {
      return;
    }

    this.transformColumns = {
      ...this.transformColumns,
      [item.id]: item.columns.reduce((acc, column: PeGridItemColumn) => ({
        ...acc,
        [column.name]: column,
      }), {}),
    };
  }

}
