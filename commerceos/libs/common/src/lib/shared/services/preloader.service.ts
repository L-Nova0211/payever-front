import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { StartLoading, StopLoading } from '../../states/preloader';
import { AppType } from '../tokens';

@Injectable()
export class PePreloaderService {
  readonly changeState$ = new BehaviorSubject<boolean>(false);

  constructor(private store: Store) { }

  public startLoading(appType: AppType): void {
    this.store.dispatch(new StartLoading(appType));
    this.changeState$.next(true);
  }

  public stopLoading(appType: AppType): void {
    this.store.dispatch(new StopLoading(appType));
    this.changeState$.next(false);
  }

  public initFinishObservers(observers: BehaviorSubject<boolean>[], appType: AppType): void {
    combineLatest(observers)
      .pipe(
        tap((values: boolean[]) => {
          values.every(value => value === false) && this.stopLoading(appType);
        }),
        catchError((err) => {
          this.stopLoading(appType);

          return of(err)
        })
      ).subscribe();
  }
}
