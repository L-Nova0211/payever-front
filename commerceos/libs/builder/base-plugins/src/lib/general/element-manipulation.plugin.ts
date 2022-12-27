import { Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import omit from 'lodash/omit';
import { EMPTY, merge, Observable, of } from 'rxjs';
import {
  filter,
  first,
  map,
  mergeMap,
  switchMap,
  switchMapTo,
  tap,
} from 'rxjs/operators';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { PebControlsService, PebRadiusService } from '@pe/builder-controls';
import {
  PebEditorState,
  PebEffectTarget,
  PebElementDef,
  PebElementId,
  PebElementType,
  PebScreen,
  PebShopEffect,
} from '@pe/builder-core';
import { PebEditor } from '@pe/builder-main-editor';
import { PebEditorElement, PebEditorRenderer } from '@pe/builder-main-renderer';
import { AfterGlobalInit, checkElements } from '@pe/builder-old';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebDeselectAllAction, PebElementSelectionState, PebSelectAction } from '@pe/builder-state';


@Injectable()
export class PebEditorElementManipulationPlugin implements AfterGlobalInit {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  selectedElements: PebElementId[];
  screen: PebScreen;

  private get editor() {
    return this.editorAccessorService.editorComponent as PebEditor;
  }

  constructor(
    private alertDialogService: PeAlertDialogService,
    private editorAccessorService: PebEditorAccessorService,
    private renderer: PebEditorRenderer,
    private editorStore: PebEditorStore,
    private state: PebEditorState,
    private store: Store,
    private tree: PebRTree<PebAbstractElement>,
    private apmService: ApmService,
    private readonly controlsService: PebControlsService,
    private readonly radiusService: PebRadiusService,
  ) {
  }

  afterGlobalInit(): Observable<any> {
    return merge(
      this.selectedElements$.pipe(
        tap((elements) => {
          this.selectedElements = elements.map(element => element.id);
        }),
      ),
      this.screen$.pipe(
        tap((screen) => {
          this.screen = screen;
        }),
      ),
      this.deleteElement(),
    );
  }

  deleteElement(): Observable<any> {
    return this.editor.manipulateElement$.pipe(
      filter(({ type }) => type === 'delete'),
      map(({ selectedElements }) => selectedElements.map(id => this.renderer.getElementComponent(id))),
      switchMap((selectedElements: PebEditorElement[]) => {
        const sections = selectedElements.filter(el => el.definition.type === PebElementType.Section);
        if (sections.length === 1 && !sections[0].siblings?.length) {
          const dialog = this.alertDialogService.open({
            data: {
              title: 'Error',
              subtitle: 'You cannot delete all sections',
              actions: [
                {
                  label: 'Close',
                  bgColor: '#6f7279',
                  callback: () => Promise.resolve(false),
                },
              ],
            },
          });

          return dialog.afterClosed().pipe(
            switchMapTo(EMPTY),
          );
        }

        const indelibleSections = sections.filter(el => !el.definition.meta?.deletable);
        if (indelibleSections.length) {
          const dialog = this.alertDialogService.open({
            data: {
              title: 'Error',
              subtitle: 'You cannot delete a "Default section". Please disable default and delete this section.',
              actions: [
                {
                  label: 'Change Default',
                  callback: () => Promise.resolve(true),
                },
                {
                  label: 'Close',
                  callback: () => Promise.resolve(false),
                },
              ],
            },
          });

          return dialog.afterClosed().pipe(
            filter(Boolean),
            switchMap(() => {
              const sectionElement = indelibleSections.map(el => {

                const section = this.tree.find(el.definition.id);
                section.element = { ...section.element, meta: { ...section.element.meta, deletable: true } };

                return {
                  ...el.definition,
                  meta: {
                    ...el.definition.meta,
                    deletable: true,
                  },
                };
              });

              const updatedElement = this.editorStore.updateElement(sectionElement);

              this.store.dispatch(new PebDeselectAllAction());
              this.store.dispatch(new PebSelectAction(indelibleSections[0].definition.id));

              return updatedElement;
            }),
            mergeMap(() => this.renderer.rendered.pipe(
              first(),
              tap(() => {
                checkElements(indelibleSections[0].definition.id, this.apmService);
                this.store.dispatch(new PebSelectAction(indelibleSections[0].definition.id));
              }),
            )),
            switchMapTo(EMPTY),
          );
        }

        this.controlsService.renderControls([]);
        this.radiusService.renderRadius([]);

        return of(selectedElements);
      }),
      map((selectedElements: PebEditorElement[]) => selectedElements.filter(el => {
        const isHasDeletable = !(el.definition.meta?.deletable === false);
        const isParentType = el.parent.definition.type;
        const isGridType = el.definition.type === PebElementType.Grid || isParentType === PebElementType.Grid;

        const isNotDocument = el.definition.type !== PebElementType.Document;
        const isCanDelete = isHasDeletable || isGridType;

        return isNotDocument && isCanDelete;
      })),
      filter(deletableElements  => !!deletableElements.length),
      tap(() => {
        this.store.dispatch(new PebSelectAction(this.editorStore.page.template.id));
      }),
      map((elements: PebEditorElement[]) => {
        const deletableElements = new Set<PebEditorElement>();

        elements.forEach(element => {
          deletableElements.add(element.parent.definition.type === PebElementType.Grid ? element.parent : element);
        });

        return { deletableElements: Array.from(deletableElements) };
      }),
      switchMap(({ deletableElements }) => {
        const appSnackbars = this.editorStore.snapshot.application.data?.snackbars ?? {};
        const snackbarsToDelete = Object.entries(appSnackbars).reduce(
          (acc, [interactionType, snackbars]) => {
            return deletableElements.reduce(
              (accDE, el) => {
                if (el.definition.id in snackbars) {
                  accDE.push([interactionType, el.definition.id]);
                }

                return accDE;
              },
              acc,
            );
          },
          [],
        );

        const effects = [];
        if (snackbarsToDelete.length) {
          effects.push({
            type: PebShopEffect.UpdateData,
            target: PebEffectTarget.Shop,
            payload: {
              ...this.editorStore.snapshot.application.data,
              snackbars: omit(appSnackbars, snackbarsToDelete),
            },
          });
        }

        const collectDeletableElements = (element) => {
          let elements = [ element.element.id ];

          element.children.forEach(child => {
            elements = [ ...elements, ...collectDeletableElements(child) ];
          });

          return elements;
        }

        const deletableElementIds = deletableElements.map((el) => this.tree.find(el.definition.id))
          .reduce((acc, curr) =>
          [ ...acc, ...collectDeletableElements(curr)], []);

        deletableElementIds.reverse().forEach((id) => {
          const item = this.tree.find(id);
          const parent = this.tree.find(item?.element.parent.id);

          if (parent) {
            const children = parent.children.filter(c => c.element.id !== id);
            parent.children = children;
            parent.element =  {
              ...parent.element,
              children: children.map(elm => elm.element),
            };

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
          }

          if (item) {
            item.destroy();
          }
        });

        return this.editorStore.deleteElement(deletableElementIds, effects);
      }),
    );
  }

}
