import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { intersectionWith, isEqual } from 'lodash';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, merge, Observable, of } from 'rxjs';
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';

import { PebContextApi } from '@pe/builder-context';
import {
  isImageContext,
  isIntegrationAction,
  isIntegrationData,
  MediaType,
  PebAction,
  PebContextSchemaEffect,
  PebEditorIntegrationsStore,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementType,
  PebFilterConditionType,
  pebFilterElementsDeep,
  pebForEachObjectWithChildrenDeep,
  PebFunctionType,
  pebGenerateId,
  PebIntegration,
  PebIntegrationAction,
  PebIntegrationActionTag,
  PebIntegrationData,
  PebIntegrationDataType,
  PebIntegrationFieldMetaSubtype,
  PebIntegrationFieldMetaType,
  PebIntegrationForm,
  PebIntegrationInteractionAction,
  PebIntegrationTag,
  PebInteractionType,
  PebLanguage,
  PebScreen,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '@pe/builder-core';
import { PebEditorElement, PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import {
  ContextParameterType,
  PebEditorAccessorService,
  PebEditorStore,
  SnackbarErrorService,
} from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';

import { GridContext, GridIntegrationActionParams } from './functions-form.interface';

@Injectable()
export class PebFunctionsFormService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  screen: PebScreen;

  get editor() {
    return this.editorAccessorService.editorComponent;
  }

  elements$ = this.selectedElements$.pipe(
    map(elements =>
      elements.reduce((acc, element) => {
        if ([PebElementType.Text, PebElementType.Shape, PebElementType.Grid].includes(element.type)) {
          acc.push(element);
        }

        return acc;
      }, []),
    ),
    filter(elements => !!elements?.length),
    map(elements => elements.map(element => this.renderer.getElementComponent(element.id))),
  );

  functions$ = this.selectedElements$.pipe(
    filter(elements => !!elements?.length),
    switchMap((elements) => merge(...elements.map(element => this.tree.find(element.id).data$))),
    map(data => (Array.isArray(data) ? data.map(d => d.functionLink) : [data?.functionLink]).filter(f => !!f)),
  );

  actionsDataStore$ = new BehaviorSubject<{ [id: string]: any }>(null);
  actionsDataStore: { [id: string]: any } = {};

  allIntegrations: { grid: PebIntegration[], shape: PebIntegration[], text: PebIntegration[] } =
    this.integrationsStore.integrations.reduce((acc, integration) => {
      const shapeLinks = integration.data.filter(dataLink =>
        dataLink.dataType === PebIntegrationDataType.Select ||
        dataLink.dataType === PebIntegrationDataType.Input ||
        dataLink.dataType === PebIntegrationDataType.Checkbox ||
        dataLink.dataType === PebIntegrationDataType.ImageUrl ||
        dataLink.dataType === PebIntegrationDataType.Languages ||
        dataLink.dataType === PebIntegrationDataType.Submit || (
          dataLink.type === PebIntegrationFieldMetaType.String ||
          dataLink.type === PebIntegrationFieldMetaType.Number
        ) && dataLink.subType === PebIntegrationFieldMetaSubtype.Value,
      );

      const shapeInteractions = integration.interactions
          .filter(interaction => [
            PebIntegrationInteractionAction.Subscribe,
            PebIntegrationInteractionAction.Form,
          ].every(i => i !== interaction.interactionAction));

      const shapeActions = integration.actions.filter(action =>
        action.tags.some(tag => [PebIntegrationActionTag.GetFilters].includes(tag as PebIntegrationActionTag)));

      if (shapeLinks.length || shapeInteractions.length || shapeActions.length) {
        acc.shape.push({
          ...integration,
          data: shapeLinks,
          actions: shapeActions,
        });
      }

      const textLinks = integration.data.filter(dataLink =>
        dataLink.dataType === PebIntegrationDataType.Text && (
          dataLink.type === PebIntegrationFieldMetaType.String ||
          dataLink.type === PebIntegrationFieldMetaType.Number
        ) && dataLink.subType === PebIntegrationFieldMetaSubtype.Value,
      );

      if (textLinks.length || integration.interactions.length) {
        acc.text.push({
          ...integration,
          data: textLinks,
          actions: [],
        });
      }

      const gridActions = integration.actions
        .filter(action => action.tags.some(tag =>
          [
            PebIntegrationActionTag.GetList,
            PebIntegrationActionTag.GetCategoriesByProducts,
            PebIntegrationActionTag.GetPlans,
            PebIntegrationActionTag.GetRecommendations,
          ].includes(tag as PebIntegrationActionTag),
        ));

      if (gridActions.length) {
        acc.grid.push({
          ...integration,
          actions: gridActions,
          data: [],
          interactions: [],
        });
      }

      const groupActions = integration.actions.filter(action =>
        action.tags.some(tag =>
          [PebIntegrationActionTag.Form].includes(tag as PebIntegrationActionTag),
      ));

      const groupInteractions = integration.interactions.filter(interaction =>
        interaction.interactionAction === PebIntegrationInteractionAction.Subscribe ||
        interaction.interactionAction === PebIntegrationInteractionAction.Form);

      if (groupActions.length) {
        const index = acc.shape.findIndex(i => i.id === integration.id);

        if (index !== -1) {
          acc.shape[index].actions.push(...groupActions);
          acc.shape[index].interactions.push(...groupInteractions);
        } else {
          acc.shape.push({
            ...integration,
            actions: groupActions,
            data: [],
            interactions: groupInteractions,
          });
        }
      }

      return acc;
    }, {
      shape: [],
      text: [],
      grid: [],
      group: [],
    });

  filteredIntegrations$: Observable<[PebIntegration[], { [id: string]: any }]> = combineLatest([
    this.elements$.pipe(
      map((elements) => {
        return intersectionWith<PebIntegration>(...elements.map(element =>
        this.allIntegrations[element.definition.type]), isEqual);
      }),
    ),
    this.actionsDataStore$,
  ]);

  elementFunctions$ = this.filteredIntegrations$.pipe(
    map(([integrations, actionsDataStore]) => this.mapToFunctions(integrations, actionsDataStore)),
  );

  constructor(
    private editorAccessorService: PebEditorAccessorService,
    private editorStore: PebEditorStore,
    private renderer: PebEditorRenderer,
    private store: Store,
    private snackbarErrorService: SnackbarErrorService,
    private integrationsStore: PebEditorIntegrationsStore,
    private contextApi: PebContextApi,
    private tree: PebRTree<PebAbstractElement>,
  ) {
    this.screen$.pipe(
      tap((screen) => {
        this.screen = screen;
      }),
    ).subscribe();
  }

  setFunctions(value: PebIntegrationForm): Observable<any> {
    const page = this.editorStore.page;

    return this.elements$.pipe(
      map(elements =>
      elements.map((element) => {
        const abstractElement = this.tree.find(element.definition.id);
        const prevFunctionLink = { ...abstractElement.data.functionLink };
        const functionLink = value?.integration ? {
          ...(value.action ? value.action : value.data ? value.data : value.interaction),
          functionType: value.action
            ? PebFunctionType.Action
            : value.interaction
              ? PebFunctionType.Interaction
              : value.data && value.data.dataType === PebIntegrationDataType.Select
                ? PebFunctionType.SelectLink
                : PebFunctionType.Data,
          integration: { ...value.integration },
        } : null;

        const effect = [];

        if (isIntegrationData(functionLink) && isImageContext(functionLink)) {
          const image = abstractElement.context?.data?.['imagesUrl']?.[0];

          abstractElement.styles = {
            ...abstractElement.styles,
            backgroundImage: image ?? null,
            mediaType: image ? MediaType.Image : abstractElement.styles.mediaType,
          };

          element.background.form.patchValue({
            bgImage: image ?? null,
            mediaType: image ? MediaType.Image : abstractElement.styles.mediaType,
          }, { emitEvent: false });
        }

        if (isIntegrationData(prevFunctionLink) && isImageContext(prevFunctionLink)) {
          abstractElement.styles = {
            ...abstractElement.styles,
            backgroundImage: null,
            mediaType: MediaType.None,
          };

          element.background.form.patchValue({ bgImage: null, mediaType: MediaType.None }, { emitEvent: false });

          effect.push({
            type: PebStylesheetEffect.Update,
            target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[this.screen]}`,
            payload: { [element.definition.id]: { ...abstractElement.styles } },
          });
        }

        if (element.target.element.type !== PebElementType.Grid) {
          let error;
          if (element.definition.type === PebElementType.Shape && isIntegrationData(functionLink)) {
            error = this.checkSearchStringNavigation(element, functionLink);
          }

          if (error) {
            this.snackbarErrorService.openSnackbarError({
              text: Object.values(error).join('; '),
            });

            return EMPTY;
          }

          const nextElement = {
            ...abstractElement.element,
            data: {
              ...abstractElement?.data,
              functionLink,
            },
          };

          abstractElement.data = { ...abstractElement.data, functionLink };

          if (value?.action?.tags?.includes(PebIntegrationActionTag.GetFilters)) {
            const filters = value.action.actionData ? [{
              field: value.action.actionData.field,
            }] : [];

            effect.push({
              type: PebContextSchemaEffect.Update,
              target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
              payload: {
                [element.definition.id]: {
                  params: [
                    value.integration,
                    value.action,
                    filters,
                    [],
                    { offset: 0, limit: 2 },
                    { contextParameterType: ContextParameterType.Dynamic, value: '@product-filters.data' },
                    { contextParameterType: ContextParameterType.Dynamic, value: '@product-sort.data' },
                  ],
                  service: 'integrations',
                  method: 'fetchActionWithAdditional',
                },
              },
            });
          }

          return of(this.editorStore.updateElement(nextElement, effect).pipe(
            mergeMap(() => this.renderer.rendered.pipe(
              take(1),
              tap(() => {
                element.target.options = { ...element.options };
              }),
            )),
          ));
        }
        if ((value?.integration?.tag === PebIntegrationTag.Products
            && value.action?.tags?.includes(PebIntegrationActionTag.GetList))
          || (value?.integration?.tag === PebIntegrationTag.Subscription
            && value.action?.tags?.includes(PebIntegrationActionTag.List))) {
          return this.editor.openProductsDialog([], value?.integration?.tag === PebIntegrationTag.Subscription).pipe(
            filter(productsIds => !!productsIds),
            switchMap((productsIds: string[]) => {
              const filters = productsIds.length ? [{
                field: 'id',
                fieldCondition: PebFilterConditionType.In,
                value: productsIds,
              }] : [];

              return this.fetchGridIntegrationAction({ elements, value, functionLink, filters, productsIds });
            }),
          );
        }

        if (value?.action?.tags?.includes(PebIntegrationActionTag.GetCategoriesByProducts)) {
          return this.editor.openCategoriesDialog(elements[0].definition?.data?.context?.categoriesIds ?? []).pipe(
            filter(categoriesIds => !!categoriesIds),
            switchMap((categoriesIds: string[]) => {
              let filters = [];

              if (categoriesIds.length) {
                filters = [{
                  field: 'id',
                  fieldCondition: PebFilterConditionType.In,
                  value: categoriesIds,
                }];
              } else {
                const template = this.editorStore.page.template;
                const gridsOnPage = pebFilterElementsDeep(template, e => e.type === PebElementType.Grid);
                const productsOnPage = gridsOnPage.reduce((acc, grid) => {
                  if (isIntegrationAction(grid.data?.functionLink)
                    && grid.data.functionLink.method === 'getProductsForBuilder') {
                    const productsIds = grid.data.context?.productsIds;

                    if (productsIds?.length) {
                      return [...new Set([...acc, ...productsIds])];
                    }
                  }

                  return acc;
                }, []);

                filters = productsOnPage.length ? [{
                  field: 'id',
                  fieldCondition: PebFilterConditionType.In,
                  value: productsOnPage,
                }] : [];
              }

              return this.fetchGridIntegrationAction({ elements, value, functionLink, filters, categoriesIds });
            }),
          );
        }
        if (value?.action?.tags?.includes(PebIntegrationActionTag.GetFilters)) {
          const filters = value.action.actionData ? [{
            field: value.action.actionData.field,
          }] : [];

          return this.fetchGridIntegrationAction({ elements, value, functionLink, filters });
        }
        if (value?.action?.tags?.includes(PebIntegrationActionTag.GetRecommendations)) {
          return this.fetchGridIntegrationAction({ elements, value, functionLink, detailAction: true });
        }

        return this.clearGridContext(elements);
      })),
    ).pipe(
      mergeMap(obs => forkJoin([...obs])),
      take(1),
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

  protected checkActionMeta(elCmp: PebEditorElement, action: PebIntegrationAction): { [key: string]: string } {
    const actionMeta = action?.requestMeta || action?.meta;
    if (actionMeta) {
      const fieldsObject = Object.entries(actionMeta).reduce(
        (acc, [field, meta]) => {
          if (meta.required) {
            acc.required[field] = meta;
          }
          if (meta.restricted) {
            acc.restricted[field] = meta;
          }

          return acc;
        },
        {
          required: {},
          restricted: {},
        },
      );
      let hasSubmit = false;
      let hasRestricted = false;
      pebForEachObjectWithChildrenDeep(elCmp.definition, (el) => {
        const elm = el as PebElementDef;
        if (isIntegrationData(elm.data?.functionLink)) {
          const data = elm.data.functionLink;
          if (data.property && !!fieldsObject.required[data.property]) {
            delete fieldsObject.required[data.property];
          }
          if (fieldsObject.restricted[data.property]) {
            hasRestricted = true;
          }
          if (data.dataType === PebIntegrationDataType.Submit) {
            hasSubmit = true;
          }
        }
      });
      if (!hasSubmit) {
        return { submit: 'No submit button' };
      }
      if (Object.keys(fieldsObject.required).length) {
        return { requiredFields: `No fields: ${Object.keys(fieldsObject.required).join(', ')}` };
      }
      if (hasRestricted) {
        return { restrictedFields: `These fields are restricted: ${Object.keys(fieldsObject.restricted).join(', ')}` };
      }

      return null;
    }

    return null;
  }

  protected checkSearchStringNavigation(
    elCmp: PebEditorElement,
    data: PebIntegrationData,
    ): { [key: string]: string } {
    if (data.property === 'search') {
      if (elCmp.definition.data?.linkInteraction?.type === PebInteractionType.NavigateInternal) {
        return null;
      }

      return { link: 'No navigation link' };
    }

    return null;
  }

  mapToFunctions(integrations: PebIntegration[], actionsDataStore: { [id: string]: any }): any {
    return integrations?.reduce((acc, integration) => {
      const integrationTitle = integration.title.toLowerCase().replace('payever', '').trim();
      const subset = integration.data.reduce((functions, dataLink) => {
        const linkTitle = dataLink.title.toLowerCase().replace('payever', '').trim();
        const linkTitleTitlecased = linkTitle[0].toUpperCase() + linkTitle.slice(1);

        if (dataLink.dataType === PebIntegrationDataType.Input ||
          dataLink.dataType === PebIntegrationDataType.Checkbox ||
          dataLink.dataType === PebIntegrationDataType.PasswordInput ||
          dataLink.dataType === PebIntegrationDataType.Textarea ||
          dataLink.dataType === PebIntegrationDataType.Select ||
          dataLink.dataType === PebIntegrationDataType.Submit
        ) {
          functions.field.push({ integration, data: dataLink, title: linkTitleTitlecased, action: null });
        } else if (dataLink.dataType === PebIntegrationDataType.Text ||
          dataLink.dataType === PebIntegrationDataType.ImageUrl
        ) {
          functions.data.push({ integration, data: dataLink, title: linkTitleTitlecased });
        } else if (dataLink.dataType === PebIntegrationDataType.Languages
        ) {
          functions.dropdown.push({ integration, data: dataLink, title: linkTitleTitlecased });
        }

        return functions;
      }, {
        action: [
          ...[...integration.interactions].map(interaction => ({
            interaction,
            integration,
            title: interaction.title,
          })),
        ] as any,
        data: [],
        dropdown: [],
        field: [],
      });

      let actions = integration.actions.map(action => ({ action, integration, title: action.title }));

      if (actionsDataStore) {
        Object.entries(actionsDataStore).forEach(([key, value]) => {
          const action = actions.find(actionFunction => actionFunction.action.id === key);
          if (action) {
            value.result.forEach((result) => {
              actions.push({
                action: {
                  ...action.action,
                  actionData: result,
                },
                integration: action.integration,
                title: `${action.action.title} by ${result.field}`,
              });
            });
          }
        });
      }

      actions = actions.filter(action => action.title !== 'Get filters');

      subset.action = [...subset.action, ...actions].sort((a, b) => a.title > b.title ? 1 : -1);

      const obj = Object.entries(subset).reduce((parent, [title, children]: [any, [string, any]]) => {
        if (children.length) {
          parent.children.push({ title, children });
        }

        return parent;
      }, {
        title: integrationTitle,
        children: [],
      });

      if (obj.children.length) {
        acc.push({ ...obj });
      }

      return acc;
    }, []);
  }

  getFilterActions(): Observable<any> {
    const filterActions = this.integrationsStore.integrations.reduce(
      (acc: Array<{ action: PebIntegrationAction, integration: PebIntegration }>, integration) => {
        integration.actions.forEach((action) => {
          if (action.tags.includes(PebIntegrationActionTag.GetFilters)) {
            acc.push({ action, integration });
          }
        });

        return acc;
      },
      [],
    );

    const store = {};

    return forkJoin(
      filterActions
        .map(({ action, integration }) =>
          this.contextApi.fetchIntegrationAction({ integration, action }).pipe(
            tap((data) => {
              store[action.id] = data;
            }),
          ),
        ),
    ).pipe(
      take(1),
      tap(() => this.actionsDataStore$.next(store)),
    );
  }

  private fetchGridIntegrationAction({
    elements,
    value,
    functionLink,
    filters = [],
    productsIds = [],
    categoriesIds = [],
    page = this.editorStore.page,
    detailAction = false,
  }: GridIntegrationActionParams): any {
    return elements.map((el) => {
      const { colCount, rowCount } = el.target.data;
      const gridContext = this.createGridContext(value, filters, colCount, rowCount, detailAction);
      const data = {
        ...el.target.data,
        functionLink,
        context: {
          ...el.target.data?.context,
          productsIds,
          categoriesIds,
        },
      };
      const stylesheets = {};

      function recursive(element: PebAbstractElement) {
        stylesheets[element.element.id] = { ...element.styles };

        if (element.children) {
          element.children.forEach(child => recursive(child));
        }
      }

      el.target.children.forEach(child => recursive(child));

      const productsAction: PebAction = this.createAction([
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${page.templateId}`,
          payload: {
            ...el.definition,
            data,
            children: [ el.children[0].definition ],
          },
        },
        ...Object.values(PebScreen).map((screen: PebScreen) => {
          const effect = {
            type: PebStylesheetEffect.Update,
            target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
            payload: {
              ...el.definition.children.reduce((acc, child, index) => {
                if (index > 0) { acc[child.id] = null };

                return acc;
              }, {}),
            },
          };

          if (screen === this.screen) {
            effect.payload = { ...stylesheets, ...effect.payload };
          }

          return effect;
        }),
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
          payload: {
            [el.definition.id]: gridContext,
          },
        },
      ]);

      this.removeCells(el.definition.id);

      el.target.data = { ...el.target.data, ...data };

      return this.editorStore.commitAction(productsAction);
    });
  }

  private appendCell(el, elementDef, elementStyles) {
    const rendererElementDef = {
      ...elementDef,
      styles: elementStyles,
      parent: {
        id: el.definition.id,
        slot: 'host',
        type: el.definition.type,
      },
    }

    const renderer = this.editorAccessorService.renderer;
    const elViewInjector = renderer.createElementInjector();

    const cmpRef = renderer.createElement(rendererElementDef, elViewInjector);
    cmpRef.instance.viewRef = cmpRef.hostView;
    this.tree.insert(cmpRef.instance);

    cmpRef.instance.parent.children.push(cmpRef.instance);

    this.tree.find(rendererElementDef.parent.id).childrenSlot.insert(cmpRef.hostView);
  }

  private removeCells(id) {
    const el = this.tree.find(id);

    const collectDeletableElements = (element: PebAbstractElement) => {
      let elements = [ element.element.id ];

      element.children.forEach(child => { elements = [ ...elements, ...collectDeletableElements(child) ] });

      return elements;
    }

    const deletableElementIds = el.children.reduce((acc, curr, index) =>
      index > 0 ? [ ...acc, ...collectDeletableElements(curr)] : acc, []);

    deletableElementIds.reverse().forEach((id) => {
      const item = this.tree.find(id);

      this.tree.remove(item);

      item.parent.children = item.parent.children.filter(c => c.element.id !== id);
      item.getRendererComponentRegistry(item.element.id).destroy();
    });
  }

  private createGridContext(
    value: PebIntegrationForm,
    filters: string[],
    colCount: number,
    rowCount: number,
    detailAction: boolean,
  ): GridContext {
    let params;
    if (detailAction) {
      params = [
        value.integration,
        value.action,
        { contextParameterType: ContextParameterType.Dynamic, value: '@products-detail.data.id' },
      ];
    } else {
      params = [
        value.integration,
        value.action,
        filters,
        [],
        { offset: 0, limit: colCount * rowCount },
        { contextParameterType: ContextParameterType.Dynamic, value: '@product-filters.data' },
        { contextParameterType: ContextParameterType.Dynamic, value: '@product-sort.data' },
      ];
    }

    return {
      params,
      service: 'integrations',
      method: !detailAction ? 'fetchActionWithAdditional' : 'fetchDetailActionWithAdditional',
    };
  }

  private clearGridContext(elements, page = this.editorStore.page): Observable<any> {
    const [contextUpdateEffectPayload, appendElementEffect] = [{}, []];
    const stylesheetUpdateEffectPayload = Object.values(PebScreen).reduce(
      (acc, screen: PebScreen) => {
        acc[screen] = {};

        return acc;
      },
      {},
    );

    return elements.map((el) => {

      if (el.target.data?.functionLink === null) {
        return of(null);
      }

      const { colCount, rowCount } = el.target.data;

      Array.from(
        { length: (colCount * rowCount) - 1 },
        (_, i) => i + 1
      ).forEach((index) => {
        const elementId = pebGenerateId();
        const elementDef = {
          id: elementId,
          type: PebElementType.Shape,
          children: [],
          meta: { deletable: false, still: true },
          data: {
            text: {
              [this.screen]: {
                [PebLanguage.Generic]: {
                  ops: [
                    { insert: '', attributes: { align: '' } },
                    { insert: '\n', attributes: { align: 'center' } },
                  ],
                },
              },
            },
          },
          index,
        };
        const elementStyles = {
          backgroundColor: '#00a2ff',
        };

        appendElementEffect.push(elementDef);
        Object.values(PebScreen).forEach((screen) => {
          stylesheetUpdateEffectPayload[screen][elementId] = elementStyles;
        });
        contextUpdateEffectPayload[elementId] = null;

        this.appendCell(el, elementDef, elementStyles);

        return null;
      });

      (el.target as PebAbstractElement).detectChanges();

      // grid rows calc
      const rowHeight = el.nativeElement.clientHeight / rowCount;
      stylesheetUpdateEffectPayload[this.screen][el.definition.id] = {
        gridTemplateRows: Array.from({ length: rowCount }).map(() => rowHeight),
      };
      const data = {
        ...el.target.data,
        functionLink: null,
        context: {
          ...el.target.data.context,
          categoriesIds: [],
          productsIds: [],
        },
      }

      const removeBackgroundImage = (element) => {
        const fn = element.definition.data?.functionLink;

        if (isIntegrationData(fn) && isImageContext(fn)) {
          const el = this.tree.find(element.definition.id);

          if (el) {
            const styles = { backgroundImage: null, mediaType: MediaType.None };

            el.styles = { ...el.styles, ...styles };
            stylesheetUpdateEffectPayload[this.screen][element.definition.id] = styles;
          }
        }

        element.children.forEach(child => removeBackgroundImage(child));
      }

      el.children.forEach(child => removeBackgroundImage(child));

      const action: PebAction = this.createAction([
        ...Object.entries(stylesheetUpdateEffectPayload).map(([screen, payload]) => ({
          payload,
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
        })),
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
          payload: {
            ...contextUpdateEffectPayload,
            [el.definition.id]: null,
          },
        },
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${page.templateId}`,
          payload: {
            ...el.definition,
            data,
            children: [ el.definition.children[0], ...appendElementEffect ],
          },
        },
      ]);

      el.target.data = { ...el.target.data, ...data };

      return of(this.editorStore.commitAction(action));
    });
  }
}
