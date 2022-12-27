import { Injectable, OnDestroy } from '@angular/core';
import { isEqual } from 'lodash';
import { combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { PageSnapshot } from '@pe/builder-abstract';
import { PebScreen, PebThemeDetailInterface, PebThemePageInterface } from '@pe/builder-core';
import { ContextBuilder } from '@pe/builder-services';


@Injectable()
export class PebEditorUtilsService implements OnDestroy {

  private readonly destroyedSubject$ = new Subject();
  readonly destroyed$ = this.destroyedSubject$.asObservable();

  constructor(
    private contextManager: ContextBuilder,
  ) {}

  ngOnDestroy() {
    this.destroyedSubject$.next(true);
    this.destroyedSubject$.complete();
  }

  constructPageSnapshot(
    snapshot$: Observable<PebThemeDetailInterface>,
    page$: Observable<PebThemePageInterface>,
    screen$: Observable<PebScreen>,
  ): Observable<PageSnapshot> {
    return combineLatest([
      snapshot$.pipe(filter(s => !!s)),
      page$.pipe(filter(p => !!p)),
      screen$,
    ]).pipe(
      map((result: [PebThemeDetailInterface, PebThemePageInterface, PebScreen]) => {
        const [snapshot, page, screen] = result;

        return {
          id: page.id,
          name: page.name,
          variant: page.variant,
          type: page.type,
          data: page.data,
          template: page.template,
          stylesheet: page.stylesheets[screen],
          contextSchema: {
            ...page.context,
            // Add global shop context
            ...snapshot.application.context,
          },
        };
      }),
      distinctUntilChanged(isEqual),
      switchMap((snapshot) => {
        return snapshot
          ? this.contextManager.buildSchema(snapshot.contextSchema).pipe(
            map(context => ({
              ...snapshot,
              context,
            })),
          )
          : EMPTY;
      }),
      map(v => v as PageSnapshot),
    );
  }
}
