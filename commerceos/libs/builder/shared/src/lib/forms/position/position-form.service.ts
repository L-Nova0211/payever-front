import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { PebElementsService } from '@pe/builder-controls';
import {
  PebAction,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebScreen,
  pebScreenContentWidthList,
  pebScreenDocumentWidthList,
  PebStylesheetEffect,
} from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';
import { SnackbarService } from '@pe/snackbar';


@Injectable()
export class PebPositionFormService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  constructor(
    private editorStore: PebEditorStore,
    private elementsService: PebElementsService,
    private snackbarService: SnackbarService,
    private tree: PebRTree<PebAbstractElement>,
  ) {
  }

  setPosition(value) {
    const page = this.editorStore.page;

    return this.selectedElements$.pipe(
      withLatestFrom(this.screen$),
      map(([elements, screen]) => {
        let effect: PebEffect;

        // if (this.elementsService.move(value)) { // TODO: replace after it works through the elementsService
        if (!this.intersected(value, elements, screen)) {
          effect = {
            type: PebStylesheetEffect.Update,
            target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
            payload: {},
          };

          elements.forEach((element) => {
            const { left, top } = this.tree.find(element.id).styles;

            effect.payload[element.id] = { left, top };
          });
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

          // this.controlsService.redraw();

          this.editorStore.commitAction(action);

          return of(true);
        }

        this.snackbarService.toggle(true, {
          content: 'Invalid position',
          duration: 2000,
          iconId: 'icon-commerceos-error',
        });

        return of(false);
      }),
    );
  }

  // TODO: temporary solution
  intersected(value, elementDefs, screen) {
    const positions = {};

    elementDefs.forEach((elementDef) => {
      const element = this.tree.find(elementDef.id);

      positions[elementDef.id] = {
        left: element.styles.left,
        top: element.styles.top,
      };

      const parent = this.tree.find(elementDef.parent.id);
      const parentBBox = this.tree.toBBox(parent);

      element.styles.top = value.y - parentBBox.minY;
      element.styles.left = value.x - parentBBox.minX;
    })

    let beyond = false;
    let intersect = false;

    elementDefs.forEach((elementDef) => {
      const element = this.tree.toBBox(this.tree.find(elementDef.id));
      const parent = this.tree.toBBox(this.tree.find(elementDef.parent.id));

      if (elementDef.parent.type === PebElementType.Section && screen === PebScreen.Desktop) {
        const padding = (pebScreenDocumentWidthList[screen] - pebScreenContentWidthList[screen]) / 2;

        parent.minX = parent.minX + padding;
        parent.maxX = parent.maxX - padding;
      }

      const beyonded = element.minX < parent.minX
        || element.maxX > parent.maxX
        || element.minY < parent.minY
        || element.maxY > parent.maxY;

      const siblings = [];

      this.tree.elements.forEach((abstractElement) => {
        if (elementDef.id !== abstractElement.element.id
          && abstractElement.parent?.element.id === elementDef.parent.id) {
          siblings.push(abstractElement);
        }
      });

      const intersected = siblings.some((editorElement) => {
        const sibling = this.tree.toBBox(this.tree.find(editorElement.element.id));

        return sibling.maxY > element.minY
          && sibling.maxX > element.minX
          && sibling.minY < element.maxY
          && sibling.minX < element.maxX;
      });

      beyond = !beyond && beyonded ? beyonded : beyond;
      intersect = !intersect && intersected ? intersected : intersect;
    });

    if (beyond || intersect) {
      elementDefs.forEach((elementDef) => {
        const initial = positions[elementDef.id];
        const element = this.tree.find(elementDef.id);

        element.styles.left = initial.left;
        element.styles.top = initial.top;
      })
    }

    return beyond || intersect;
  }
}
