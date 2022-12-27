import { Directive, OnDestroy } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { PlatformEventInterface } from '../misc/interfaces/platform-event.interface';

import { AbstractService } from './abstract.service';

@Directive()
export abstract class PlatformAbstractService extends AbstractService implements OnDestroy {

  protected abstract readonly eventName: string;

  private destroyed$: Subject<void> = new Subject();
  private cachedObserve$: Observable<PlatformEventInterface> = null;

  constructor() {
    super();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get observe$(): Observable<PlatformEventInterface> {
    if (!this.cachedObserve$) {
      const messageRegex = /^pe:os:(.*?):(.*?)(?::(.*))?$/;

      this.cachedObserve$ = fromEvent(window, this.eventName).pipe(
        takeUntil(this.destroyed$),
        filter((event: CustomEvent) => typeof event.detail === 'string' && messageRegex.test(event.detail)),
        map((event: CustomEvent): PlatformEventInterface => {
          const match: string[] = messageRegex.exec(event.detail);
          const target: string = match[1];
          const action: string = match[2];
          const dataString: string = match[3];
          let data: any;

          if (dataString) {
            try {
              data = JSON.parse(dataString);
            } catch (e) {
              data = dataString;
            }
          }

          return { target, action, data };
        })
      );
    }

    return this.cachedObserve$;
  }

  dispatchEvent(event: PlatformEventInterface, origin: string = window.location.origin): void {
    let messageString = `pe:os:${event.target}:${event.action}`;

    if (event.data) {
      if (typeof event.data === 'string') {
        messageString += `:${event.data}`;
      } else {
        messageString += `:${JSON.stringify(event.data)}`;
      }
    }

    const backgroundEvent: Event = new CustomEvent(this.eventName, {
      detail: messageString,
    });
    window.dispatchEvent(backgroundEvent);
  }

}
