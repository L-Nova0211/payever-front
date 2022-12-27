import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { map, shareReplay, switchMap, takeWhile } from 'rxjs/operators';

import { PebAbstractTextElement } from '@pe/builder-abstract';
import {
  isIntegrationAction,
  PebAction,
  PebEditorState,
  PebEffect,
  PebElementDef,
  pebGenerateId,
  PebIntegrationActionTag,
} from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebActionResponse, PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';
import { PebTextSelectionStyles, PebTextStyles, PEB_DEFAULT_TEXT_STYLE } from '@pe/builder-text-editor';



@Injectable()
export class PebTextFormService {

  @Select(PebElementSelectionState.textElements) selectedElements$!: Observable<PebElementDef[]>;

  elements$ = this.selectedElements$.pipe(
    map(elements => elements.map(elm => this.renderer.getElementComponent(elm.id))),
  );

  constructor(
    private state: PebEditorState,
    private editorStore: PebEditorStore,
    private renderer: PebEditorRenderer,
  ) {
  }

  textStyle$ = this.elements$.pipe(
    switchMap(elements =>
      combineLatest(elements.map(({ target }) => (target as PebAbstractTextElement).textStyle$)).pipe(
        map((value) => {
          const styles = {} as Partial<PebTextSelectionStyles>;

          value.forEach((s) => {
            Object.entries(s).forEach(([key, val]) => {
              if (styles[key] !== undefined) {
                const styleValue = Array.isArray(styles[key]) ? styles[key] : [styles[key]];
                const valueValue = Array.isArray(val) ? val : [val];
                const set = [...new Set([...styleValue, ...valueValue])];
                styles[key] = set.length === 1 ? set[0] : set;
              } else {
                styles[key] = val;
              }
            });
          });

          return styles;
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
    map(value => ({ ...PEB_DEFAULT_TEXT_STYLE, ...value })),
    shareReplay(1),
  );

  setTextStyles(styles: Partial<PebTextStyles>, commitAction = false): Observable<PebActionResponse> {

    return this.elements$.pipe(
      map((elements) => {
        let effects: PebEffect[] = [];

        elements.forEach((elm) => {
          (elm.target as PebAbstractTextElement).setTextStyle(styles);
          if (isIntegrationAction(elm.target.element.data.functionLink)
            && elm.target.element.data.functionLink.tags.includes(PebIntegrationActionTag.GetCategoriesByProducts)
          ) {
            elm.target.cdr.detectChanges();
          }

          if (styles.verticalAlign) {
            elm.styles = {
              ...elm.styles,
              ...(styles.verticalAlign ? { verticalAlign: styles.verticalAlign } : undefined),
            };

            elm.detectChanges();
          }

          if (commitAction) {
            effects = [...effects, ...(elm.target as any).effects];
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
