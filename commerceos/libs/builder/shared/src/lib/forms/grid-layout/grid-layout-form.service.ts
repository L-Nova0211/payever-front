import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { isContextGrid, PebControlsService } from '@pe/builder-controls';
import {
  PebAction,
  PebContextSchemaEffect,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  pebGenerateId,
  PebLanguage,
  PebScreen,
  PebStylesheetEffect,
  PebTemplateEffect,
  PebThemePageInterface,
} from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';


@Injectable()
export class PebGridLayoutFormService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  constructor(
    private controlsService: PebControlsService,
    private editorAccessorService: PebEditorAccessorService,
    private editorStore: PebEditorStore,
    private tree: PebRTree<PebAbstractElement>,
  ) {
  }

  setGridLayout(value: { colCount?: number, rowCount?: number }) {
    const page = this.editorStore.page;

    return this.selectedElements$.pipe(
      filter(elements => elements.length === 1 && elements[0].type === PebElementType.Grid),
      withLatestFrom(this.screen$),
      map(([elements, screen]) => {
        const effects: PebEffect[] = [];

        elements.forEach((elementDef) => {
          const element = this.tree.find(elementDef.id);
          const createdElements = [];

          const { colCount, rowCount } = element.data;
          const { gridTemplateColumns, gridTemplateRows, height, width } = element.styles;

          const contextSchemaPayload = { [elementDef.id]: {} };
          const stylesheetPayload = { [elementDef.id]: {} as PebElementStyles };

          if (value.colCount) {
            const colDiff = value.colCount - colCount;

            const prevCellCount = colCount * rowCount;
            const currCellCount = value.colCount * rowCount;

            if (!isContextGrid(element) && colDiff > 0) {
              const { contextSchemas, stylesheets, appendEffects, cmpRefs } =
                this.generateAppendEffects(currCellCount - prevCellCount, prevCellCount, screen, element, page);

              Object.entries(contextSchemas).forEach(([key, value]) => contextSchemaPayload[key] = value);
              Object.entries(stylesheets).forEach(([key, value]) => stylesheetPayload[key] = value);

              effects.push(...appendEffects);
              createdElements.push(...cmpRefs);
            }

            if (!isContextGrid(element) && colDiff < 0) {
              effects.push(...this.generateDeleteEffects(prevCellCount - currCellCount, element, page));
            }

            const result = this.calculate(colDiff, gridTemplateColumns, width);

            element.styles.gridTemplateColumns = result.array;
            stylesheetPayload[elementDef.id].gridTemplateColumns = result.array;

            if (result.value) {
              element.styles.width = result.value;
              stylesheetPayload[elementDef.id].width = result.value;
            }
          }

          if (value.rowCount) {
            const rowDiff = value.rowCount - rowCount;

            const prevCellCount = rowCount * colCount;
            const currCellCount = value.rowCount * colCount;

            if (!isContextGrid(element) && rowDiff > 0) {
              const { contextSchemas, stylesheets, appendEffects, cmpRefs } =
                this.generateAppendEffects(currCellCount - prevCellCount, prevCellCount, screen, element, page);

              Object.entries(contextSchemas).forEach(([key, value]) => contextSchemaPayload[key] = value);
              Object.entries(stylesheets).forEach(([key, value]) => stylesheetPayload[key] = value);

              effects.push(...appendEffects);
              createdElements.push(...cmpRefs);
            }

            if (!isContextGrid(element) && rowDiff < 0) {
              effects.push(...this.generateDeleteEffects(prevCellCount - currCellCount, element, page));
            }

            const result = this.calculate(rowDiff, gridTemplateRows, height);

            element.styles.gridTemplateRows = result.array;
            stylesheetPayload[elementDef.id].gridTemplateRows = result.array;

            if (result.value) {
              element.styles.height = result.value;
              stylesheetPayload[elementDef.id].height = result.value;
            }
          }

          effects.push({
            type: PebTemplateEffect.PatchElement,
            target: `${PebEffectTarget.Templates}:${page.templateId}`,
            payload: { id: elementDef.id, data: value },
          });

          const contextSchema = page.context[elementDef.id];
          const paramIndex = page.context[elementDef.id]?.params?.findIndex(param => param.limit);

          if (paramIndex && paramIndex !== -1) {
            contextSchema.params[paramIndex].limit = (value.rowCount ?? rowCount) * (value.colCount ?? colCount);
            contextSchemaPayload[elementDef.id] = contextSchema;

            const contextSchemaIndex = effects.findIndex(effect => effect.type === PebContextSchemaEffect.Update);

            if (contextSchemaIndex === -1) {
              const contextSchemaEffect = {
                type: PebContextSchemaEffect.Update,
                target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
                payload: contextSchemaPayload,
              }

              effects.push(contextSchemaEffect);
            } else {
              effects[contextSchemaIndex].payload = { ...effects[contextSchemaIndex].payload, ...contextSchemaPayload }
            }
          }

          const stylesheetIndex = effects.findIndex(effect => effect.type === PebStylesheetEffect.Update);

          if (stylesheetIndex === -1) {
            const stylesheetEffect = {
              payload: stylesheetPayload,
              type: PebStylesheetEffect.Update,
              target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
            };

            effects.push(stylesheetEffect);
          } else {
            effects[stylesheetIndex].payload = { ...effects[stylesheetIndex].payload, ...stylesheetPayload };
          }

          element.data = { ...element.data, ...value };

          createdElements.forEach(createdElement => {
            createdElement.instance.viewRef = createdElement.hostView;
            this.tree.insert(createdElement.instance);

            element.children.push(createdElement.instance);
            element.element.children.push(createdElement.instance.element);
            element.childrenSlot.insert(createdElement.hostView);
          });

          this.controlsService.renderControls([this.controlsService.createGridControl(element)]);
        });

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
      })
    )
  }

  calculate(diff: number, prevValues: number[], total: number) {
    const result: { array: number[], value?: number } = { array: [] };

    const max = 10;

    const values = [...prevValues];

    if (diff > 0) {
      Array.from({ length: diff }).forEach(() => values.push(values[values.length - 1]));

      const sum = values.reduce((a, b) => a + b, 0);

      result.array = values.map(value => {
        value = total * (value / sum);

        return value > max ? value : max;
      });

      const limited = values.filter(value => value === max).reduce((a, b) => a + b, 0);

      if (limited) {
        const unlimited = values.filter(value => value > max).reduce((a, b) => a + b, 0);

        result.array = values.map(value => {
          if (value > max) {
            value = (total - limited) * value / unlimited;
          }

          return value;
        });
      }

      if (limited > total) {
        result.value = limited;
      }
    }

    if (diff < 0) {
      const sliced = values.slice(0, diff);
      const sum = sliced.reduce((a, b) => a + b, 0);

      result.array = sliced.map(c => total * (c / sum));
    }

    return result;
  }

  private generateAppendEffects(
    length: number,
    prevCellCount: number,
    screen: PebScreen,
    parent: PebAbstractElement,
    page: PebThemePageInterface
  ) {
    const generateCell = (screen: PebScreen, index: number, parentDef: PebElementDef) => {
      return {
        id: pebGenerateId(),
        type: PebElementType.Shape,
        data: {
          text: {
            [screen]: {
              [PebLanguage.Generic]: {
                ops: [
                  { insert: '', attributes: { align: '' } },
                  { insert: '\n', attributes: { align: 'center' } },
                ],
              },
            },
          },
        },
        children: [],
        meta: {
          deletable: false,
          still: true,
        },
        index: index,
        parent: {
          id: parentDef.id,
          slot: 'host',
          type: parentDef.type,
        },
        styles: { backgroundColor: '#00a2ff' },
      };
    };

    const contextSchemas = {};
    const stylesheets = {};
    const appendEffects = [];
    const cmpRefs = [];

    Array.from({ length }).forEach((_, i) => {
      const parentDef = parent.element;
      const elementDef = generateCell(screen, prevCellCount + i, parentDef);

      const renderer = this.editorAccessorService.renderer;
      const elViewInjector = renderer.createElementInjector();
      const createdElement = renderer.createElement(elementDef, elViewInjector);

      cmpRefs.push(createdElement);

      contextSchemas[elementDef.id] = {};
      stylesheets[elementDef.id] = { backgroundColor: '#00a2ff' };

      appendEffects.push({
        type: PebTemplateEffect.AppendElement,
        target: `${PebEffectTarget.Templates}:${page.templateId}`,
        payload: { element: elementDef, to: parentDef.id },
      });
    })

    return { contextSchemas, stylesheets, appendEffects, cmpRefs };
  }

  private generateDeleteEffects(length: number, element: PebAbstractElement, page: PebThemePageInterface) {
    const effects = [];

    Array.from({ length }).forEach(() => {
      const id = element.children[element.children.length - 1].element.id;

      effects.push({
        type: PebTemplateEffect.DeleteElement,
        target: `${PebEffectTarget.Templates}:${page.templateId}`,
        payload: id,
      });

      Object.values(PebScreen).forEach((pebScreen) => {
        effects.push({
          type: PebStylesheetEffect.Delete,
          target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[pebScreen]}`,
          payload: id,
        });
      })

      effects.push({
        type: PebContextSchemaEffect.Delete,
        target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
        payload: id,
      });

      const item = this.tree.find(id);

      element.children = element.children.filter(c => c.element.id !== id);
      element.element = {
        ...element.element,
        children: element.element.children.filter(c => c.id !== id),
      };

      this.tree.remove(item);

      item.getRendererComponentRegistry(id).destroy();
    })

    return effects;
  }
}
