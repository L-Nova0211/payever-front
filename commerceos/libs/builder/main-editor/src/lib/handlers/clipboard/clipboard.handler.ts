import { ComponentRef, Injectable, Injector, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { BBox } from 'rbush';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebControlsService } from '@pe/builder-controls';
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

import { PebCopyAction, PebPasteAction } from '../../actions';
import { findAvailablePosition } from '../../services';


export interface PebClipboard {
  elements: PebRendererElementDef[],
  elementBBoxes: {
    [key: string]: BBox
  },
  clipboardBBox: BBox,
  clipboardDimensions: {
    height: number,
    width: number,
  },
}


@Injectable()
export class PebClipboardActionHandler implements OnDestroy {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  clipboard$ = new Subject<PebClipboard>();

  private destroy$ = new Subject<void>();

  constructor(
    private actions$: Actions,
    private editorAccessorService: PebEditorAccessorService,
    private editorStore: PebEditorStore,
    private editorThemeService: PebEditorThemeService,
    private controlsService: PebControlsService,
    private store: Store,
    private tree: PebRTree<PebAbstractElement>,
  ) {
    this.actions$.pipe(
      ofActionDispatched(PebCopyAction),
      switchMap(() => this.selectedElements$.pipe(take(1))),
      map((selectedElements) => {
        /** When element have children we remove them from clipboard.
         * They will be taken on paste action from element.children props*/
        let childrenIds = new Set();
        const getChildrenId  = (elements: PebAbstractElement[]) => {
          elements.forEach(element => {
            if (element && element.children.length) {
              element.children.forEach((el) => childrenIds.add(el.element.id))
              getChildrenId(element.children);
            }
          })
        }
        getChildrenId(selectedElements.map((el) => this.tree.find(el.id)));

        return selectedElements.filter((el) => ![...childrenIds].includes(el.id));
      }),
      tap((selectedElements) => {
        const clipboard = selectedElements.reduce((acc: PebClipboard, selectedElement: PebElementDef) => {
          const abstractElement = this.tree.find(selectedElement.id);
          const rendererElementDef = this.createRendererElement(abstractElement, selectedElement.parent);

          acc.elements.push(rendererElementDef);

          const bBox = this.tree.toBBox(abstractElement)

          acc.elementBBoxes[selectedElement.id] = bBox;
          acc.clipboardBBox = Object.keys(acc.clipboardBBox).length
            ? {
              minX: Math.min(acc.clipboardBBox.minX, bBox.minX),
              minY: Math.min(acc.clipboardBBox.minY, bBox.minY),
              maxX: Math.max(acc.clipboardBBox.maxX, bBox.maxX),
              maxY: Math.max(acc.clipboardBBox.maxY, bBox.maxY),
            }
            : bBox;

          return acc;
        }, { elements: [], elementBBoxes: {}, clipboardBBox: {}, clipboardDimensions: {} } as PebClipboard);

        clipboard.clipboardDimensions.height = clipboard.clipboardBBox.maxY - clipboard.clipboardBBox.minY;
        clipboard.clipboardDimensions.width = clipboard.clipboardBBox.maxX - clipboard.clipboardBBox.minX;

        this.clipboard$.next(clipboard);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.actions$.pipe(
      ofActionDispatched(PebPasteAction),
      withLatestFrom(this.selectedElements$, this.clipboard$, this.screen$),
      map(([_, selectedElements, clipboard, screen]) => {
        let parent = this.tree.find(selectedElements[0].id);
        let index: number;

        const { elements, elementBBoxes, clipboardBBox, clipboardDimensions } = clipboard;
        const hasSection = elements.some(element => element.type === PebElementType.Section);

        if (hasSection) {
          while (parent && parent.element.type !== PebElementType.Document) {
            if (parent.element.type === PebElementType.Section) {
              index = parent.element.index;
            }
            parent = this.tree.find(parent.element.parent?.id);
          }
        }

        let position = !hasSection
          ? findAvailablePosition(screen, this.tree, parent, clipboardDimensions)
          : { left: 0, top: 0 };

        const page = this.editorThemeService.page;
        const templateEffects: PebEffect<PebTemplateEffect>[] = [];
        const contextSchemaPayload = {};
        const stylesheetEffectPayload = {};

        while (position.left === undefined && position.top === undefined
          || parent.element.type === PebElementType.Text) {
          if (parent.element.type === PebElementType.Section) {
            parent.styles.height = parent.styles.height < clipboardDimensions.height
              ? clipboardDimensions.height
              : parent.styles.height + clipboardDimensions.height;

            stylesheetEffectPayload[parent.element.id] = { height: parent.styles.height };

            this.tree.insert(parent);
          } else {
            parent = this.tree.find(parent.element.parent?.id);
          }

          position = findAvailablePosition(screen, this.tree, parent, clipboardDimensions);
        }

        const renderer = this.editorAccessorService.renderer;
        const elViewInjector = renderer.createElementInjector();

        const updateId = (
          elementDef: PebRendererElementDef,
          parent?: { id: string, type: PebElementType, slot?: string }
        ): PebRendererElementDef => {
          elementDef.id = pebGenerateId();
          elementDef.index = hasSection && elementDef.type === PebElementType.Section ? index + 1 : elementDef.index;
          elementDef.parent = parent ? { id: parent.id, type: parent.type, slot: 'host' } : elementDef.parent;
          elementDef.children = elementDef.children.map(childDef => {
            childDef.parent.id = elementDef.id;

            return updateId(childDef);
          });

          stylesheetEffectPayload[elementDef.id] = elementDef.styles;

          return elementDef;
        };

        const createdElements = elements.map((rendererElementDef: PebRendererElementDef) => {
          const currElementDef = updateId({ ...rendererElementDef }, parent.element);

          if (position && !hasSection) {
            const prevElementBBox = elementBBoxes[rendererElementDef.id];

            currElementDef.styles.left = prevElementBBox.minX - clipboardBBox.minX + position.left;
            currElementDef.styles.top = prevElementBBox.minY - clipboardBBox.minY + position.top;
          }

          const createdElement = this.createElement(renderer, currElementDef, elViewInjector);

          delete currElementDef.context;
          delete currElementDef.styles;

          contextSchemaPayload[currElementDef.id] = page.context[rendererElementDef.id];
          templateEffects.push({
            type: PebTemplateEffect.AppendElement,
            target: `${PebEffectTarget.Templates}:${page.templateId}`,
            payload: {
              element: currElementDef,
              to: currElementDef.parent.id,
            },
          });

          return createdElement.instance;
        });

        parent.detectChanges();

        this.store.dispatch(new PebSelectAction(createdElements.map(element => element.element.id)));

        const controls = this.controlsService.createDefaultControlsSet(createdElements);
        this.controlsService.renderControls(controls);

        const effects: PebEffect[] = [
          ...templateEffects,
          ...Object.values(PebScreen).map((pebScreen: PebScreen) => {
            let payload = {};

            if (pebScreen !== screen) {
              Object.keys(stylesheetEffectPayload).forEach((elementId) => payload[elementId] = { display: 'none' });
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

  ngOnDestroy() {
    this.destroy$.next();
  }

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
        ...parent.element.children,
        componentRef.instance.element,
      ],
    };

    parent.children.push(componentRef.instance);
    parent.childrenSlot.insert(componentRef.hostView);

    return componentRef;
  };

  private createRendererElement(
    element: PebAbstractElement,
    parent: { id: string, type: PebElementType, slot?: string }
  ): PebRendererElementDef {
    return {
      id: element.element.id,
      type: element.element.type,
      styles: { ...element.styles },
      parent: {
        id: parent.id,
        type: parent.type,
        slot: parent.slot,
      },
      data: { ...element.data },
      meta: element.element.meta,
      index: element.element.index,
      motion: element.element.motion,
      context: element.context,
      children: element.children.map(child =>
        this.createRendererElement(child, { id: element.element.id, type: element.element.type, slot: 'host' })),
    }
  }
}
