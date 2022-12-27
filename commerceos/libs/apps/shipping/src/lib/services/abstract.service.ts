import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class AbstractService implements OnDestroy {
  protected ngUnsubscribe: Subject<any> = new Subject<any>();

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
