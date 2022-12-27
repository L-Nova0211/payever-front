import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { StateKey, TransferState } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';

@Injectable()
export class PebClientCachedService {

  constructor(
    @Optional() private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {}

  getCachedObservable(source$: Observable<any>, key: StateKey<any>) {
    if (isPlatformServer(this.platformId) && this.transferState) {
      return source$.pipe(
        map(data => {
          this.transferState.set(key, data);

          return data;
        }),
        take(1),
      );
    } else if (isPlatformBrowser(this.platformId) && this.transferState) {
      const value = this.transferState.get(key, null);
      const observable = value
        ? source$.pipe(startWith(value), take(1))
        : source$;

      return observable;
    }
  }

}
