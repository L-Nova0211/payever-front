import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable()
export abstract class AbstractService implements OnDestroy {
  protected destroyed$ = new ReplaySubject<boolean>();

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
