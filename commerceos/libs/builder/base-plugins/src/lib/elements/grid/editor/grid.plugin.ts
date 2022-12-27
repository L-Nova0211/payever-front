import { ComponentFactoryResolver, ComponentRef, Injectable, Injector } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ApmService } from '@elastic/apm-rum-angular';
import { merge, Observable } from 'rxjs';
import {
  debounceTime,
  filter,
  finalize,
  map,
  skip,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import {
  PebAction,
  PebContextSchemaEffect,
  pebCreateLogger,
  PebEffect,
  PebEffectTarget,
  PebElementKit,
  PebElementType,
  pebGenerateId,
  PebGridElementBorderOption,
  PebScreen,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '@pe/builder-core';
import { PebEditorElement } from '@pe/builder-main-renderer';
import { AfterGlobalInit } from '@pe/builder-old';
import { PebPagesService } from '@pe/builder-pages';
import { AbstractEditElementPlugin } from '@pe/builder-shared';
import { EnvService } from '@pe/common';

import { PebEditorGridSidebarComponent } from './grid.sidebar';


const log = pebCreateLogger('editor:plugin:grid');


@Injectable()
export class PebEditorGridPlugin
  extends AbstractEditElementPlugin<PebEditorGridSidebarComponent>
  implements AfterGlobalInit {

  sidebarComponent = PebEditorGridSidebarComponent;

  logger = { log };

  constructor(
    injector: Injector,
    protected cfr: ComponentFactoryResolver,
    protected envService: EnvService,
    protected pagesService: PebPagesService,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    private apmService: ApmService,
  ) {
    super(injector);
    const options: PebGridElementBorderOption[] = Object.values(PebGridElementBorderOption)
      .filter(option => option !== PebGridElementBorderOption.None);
    options.forEach((option) => {
      iconRegistry.addSvgIcon(
        `grid-border-${option}`,
        domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/borders/${option}.svg`),
      );
    });
  }

  afterGlobalInit(): Observable<any> {
    return this.selectedElements$.pipe(
      filter(elements => elements.length === 1
        && (elements[0].type === PebElementType.Grid || elements[0].parent?.type === PebElementType.Grid)),
      map(([element]) => this.renderer.getElementComponent(element.id)),
      switchMap((elCmp) => {
        const sidebarRef = this.initSidebar(elCmp);
        this.initAlignmentForm(sidebarRef);
        const obs = [
          this.handleSidebarForm(elCmp, sidebarRef),
          this.handleAlignmentForm(elCmp, sidebarRef),
        ];

        return merge(...obs).pipe(
          takeUntil(this.selectedElements$.pipe(skip(1))),
          finalize(() => {
            // Do not dispatch deselect action here
            sidebarRef.destroy();
          }),
        );
      }),
    );
  }

  protected handleSidebarForm(
    elCmp: PebEditorElement,
    sidebarRef: ComponentRef<PebEditorGridSidebarComponent>,
  ): Observable<any> {
    return merge(
      sidebarRef.instance.form.get('image.size').valueChanges.pipe(
        switchMap((imageSize) => {
          const newDef = {
            ...elCmp.definition,
            data: { ...elCmp.definition.data, imageSize },
          };

          return this.editorStore.updateElement(newDef);
        }),
      ),
      sidebarRef.instance.form.get('image.scale').valueChanges.pipe(
        tap((imageScale) => {
          elCmp.definition.data = {
            ...elCmp.definition.data,
            imageScale,
          };
        }),
        debounceTime(300),
        switchMap((imageScale) => {
          const newDef = {
            ...elCmp.definition,
            data: { ...elCmp.definition.data, imageScale },
          };

          return this.editorStore.updateElement(newDef);
        }),
      ),
      sidebarRef.instance.form.get('fullHeight').valueChanges.pipe(
        switchMap((fullHeight) => {
          const newDef = {
            ...elCmp.definition,
            data: { ...elCmp.definition.data, fullHeight },
          };

          return this.editorStore.updateElement(newDef);
        }),
      ),
      sidebarRef.instance.form.get('openInOverlay').valueChanges.pipe(
        switchMap((openInOverlay) => {
          const newDef = {
            ...elCmp.definition,
            data: { ...elCmp.definition.data, openInOverlay },
          };

          return this.editorStore.updateElement(newDef);
        }),
      ),
      sidebarRef.instance.form.get('grid').valueChanges.pipe(
        switchMap((value) => {
          const page = this.editorStore.page;
          const [contextUpdateEffectPayload, deleteElementEffect, appendElementEffect] = [{}, [], []];
          const cellsBorderOptionsChange = {};
          const stylesheetUpdateEffectPayload = Object.values(PebScreen).reduce(
            (acc, screen) => {
              acc[screen] = {};

              return acc;
            },
            {},
          );
          if (!page.context[elCmp.definition.id] || !Object.keys(page.context[elCmp.definition.id]).length) {
            const oldColCount = elCmp.definition.data.colCount;
            const cellsBorderOptions = elCmp.definition.data.cellsBorderOptions;
            const { oldChildrenGrid, oldCellsBorderOptions } = elCmp.definition.children.reduce(
              (acc, childElement, i) => {
                const childElementId = childElement.id;
                // if (childElement.id === elCmp.definition.id && childElement.type !== value.elType) {
                //   childElement.data.elementType = value.elType;
                //   if (value.elType === PebElementType.Shape) {
                //     childElement.data.variant = PebShapeVariant.Square;
                //   }
                //   childElement.id = pebGenerateId();
                //   // nextId = childElement.id;
                // }
                const child: PebElementKit = {
                  element: childElement,
                  contextSchema: page.context[childElementId],
                  styles: Object.values(PebScreen).reduce(
                    (accS, screen: PebScreen) => {
                      accS[screen] = page.stylesheets[screen][childElementId];

                      return accS;
                    },
                    {},
                  ),
                };
                if (acc.col >= oldColCount) {
                  acc.col = 0;
                  acc.row += 1;
                }
                if (!acc.oldChildrenGrid[acc.row]) {
                  acc.oldChildrenGrid.push([child]);
                  acc.oldCellsBorderOptions.push([cellsBorderOptions?.[i]]);
                } else {
                  acc.oldChildrenGrid[acc.row].push(child);
                  acc.oldCellsBorderOptions[acc.row].push(cellsBorderOptions?.[i]);
                }
                acc.col += 1;

                return acc;
              },
              { oldChildrenGrid: [], oldCellsBorderOptions: [], row: 0, col: 0 },
            );
            for (let i = 0; i < value.rowCount; i += 1) {
              for (let j = 0; j < value.colCount; j += 1) {
                const index = i * value.colCount + j;
                const child = oldChildrenGrid[i]?.[j] ?? null;
                if (child) {
                  deleteElementEffect.push(child.element.id);
                  appendElementEffect.push(child.element);
                  Object.entries(child.styles).forEach(([screen, styles]) => {
                    stylesheetUpdateEffectPayload[screen][child.element.id] = styles;
                  });
                  contextUpdateEffectPayload[child.element.id] = child.contextSchema;
                  if (oldCellsBorderOptions[i]?.[j]) {
                    cellsBorderOptionsChange[index] = oldCellsBorderOptions[i][j];
                  }
                } else {
                  const elementId = pebGenerateId();
                  appendElementEffect.push({
                    id: elementId,
                    type: PebElementType.Shape,
                    data: {
                      elementType: PebElementType.Shape,
                      text: '',
                    },
                    children: [],
                    meta: { deletable: false, still: true },
                  });
                  Object.values(PebScreen).forEach((screen) => {
                    stylesheetUpdateEffectPayload[screen][elementId] = { backgroundColor: '#d4d4d4' };
                  });
                  contextUpdateEffectPayload[elementId] = null;
                }
              }
            }
          }

          const action: PebAction = this.createAction([
            ...Object.entries(stylesheetUpdateEffectPayload).map(([screen, payload]) => ({
              payload,
              type: PebStylesheetEffect.Update,
              target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
            })),
            {
              type: PebContextSchemaEffect.Update,
              target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
              payload: contextUpdateEffectPayload,
            },
            {
              type: PebTemplateEffect.UpdateElement,
              target: `${PebEffectTarget.Templates}:${page.templateId}`,
              payload: {
                ...elCmp.definition,
                data: {
                  ...elCmp.definition.data,
                  colCount: value.colCount,
                  rowCount: value.rowCount,
                  cellsBorderOptions: cellsBorderOptionsChange,
                },
                children: appendElementEffect,
              },
            },
          ]);

          return this.editorStore.commitAction(action);
        }),
      ),
      sidebarRef.instance.form.get('spacing').valueChanges.pipe(
        switchMap((value: number) => {
          const page = this.editorStore.page;
          const action = this.createAction([
            {
              type: PebTemplateEffect.UpdateElement,
              target: `${PebEffectTarget.Templates}:${page.templateId}`,
              payload: {
                ...elCmp.definition,
                data: {
                  ...elCmp.definition.data,
                  spacing: value,
                },
              },
            },
          ]);

          return this.editorStore.commitAction(action);
        }),
      ),
    );
  }

  private createAction(effects: PebEffect[]): PebAction {
    const page = this.editorStore.page;

    return {
      effects,
      id: pebGenerateId('action'),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      createdAt: new Date(),
    };
  }
}
