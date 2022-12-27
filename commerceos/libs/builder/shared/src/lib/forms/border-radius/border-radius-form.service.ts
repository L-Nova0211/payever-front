import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { EMPTY, Observable, combineLatest } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import {
  PebAction, PebEffect,
  PebEffectTarget,
  PebElementDef,
  pebGenerateId,
  PebScreen,
  PebStylesheetEffect,
} from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebActionResponse, PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';

@Injectable()
export class PebBorderRadiusFormService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  elements$ = this.selectedElements$.pipe(
    map(elements => elements.map(({ id }) => this.tree.find(id))),
  )

  constructor(
    private editorStore: PebEditorStore,
    private tree: PebRTree<PebAbstractElement>,
  ) {
  }

  style$ = this.elements$.pipe(
    switchMap(elements => combineLatest(elements.map((el) => el.style$)).pipe(map(() => elements))),
    map(elements => {
      const styles = elements.map(({ styles }) => styles);

      const radiuses = styles.map(style => Number(style.borderRadius));
      const maxValues = styles.map(style => {
        const { height, width } = style;

        return height > width ? width / 2 : height / 2;
      })

      return {
        borderRadius: Math.min(...radiuses),
        max: Math.min(...maxValues),
      }
    })
  )

  setBorderRadius(value, commitAction = false): Observable<PebActionResponse> {
    const page = this.editorStore.page;

    return this.elements$.pipe(
      tap((elements) => {
        elements.forEach(element => element.styles.borderRadius = value)
      }),
      withLatestFrom(this.screen$),
      map(([elements, screen]) => {
        let effect: PebEffect;

        if (commitAction) {
          effect = {
            type: PebStylesheetEffect.Update,
            target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
            payload: {},
          }

          elements.forEach((element) => {
            effect.payload[element.element.id] = { borderRadius: value };
          })
        }

        return effect;
      }),
      switchMap((effect) => {
        if (effect) {
          const action: PebAction = {
            effects: [effect],
            id: pebGenerateId('action'),
            targetPageId: page.id,
            affectedPageIds: [page.id],
            createdAt: new Date(),
          };

          return this.editorStore.commitAction(action);
        }

        return EMPTY;
      }),
    )
  }

}
