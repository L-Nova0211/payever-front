import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import {
  PebControlAnchorType,
  PebControlColor,
  PebControlsService,
  PebResizeService,
  PebSelectionBBox,
  PebSelectionBBoxState,
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


@Injectable({ providedIn: 'any' })
export class PebSectionFormService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;

  constructor(
    private readonly resizeService: PebResizeService,
    private readonly controlsService: PebControlsService,
    private readonly editorStore: PebEditorStore,
    private readonly renderer: PebEditorRenderer,
    private readonly tree: PebRTree<PebAbstractElement>,
    private snackbarService: SnackbarService,
  ) {
  }

  setSection(value): Observable<boolean> {

    const page = this.editorStore.page;

    return this.selectedElements$.pipe(
      filter(elements => elements.length === 1 && elements[0].type === PebElementType.Section),
      withLatestFrom(this.screen$, this.selection$, this.selectedElements$),
      map(([[elementDef], screen, selection, elements]) => {
        const effects: PebEffect[] = [];

        const element = this.tree.find(elementDef.id);

        let templatePayload;
        let stylesheetPayload;

        Object.entries(value).forEach(([key, val]) => {
          if (key === 'default') {
            templatePayload = { meta: { deletable: !val } };

            element.element = { ...element.element, meta: { ...element.element.meta, deletable: !val } };
          }

          if (['name', 'fullWidth'].includes(key)) {
            templatePayload = { data: { [key]: val } };

            element.data[key] = val;
          }

          if (['height', 'sticky'].includes(key)) {
            if (key === 'height' ) {
              let deltaY = Number(val) - Math.round(element.styles.height);
              if (deltaY < 0) { // can intersect children only on size reduce action
                const isIntersected = this.resizeService.isSectionIntersectedWithChildren(deltaY, elements[0].id)

                if (isIntersected) {
                  this.snackbarService.toggle(true, {
                    content: 'Invalid dimension',
                    duration: 2000,
                    iconId: 'icon-commerceos-error',
                  });

                  return;
                }
              }
            }

            stylesheetPayload = key === 'sticky'
              ? { position: val ? 'sticky' : 'relative', top: val ? 0 : null }
              : { [key]: val };
            element.styles = { ...element.styles, ...stylesheetPayload };
          }
        });

        if (templatePayload) {
          effects.push({
            type: PebTemplateEffect.PatchElement,
            target: `${PebEffectTarget.Templates}:${page.templateId}`,
            payload: { id: elementDef.id, ...templatePayload },
          })
        }

        if (stylesheetPayload) {
          effects.push({
            payload: { [elementDef.id]: stylesheetPayload },
            type: PebStylesheetEffect.Update,
            target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
          })
        }

        this.tree.insert(element);

        this.controlsService.renderControls([{
          anchorType: PebControlAnchorType.Section,
          color: PebControlColor.Default,
          ...this.tree.toBBox(element),
          label: element.element.data?.name ?? 'Section',
        }]);

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

        return of(false);
      }),
    );
  }

  changePosition(direction: number) {
    return this.selectedElements$.pipe(
      filter(elements => elements.length === 1 && elements[0].type === PebElementType.Section),
      map(([elementDef]) => {
        const element = this.tree.find(elementDef.id);
        const parent = element.parent;
        const index = Math.min(Math.max(element.element.index + direction, 0), parent.children.length - 1);

        return { element, parent, index };
      }),
      distinctUntilChanged((a, b) => a.index === b.index),
      switchMap(({ element, parent, index }) => {
        const page = this.editorStore.page;
        const effects = [];

        const indexes = [element.element.index, index];

        indexes.forEach((i, j) => {
          const section = parent.children[i];

          if (section) {
            const index = indexes[(indexes.length - 1) - j];

            section.element = { ...section.element, index };
            section.styles.order = index;

            effects.push({
              type: PebTemplateEffect.PatchElement,
              target: `${PebEffectTarget.Templates}:${page.templateId}`,
              payload: { id: section.element.id, index },
            });
          }
        });

        parent.children.sort((a, b) => a.element.index - b.element.index);

        this.tree.insert(parent.children[index]);

        this.controlsService.renderControls([{
          anchorType: PebControlAnchorType.Section,
          color: PebControlColor.Default,
          ...this.tree.toBBox(parent.children[index]),
          label: parent.children[index].element.data?.name ?? 'Section',
        }]);

        const action = {
          id: pebGenerateId('action'),
          createdAt: new Date(),
          targetPageId: page.id,
          affectedPageIds: [page.id],
          effects: effects,
        };

        return this.editorStore.commitAction(action);
      }),
    )
  }
}
