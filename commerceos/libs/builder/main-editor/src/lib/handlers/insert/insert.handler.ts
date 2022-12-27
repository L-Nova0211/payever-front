import { ComponentRef, Injectable, Injector, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import {
  PebControlAnchorType,
  PebControlColor,
  PebControlCommon,
  PebControlsService,
  PebRadiusService,
  PebSetSelectionBBoxAction,
} from '@pe/builder-controls';
import {
  PebAction,
  PebContextSchemaEffect,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebScreen,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '@pe/builder-core';
import {
  PebAbstractElement,
  PebEditorOptionsState,
  PebRenderer,
  PebRendererElementDef,
  PebRTree,
} from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore, PebEditorThemeService } from '@pe/builder-services';
import { PebElementSelectionState, PebSelectAction } from '@pe/builder-state';

import { PebInsertAction } from '../../actions';
import { findAvailablePosition } from '../../services';


@Injectable()
export class PebInsertActionHandler implements OnDestroy {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private actions$: Actions,
    private controlsService: PebControlsService,
    private editorAccessorService: PebEditorAccessorService,
    private editorStore: PebEditorStore,
    private editorThemeService: PebEditorThemeService,
    private radiusService: PebRadiusService,
    private store: Store,
    private tree: PebRTree<PebAbstractElement>,
  ) {
    this.actions$.pipe(
      ofActionDispatched(PebInsertAction),
      withLatestFrom(this.selectedElements$, this.screen$),
      map(([{ payload }, selectedElements, screen]) => {
        const toRendererElementDef = (elementKit) => ({
          ...elementKit.element,
          children: elementKit.children.map(child => toRendererElementDef(child)),
          styles: elementKit.styles[screen],
          context: elementKit.context,
          contextSchema: elementKit.contextSchema,
        });

        const getSectionDef = () => {
          const selectedElementDef = selectedElements[0];
          const isDocument = selectedElementDef.type === PebElementType.Document;
          const parentId = isDocument ? selectedElementDef.id : selectedElementDef.parent.id
          const selectedElement = this.tree.find(selectedElementDef.id);

          return {
            id: pebGenerateId(),
            index: isDocument ? selectedElement.children.length : selectedElement.element.index + 1,
            data: { name: 'Section' },
            meta: { deletable: true },
            parent: {
              id: parentId,
              slot: 'host',
              type: PebElementType.Document,
            },
            styles: { position: 'relative', height: 200 },
            children: [],
            motion: undefined,
            type: PebElementType.Section,
          }
        }

        return {
          rendererElementDef: payload ? toRendererElementDef(payload.elementKit) : getSectionDef(),
          selectedElements,
          screen,
        };
      }),
      map(({ rendererElementDef, selectedElements, screen }) => {
        const renderer = this.editorAccessorService.renderer;
        const elViewInjector = renderer.createElementInjector();

        const contextSchemaPayload = {};
        const stylesheetEffectPayload = {};

        let parent;
        let position;

        if (rendererElementDef.type !== PebElementType.Section) {
          const { height, width } = rendererElementDef.styles;
          const parentId = selectedElements[0].type === PebElementType.Document
            ? selectedElements[0].children[0].id
            : selectedElements[0].id;

          parent = this.tree.find(parentId);
          position = findAvailablePosition(screen, this.tree, parent, { height, width });

          while ((position.left === undefined && position.top === undefined)
            || parent.element.type === PebElementType.Text
            || parent.element.type === PebElementType.Grid) {
            if (parent.element.type === PebElementType.Section) {
              parent.styles.height = parent.styles.height < height ? height : parent.styles.height + height;

              stylesheetEffectPayload[parent.element.id] = { height: parent.styles.height };

              this.tree.insert(parent);
            } else {
              parent = this.tree.find(parent.element.parent?.id);
            }

            position = findAvailablePosition(screen, this.tree, parent, { height, width });
          }

          rendererElementDef.styles.left = position.left;
          rendererElementDef.styles.top = position.top;
        }

        const updateId = (
          elementDef,
          parent?: { id: string, type: PebElementType, slot?: string }
        ): PebRendererElementDef => {
          elementDef.id = pebGenerateId();
          elementDef.parent = parent ? { id: parent.id, type: parent.type, slot: 'host' } : elementDef.parent;
          elementDef.children = elementDef.children.map(childDef => {
            childDef.parent.id = elementDef.id;

            return updateId(childDef);
          });

          if (elementDef.contextSchema) {
            contextSchemaPayload[elementDef.id] = elementDef.contextSchema;
          }
          stylesheetEffectPayload[elementDef.id] = elementDef.styles;

          return elementDef;
        };

        const elementDef = updateId(
          rendererElementDef,
          rendererElementDef.type !== PebElementType.Section ? parent.element : undefined,
        );

        const createdElement = this.createElement(renderer, elementDef, elViewInjector);

        const page = this.editorStore.page;
        const templateEffects: PebEffect[] = [{
          type: PebTemplateEffect.AppendElement,
          target: `${PebEffectTarget.Templates}:${page.templateId}`,
          payload: { element: elementDef, to: elementDef.parent.id },
        }];

        parent = createdElement.instance.parent;

        parent.detectChanges();

        if (elementDef.type === PebElementType.Section) {
          parent.children
            .filter(child => child.element.id !== elementDef.id)
            .forEach(child => {
              templateEffects.push({
                type: PebTemplateEffect.PatchElement,
                target: `${PebEffectTarget.Templates}:${page.templateId}`,
                payload: { id: child.element.id, index: child.element.index },
              })
            })
        }

        const findGrid = (abstractElement: PebAbstractElement) => {
          if (abstractElement.element.type === PebElementType.Grid) {
            return abstractElement;
          }

          return abstractElement.parent ? findGrid(abstractElement.parent) : undefined;
        }

        const grid = findGrid(parent);

        if (grid?.data.functionLink) {
          grid.contextSubject$.next();
        }

        const bBox = this.tree.toBBox(createdElement.instance);
        this.store.dispatch(new PebSetSelectionBBoxAction({
          left: bBox.minX,
          top: bBox.minY,
          right: bBox.maxX,
          bottom: bBox.maxY,
        }));
        this.store.dispatch(new PebSelectAction(elementDef.id));

        switch (elementDef.type) {
          case PebElementType.Section:
            this.controlsService.renderControls([{
              anchorType: PebControlAnchorType.Section,
              color: PebControlColor.Default,
              ...bBox,
              label: elementDef.data['name'] ?? 'Section',
            }]);
            break;
          case PebElementType.Text:
            this.controlsService.renderControls([{
              anchorType: PebControlAnchorType.Text,
              color: PebControlColor.Default,
              ...bBox,
            }]);
            break;
          case PebElementType.Grid:
            const control = this.controlsService.createGridControl(createdElement.instance);
            this.controlsService.renderControls([control]);
            break;
          default:
            const controls = [{
              anchorType: PebControlAnchorType.Default,
              color: PebControlColor.Default,
              ...bBox,
            }] as PebControlCommon[];
            this.controlsService.renderControls(controls);
            this.radiusService.renderRadius(controls);
        }

        const effects = [
          ...templateEffects,
          ...Object.values(PebScreen).map((pebScreen: PebScreen) => {
            let payload = {};

            if (pebScreen !== screen) {
              Object.keys(stylesheetEffectPayload).forEach((elementId) => {
                payload[elementId] = {
                  ...stylesheetEffectPayload[elementId],
                  ...(elementDef.type !== PebElementType.Section ? { display: 'none' } : {}),
                };
              });
            } else {
              payload = stylesheetEffectPayload;
            }

            return {
              type: PebStylesheetEffect.Update,
              target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[pebScreen]}`,
              payload: payload,
            };
          }),
        ];

        if (Object.keys(contextSchemaPayload).length) {
          effects.push({
            type: PebContextSchemaEffect.Update,
            target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
            payload: contextSchemaPayload,
          })
        }

        return effects;
      }),
      tap((effects) => {
        const page = this.editorThemeService.page;
        const action: PebAction = {
          id: pebGenerateId(),
          targetPageId: page.id,
          affectedPageIds: [page.id],
          createdAt: new Date(),
          effects: effects,
        };

        this.editorThemeService.commitAction(action);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  // TODO: Common for paste and insert
  private createElement(
    renderer: PebRenderer,
    elementDef: PebRendererElementDef,
    elViewInjector: Injector
  ): ComponentRef<PebAbstractElement> {
    const componentRef = renderer.createElement(elementDef, elViewInjector);

    componentRef.instance.viewRef = componentRef.hostView;

    this.tree.insert(componentRef.instance);

    elementDef.children.forEach((childDef) => this.createElement(renderer, childDef, elViewInjector));

    const parent = this.tree.find(elementDef.parent.id);

    parent.element = {
      ...parent.element,
      children: [
        ...parent.element.children.filter(child => child.id !== componentRef.instance.element.id),
        componentRef.instance.element,
      ],
    };

    parent.children.push(componentRef.instance);
    parent.childrenSlot.insert(componentRef.hostView);

    if (elementDef.type === PebElementType.Section) {
      parent.children
        .filter(child => child.element.index >= elementDef.index && child.element.id !== elementDef.id)
        .forEach(child => {
          const index = child.element.index + 1;

          child.element = { ...child.element, index };
          child.styles.order = index;
        });

      this.tree.insert(componentRef.instance);
    }

    return componentRef;
  };
}
