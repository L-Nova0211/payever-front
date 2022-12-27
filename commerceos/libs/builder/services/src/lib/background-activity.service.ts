import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

@Injectable()
export class BackgroundActivityService {

  private readonly activeRequestCount$ = new BehaviorSubject<number>(0);
  private get activeRequestCount() {
    return this.activeRequestCount$.getValue();
  }

  readonly hasActiveTasks$ = this.activeRequestCount$.pipe(
    map(val => val > 0),
    distinctUntilChanged(),
    shareReplay(1),
  );

  addTask(): void {
    this.activeRequestCount$.next(this.activeRequestCount + 1);
  }

  removeTask(): void {
    const value = this.activeRequestCount - 1;
    if (value < 0) {
      throw new Error('Background activity task counter is negative');
    }
    this.activeRequestCount$.next(value);
  }
}
