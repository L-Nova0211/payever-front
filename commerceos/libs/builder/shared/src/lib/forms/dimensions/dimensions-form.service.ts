import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import {
  PebControlsService,
  PebElementsService,
  PebSelectionBBox,
  PebSelectionBBoxState,
  PebResizeService,
  findTotalArea,
  PebRadiusService,
} from '@pe/builder-controls';
import {
  PebAction,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebScreen,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';
import { SnackbarService } from '@pe/snackbar';

@Injectable()
export class PebDimensionsFormService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;

  constructor(
    private controlsService: PebControlsService,
    private radiusService: PebRadiusService,
    private editorStore: PebEditorStore,
    private elementsService: PebElementsService,
    private renderer: PebEditorRenderer,
    private snackbarService: SnackbarService,
    private tree: PebRTree<PebAbstractElement>,
    private readonly resizeService: PebResizeService,
  ) {
  }

  setDimensions(dirty, value) {
    const page = this.editorStore.page;

    return this.selectedElements$.pipe(
      withLatestFrom(this.screen$, this.selection$ ),
      map(([elements, screen, selection]) => {
        const effects: PebEffect[] = [];

        const bboxOfElements = findTotalArea(
          elements.map(elem => this.tree.find(elem.id)).map(elm => this.tree.toBBox(elm))
        );
        const width = bboxOfElements.maxX - bboxOfElements.minX;
        const height = bboxOfElements.maxY - bboxOfElements.minY;

        let canBeResized = true;
        if (dirty.height) {
          canBeResized = !this.resizeService.intersected(0, value.height - height, elements, screen);
        } else if (dirty.width) {
          canBeResized = !this.resizeService.intersected(value.width - width, 0, elements, screen);
        }

        if (canBeResized) {
          elements.forEach((elementDef) => {
            const element = this.tree.find(elementDef.id);
            if (element.element.type === PebElementType.Text) {
              // stop auto resize for text for affected axis
              if (dirty.height) {
                element.data.textAutosize = { ...element.data.textAutosize, height: false };
                element.element = {
                  ...element.element,
                  data: { ...element.data },
                };
              }
              if (dirty.width) {
                element.data.textAutosize = { ...element.data.textAutosize, width: false };
                element.element = {
                  ...element.element,
                  data: { ...element.data },
                };
              }
            }

            element.styles.height = value.height;
            element.styles.width = value.width;

            const templateEffect = {
              type: PebTemplateEffect.PatchElement,
              target: `${PebEffectTarget.Templates}:${page.templateId}`,
              payload: { id: elementDef.id, data: {} },
            };

            if (dirty.height || dirty.width) {
              const { left, top, height, width } = element.styles;
              const payload = { [elementDef.id]: { left, top, height, width } };

              const index = effects.findIndex(effect => effect.type === PebStylesheetEffect.Update);

              if (index === -1) {
                const stylesheetEffect = {
                  payload,
                  type: PebStylesheetEffect.Update,
                  target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
                };

                effects.push(stylesheetEffect);
              } else {
                effects[index].payload = { ...effects[index].payload, ...payload };
              }

              if (element?.data?.textAutosize) {
                templateEffect.payload.data = { textAutosize: element.data.textAutosize };

                effects.push(templateEffect);
              }
            }

            if (dirty.constrainProportions) {
              templateEffect.payload.data = { constrainProportions: value.constrainProportions };

              effects.push(templateEffect);

              element.data.constrainProportions = value.constrainProportions;
            }
            this.tree.insert(element);
          });
          const abstractElements = elements.map(element => this.tree.find(element.id));
          const controls = this.controlsService.createDefaultControlsSet(abstractElements);
          this.controlsService.renderControls(controls);
          this.radiusService.renderRadius(controls);
        }

        return effects;
      }),
      switchMap((effects) => {
        if (effects.length) {
          const action: PebAction = {
            effects,
            id: pebGenerateId('action'),
            targetPageId: page.id,
            affectedPageIds: [page.id],
            createdAt: new Date(),
          };

          this.editorStore.commitAction(action);

          return of(true);
        }

        this.snackbarService.toggle(true, {
          content: 'Invalid dimension',
          duration: 2000,
          iconId: 'icon-commerceos-error',
        });

        return of(false);
      }),
    );
  }

}
