import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { combineLatest, EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMap, take, takeWhile, tap } from 'rxjs/operators';


import { PebAbstractTextElement } from '@pe/builder-abstract';
import {
  isIntegrationAction,
  PebAction,
  PebEffect,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebIntegrationActionTag,
  PebIntegrationTag,
  PebInteractionType,
  PebPageType,
  PebPageVariant,
  PebThemeShortPageInterface,
} from '@pe/builder-core';
import { PebEditorElement, PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebActionResponse, PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';
import { PebTextStyles } from '@pe/builder-text-editor';

interface PebLinkApplications {
  type: string;
  applications: Array<{ title: string, id: string}>;
}

@Injectable()
export class PebLinkFormService {

  /** Temporary solution to keep last selected elements tracked after form destroyed */
  lastSelectedElements$ = new ReplaySubject<PebEditorElement[]>(1);

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  elements$ = this.selectedElements$.pipe(
    map((elements) => {
      return elements.reduce((acc, elm) => {
        if (elm.type === PebElementType.Grid) {
          if (!elm.data?.functionLink) {
            return [
              ...acc,
              ...elm.children.filter(({ type }) => [PebElementType.Text, PebElementType.Shape].includes(type)),
            ];
          }

          if (isIntegrationAction(elm.data.functionLink)) {
            const categories = elm.data.functionLink.tags.includes(PebIntegrationActionTag.GetCategoriesByProducts);
            const products = elm.data.functionLink.integration.tag === PebIntegrationTag.Products;

            if (categories || products) {
              return [...acc, elm];
            }
          }
        }

        if ([PebElementType.Text, PebElementType.Shape].includes(elm.type)) {
          return [...acc, elm];
        }

        return acc;
      }, []);
    }),
    map(elements => elements.map(elm => this.renderer.getElementComponent(elm.id))),
    filter(elements => elements.length > 0),
    tap(elements => this.lastSelectedElements$.next(elements)),
  );

  textStyle$ = this.elements$.pipe(
    switchMap(elements =>
      combineLatest(elements.reduce((acc: Array<Observable<any>>, el) => {
        const textStyle$ = (el.target as PebAbstractTextElement).textStyle$;
        if (textStyle$) {
          acc.push(textStyle$);
        }

        return acc;
      }, [])).pipe(
        map((value) => {
          const allLinks = value.reduce((acc, style) =>
            Array.isArray(style.link) ? [...acc, ...style.link] : [...acc, style.link], []);

          const links = allLinks.reduce((acc, link) => {
            if (!link && !acc.some(item => item === null)) {
              return [...acc, link];
            }

            if (link && !acc.find(v => v && link && (v.type === link.type && v.payload === link.payload))) {
              let payload = link.payload;
              try {
                payload = JSON.parse(unescape(link.payload));
              } catch (e) {}

              return [...acc, { ...link, payload }];
            }

            return acc;
          }, []);

          return links.length === 1 ? links[0] : links;
        }),
        /**
         * If there multiple elements selected we do not need to update text form,
         * just set initial value for a selected elements.
         * But if only single element selected, in edit mode text selection can be changed,
         * and need to update form value accordingly.
         */
        takeWhile(() => elements.length === 1, true),
      ),
    ),
    shareReplay(1),
  );

  routes$ = this.editorStore.snapshot$.pipe(
    filter(snapshot => !!snapshot),
    map((snapshot) => {
      const routing = snapshot.application?.routing || [];
      const pages = snapshot.pages.reduce((acc, page) => ({ ...acc, [page.id]: page }), {});
      const internal = routing.reduce((acc, route) => {
        const page: PebThemeShortPageInterface = pages[route?.pageId];
        if (page && page.type !== PebPageType.Master && page.variant !== PebPageVariant.Product) {
          acc.push({ name: route.url, value: route.routeId });
        }

        return acc;
      }, []);
      const overlay = routing.reduce(
        (acc, route) => {
          const page = pages[route.pageId];
          if (page) {
            acc.push({
              value: route.routeId,
              name: page.name,
            });
          }

          return acc;
        },
        [],
      );

      return {
        [PebInteractionType.NavigateInternal]: internal,
        [PebInteractionType.OverlayOpenPage]: overlay,
      };
    }),
  );

  private readonly applicationsSubject$ = new ReplaySubject<{ [appType: string]: any }>(1);
  readonly applications$: Observable<{ [appType: string]: any }> = this.applicationsSubject$.asObservable();

  constructor(
    private editorStore: PebEditorStore,
    private renderer: PebEditorRenderer,
  ) {
  }

  init(): void {
    this.editorStore.getBusinessApps().pipe(
      take(1),
      catchError(() => of([])),
      tap(applications => this.applicationsSubject$.next(applications)),
    ).subscribe();
  }

  setTextStyles(styles: Partial<PebTextStyles>, commitAction = false): Observable<PebActionResponse> {
    return this.lastSelectedElements$.pipe(
      map((elements) => {
        let effects: PebEffect[] = [];

        elements.forEach((elm) => {
          const target = elm.target as PebAbstractTextElement;
          target.setTextStyle(styles);

          if (styles.verticalAlign) {
            elm.detectChanges();
          }

          if (commitAction) {
            effects = [...effects, ...target.effects];
          }
        });

        return effects;
      }),
      switchMap((effects) => {
        if (effects.length) {
          const action: PebAction = {
            effects,
            id: pebGenerateId('action'),
            targetPageId: this.editorStore.page.id,
            affectedPageIds: [this.editorStore.page.id],
            createdAt: new Date(),
          };

          return this.editorStore.commitAction(action);
        }

        return EMPTY;
      }),
    );
  }
}
