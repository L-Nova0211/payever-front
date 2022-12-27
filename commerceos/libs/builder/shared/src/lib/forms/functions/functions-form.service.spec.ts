import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { PebContextApi } from '@pe/builder-context';
import { PebShapeVariant } from '@pe/builder-base-plugins';
import * as pebCore from '@pe/builder-core';
import {
  PebContextSchemaEffect,
  PebEditorIntegrationsStore,
  PebEditorState,
  PebEffectTarget,
  PebElementType,
  PebFilterConditionType,
  PebFunctionType,
  PebIntegrationActionTag,
  PebIntegrationDataType,
  PebIntegrationFieldMetaSubtype,
  PebIntegrationFieldMetaType,
  PebIntegrationInteractionAction,
  PebIntegrationTag,
  PebInteractionType,
  PebPageEffect,
  PebScreen,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '@pe/builder-core';
import { omit } from 'lodash';
import { of, Subject, Subscription } from 'rxjs';
import { isEmpty, switchMap } from 'rxjs/operators';
import { PebEditorRenderer } from '../../../renderer/editor-renderer';
import { PebEditor } from '../../../root/editor.component';
import {
  ContextParameterType,
  PebEditorAccessorService,
  PebEditorStore,
  SnackbarErrorService,
} from '../../../services';
import { PebAddToSelectionAction, PebDeselectAllAction } from '../../../state';
import { PebFunctionsFormService } from './functions-form.service';

describe('PebFunctionsFormService', () => {

  let service: PebFunctionsFormService;
  let editorComponent: jasmine.SpyObj<PebEditor>;
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let snackbarErrorService: jasmine.SpyObj<SnackbarErrorService>;
  let contextApi: jasmine.SpyObj<PebContextApi>;
  let store: jasmine.SpyObj<Store>;
  let editorState: PebEditorState;
  let renderer: {
    rendered: Subject<void>;
    getElementComponent: jasmine.Spy;
  };
  let selectedElements$: Subject<any[]>;
  let integrations: any[];

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  beforeEach(() => {

    selectedElements$ = new Subject();
    spyOnProperty(PebFunctionsFormService.prototype, 'selectedElements$').and.returnValue(selectedElements$);

    editorComponent = jasmine.createSpyObj<PebEditor>('PebEditor', [
      'openProductsDialog',
      'openCategoriesDialog',
    ]);

    const editorStoreSpy = jasmine.createSpyObj<PebEditorStore>('PebEditorStore', [
      'updateElement',
      'commitAction',
    ]);
    editorStoreSpy[`page` as any] = {
      id: 'p-001',
      template: {
        id: 'tpl-001',
        children: [],
      },
      templateId: 'tpl-001',
      stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => ({
        ...acc,
        [screen]: `${screen.charAt(0)}-001`,
      }), {}),
      contextId: 'ctx-001',
    };

    const editorStateMock = {
      selectedElements: ['selected'],
      screen: PebScreen.Desktop,
    };

    renderer = {
      rendered: new Subject(),
      getElementComponent: jasmine.createSpy('getElementComponent'),
    };

    const storeSpy = jasmine.createSpyObj<Store>('Store', ['dispatch']);

    const snackbarErrorServiceSpy = jasmine.createSpyObj<SnackbarErrorService>('SnackbarErrorService', [
      'openSnackbarError',
    ]);

    integrations = [
      {
        data: [],
        interactions: [],
        actions: [],
      },
      {
        data: [{
          dataType: PebIntegrationDataType.Text,
          type: PebIntegrationFieldMetaType.Number,
          subType: PebIntegrationFieldMetaSubtype.Value,
        }],
        interactions: [{
          interactionAction: PebIntegrationInteractionAction.Subscribe,
        }],
        actions: [
          { id: 'a-001', tags: [PebIntegrationActionTag.GetRecommendations] },
          { id: 'a-002', tags: [PebIntegrationActionTag.GetFilters] },
          { id: 'a-003', tags: [PebIntegrationActionTag.Form] },
        ],
      },
    ];
    const integrationsStore = { integrations };

    const contextApiSpy = jasmine.createSpyObj<PebContextApi>('PebContextApi', [
      'fetchIntegrationAction',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PebFunctionsFormService,
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorStore, useValue: editorStoreSpy },
        { provide: PebEditorState, useValue: editorStateMock },
        { provide: PebEditorRenderer, useValue: renderer },
        { provide: Store, useValue: storeSpy },
        { provide: SnackbarErrorService, useValue: snackbarErrorServiceSpy },
        { provide: PebEditorIntegrationsStore, useValue: integrationsStore },
        { provide: PebContextApi, useValue: contextApiSpy },
      ],
    });

    service = TestBed.inject(PebFunctionsFormService);
    editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
    snackbarErrorService = TestBed.inject(SnackbarErrorService) as jasmine.SpyObj<SnackbarErrorService>;
    contextApi = TestBed.inject(PebContextApi) as jasmine.SpyObj<PebContextApi>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    editorState = TestBed.inject(PebEditorState);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get editor', () => {

    expect(service.editor).toEqual(editorComponent);

  });

  it('should set elements$ on construct', () => {

    const elements = {
      'elem-001': {
        id: 'elem-001',
        type: PebElementType.Text,
      },
      'elem-002': {
        id: 'elem-002',
        type: PebElementType.Button,
      },
    };

    renderer.getElementComponent.and.callFake((id: string) => elements[id] ?? null);

    service.elements$.subscribe(elems => expect(elems).toEqual([elements['elem-001']] as any[]));

    selectedElements$.next(Object.values(elements));

    expect(renderer.getElementComponent).toHaveBeenCalledOnceWith('elem-001');

  });

  it('should set functions$ on construct', () => {

    const elements = [
      {
        id: 'elem-001',
        data: null,
      },
      {
        id: 'elem-002',
        data: {
          functionLink: {
            functionType: PebFunctionType.Action,
          },
        },
      },
    ];

    service.functions$.subscribe(funcs => expect(funcs).toEqual([elements[1].data.functionLink] as any[]));

    selectedElements$.next(elements);

  });

  it('should set all integrations on construct', () => {

    expect(service.allIntegrations).toEqual({
      shape: [{
        data: integrations[1].data,
        interactions: integrations[1].interactions,
        actions: [],
      }],
      text: [{
        data: integrations[1].data,
        interactions: integrations[1].interactions,
        actions: [],
      }],
      grid: [{
        data: [],
        interactions: [],
        actions: integrations[1].actions.slice(0, 2),
      }],
      group: [{
        data: [],
        interactions: integrations[1].interactions,
        actions: integrations[1].actions.slice(-1),
      }],
    } as any);

  });

  it('should set elementFunctions$ on construct', () => {

    const elements = {
      'elem-001': {
        id: 'elem-001',
        type: PebElementType.Text,
        definition: {
          id: 'elem-001',
          type: PebElementType.Text,
        },
      },
      'elem-002': {
        id: 'elem-002',
        type: PebElementType.Button,
        definition: {
          id: 'elem-002',
          type: PebElementType.Button,
        },
      },
    };
    const mapSpy = spyOn(service, 'mapToFunctions').and.returnValue([]);

    renderer.getElementComponent.and.callFake((id: string) => elements[id] ?? null);

    service.elementFunctions$.subscribe();
    service.filteredIntegrations$.subscribe(res => {
      expect(res).toEqual([
        [{
          data: integrations[1].data,
          interactions: integrations[1].interactions,
          actions: [],
        }],
        { 'elem-002': elements['elem-002'] },
      ]);
      expect(mapSpy).toHaveBeenCalledWith(
        [{
          data: integrations[1].data,
          interactions: integrations[1].interactions,
          actions: [],
        }] as any,
        { 'elem-002': elements['elem-002'] },
      );
    });
    service.actionsDataStore$.next({ 'elem-002': elements['elem-002'] });
    selectedElements$.next(Object.values(elements));

  });

  it('should set functions', () => {

    const element = {
      id: 'elem-001',
      type: PebElementType.Shape,
      definition: {
        id: 'elem-001',
        type: PebElementType.Shape,
        data: null,
      },
      target: {
        element: {
          type: PebElementType.Grid,
        },
        options: {},
      },
      options: { scale: 2 },
      controls: null,
    };
    const value = {
      integration: null,
      action: null,
      interaction: null,
      data: null,
    };
    const fetchSpy = spyOn<any>(service, 'fetchGridIntegrationAction').and.returnValue(of(null));
    const clearSpy = spyOn<any>(service, 'clearGridContext').and.returnValue(of({ cleared: true }));
    const checkActionMetaSpy = spyOn<any>(service, 'checkActionMeta');
    const checkSearchStringNavigationSpy = spyOn<any>(service, 'checkSearchStringNavigation');
    const pageTemplateChildren = [
      {
        id: 'child-001',
        type: PebElementType.Grid,
        data: null,
      },
      {
        id: 'child-002',
        type: PebElementType.Grid,
        data: {
          functionLink: {
            functionType: PebFunctionType.Action,
            method: 'getProductsForBuilder',
          },
          context: null,
        },
      },
      {
        id: 'child-003',
        type: PebElementType.Grid,
        data: {
          functionLink: {
            functionType: PebFunctionType.Action,
            method: 'getProductsForBuilder',
          },
          context: {
            productsIds: ['prod-001', 'prod-002'],
          },
        },
      },
      {
        id: 'child-004',
        type: PebElementType.Grid,
        data: {
          functionLink: {
            functionType: PebFunctionType.Action,
            method: 'getProductsForBuilder',
          },
          context: {
            productsIds: ['prod-001'],
          },
        },
      },
    ];
    let sub: Subscription;

    renderer.getElementComponent.and.returnValue(element);
    checkActionMetaSpy.and.returnValue({
      test: 'test error',
      actionMeta: 'action meta error',
    });
    checkSearchStringNavigationSpy.and.returnValue({
      test: 'test error',
      searchString: 'search string error',
    });

    /**
     * argument value is null
     * element.target.element.type is PebElementType.Grid
     */
    service.setFunctions(null).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalledWith([element]);

    /**
     * all props of argument value are null
     * element.target.element.type is PebElementType.Shape
     * element.controls is null
     */
    element.target.element.type = PebElementType.Shape;
    editorStore.updateElement.and.returnValue(of(null));
    clearSpy.calls.reset();

    service.setFunctions(value).pipe(
      switchMap(obs => obs[0]),
    ).subscribe();
    selectedElements$.next([element]);
    renderer.rendered.next();

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).toHaveBeenCalledWith({
      ...element.definition,
      data: {
        ...element.definition.data,
        functionLink: null,
      },
    });
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    expect(element.target.options).toEqual(element.options);

    /**
     * element.controls.languages is null
     */
    element.controls = { languages: null };

    service.setFunctions(value).pipe(
      switchMap(obs => obs[0]),
    ).subscribe();
    selectedElements$.next([element]);
    renderer.rendered.next();

    /**
     * element.controls.languages.instance.detectChanges is set
     */
    element.controls = {
      languages: {
        instance: {
          detectChanges: jasmine.createSpy('detectChanges'),
        },
      },
    };

    service.setFunctions(value).pipe(
      switchMap(obs => obs[0]),
    ).subscribe();
    selectedElements$.next([element]);
    renderer.rendered.next();

    expect(element.controls.languages.instance.detectChanges).toHaveBeenCalled();

    /**
     * value.integration & interaction are set
     */
    value.integration = { test: 'integration' };
    value.interaction = { test: 'interaction' };

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).toHaveBeenCalledWith({
      ...element.definition,
      data: {
        ...element.definition.data,
        functionLink: {
          ...value.interaction,
          functionType: PebFunctionType.Interaction,
          integration: value.integration,
        },
      },
    });
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();

    /**
     * value.data.dataType is PebIntegrationDataType.Select
     * value.interaction is null
     */
    value.data = { dataType: PebIntegrationDataType.Select };
    value.interaction = null;

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).toHaveBeenCalledWith({
      ...element.definition,
      data: {
        ...element.definition.data,
        functionLink: {
          ...value.data,
          functionType: PebFunctionType.SelectLink,
          integration: value.integration,
        },
      },
    });
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();

    /**
     * value.data.dataType is PebIntegrationDataType.Text
     */
    value.data.dataType = PebIntegrationDataType.Text;
    editorStore.updateElement.calls.reset();

    sub = service.setFunctions(value).pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).toHaveBeenCalledWith(element, {
      ...value.data,
      functionType: PebFunctionType.Data,
      integration: value.integration,
    });
    expect(snackbarErrorService.openSnackbarError).toHaveBeenCalledWith({
      text: 'test error; search string error',
    });
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();

    sub.unsubscribe();

    /**
     * element.target.element.type is PebElementType.Grid
     * value.integration.tag is PebIntegrationTag.Products
     * value.action is null
     */
    element.target.element.type = PebElementType.Grid;
    value.integration = { tag: PebIntegrationTag.Products };
    value.action = null;
    snackbarErrorService.openSnackbarError.calls.reset();
    checkActionMetaSpy.calls.reset();

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalledWith([element]);

    /**
     * value.action.tags is null
     */
    value.action = { tags: null };

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();

    /**
     * value.action.tags is [PebIntegrationActionTag.GetList]
     * editorComponent.openProductsDialog returns []
     */
    value.action.tags = [PebIntegrationActionTag.GetList];
    editorComponent.openProductsDialog.and.returnValue(of([]));
    clearSpy.calls.reset();

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorComponent.openProductsDialog).toHaveBeenCalledWith([]);
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith({
      value,
      elements: [element],
      functionLink: {
        ...value.action,
        functionType: PebFunctionType.Action,
        integration: value.integration,
      },
      filters: [],
      productsIds: [],
    });
    expect(clearSpy).not.toHaveBeenCalled();

    /**
     * editorComponent.openProductsDialog returns mocked data
     */
    editorComponent.openProductsDialog.and.returnValue(of(['prod-001']));
    fetchSpy.calls.reset();

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(fetchSpy).toHaveBeenCalledWith({
      value,
      elements: [element],
      functionLink: {
        ...value.action,
        functionType: PebFunctionType.Action,
        integration: value.integration,
      },
      filters: [{
        field: 'id',
        fieldCondition: PebFilterConditionType.In,
        value: ['prod-001'],
      }],
      productsIds: ['prod-001'],
    });

    /**
     * value.action.tags is [PebIntegrationActionTag.GetCategoriesByProducts]
     * editorComponent.openCategoriesDialog returns []
     * element.definition.data is null
     * editorStore.page.template.children is []
     */
    value.action.tags = [PebIntegrationActionTag.GetCategoriesByProducts];
    fetchSpy.calls.reset();
    editorComponent.openProductsDialog.calls.reset();
    editorComponent.openCategoriesDialog.and.returnValue(of([]));

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).toHaveBeenCalledWith([]);
    expect(fetchSpy).toHaveBeenCalledWith({
      value,
      elements: [element],
      functionLink: {
        ...value.action,
        functionType: PebFunctionType.Action,
        integration: value.integration,
      },
      filters: [],
      categoriesIds: [],
    });
    expect(clearSpy).not.toHaveBeenCalled();

    /**
     * element.definition.data.context is null
     * editorStore.page.template.children is set
     */
    element.definition.data = { context: null };
    editorStore.page.template.children = pageTemplateChildren as any;
    editorComponent.openCategoriesDialog.calls.reset();
    fetchSpy.calls.reset();

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(editorComponent.openCategoriesDialog).toHaveBeenCalledWith([]);
    expect(fetchSpy).toHaveBeenCalledWith({
      value,
      elements: [element],
      functionLink: {
        ...value.action,
        functionType: PebFunctionType.Action,
        integration: value.integration,
      },
      filters: [{
        field: 'id',
        fieldCondition: PebFilterConditionType.In,
        value: ['prod-001', 'prod-002'],
      }],
      categoriesIds: [],
    });

    /**
     * element.definition.data.context.categoriesIds is set
     * editorComponent.openCategoriesDialog returns mocked data
     */
    element.definition.data.context = { categoriesIds: ['category-002'] };
    editorComponent.openCategoriesDialog.and.returnValue(of(['category-001', 'category-002']));
    editorComponent.openCategoriesDialog.calls.reset();
    fetchSpy.calls.reset();

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(editorComponent.openCategoriesDialog).toHaveBeenCalledWith(['category-002']);
    expect(fetchSpy).toHaveBeenCalledWith({
      value,
      elements: [element],
      functionLink: {
        ...value.action,
        functionType: PebFunctionType.Action,
        integration: value.integration,
      },
      filters: [{
        field: 'id',
        fieldCondition: PebFilterConditionType.In,
        value: ['category-001', 'category-002'],
      }],
      categoriesIds: ['category-001', 'category-002'],
    });

    /**
     * value.action.tags is [PebIntegrationActionTag.GetFilters]
     * value.action.actionData is null
     */
    value.action.tags = [PebIntegrationActionTag.GetFilters];
    value.action.actionData = null;
    editorComponent.openCategoriesDialog.calls.reset();
    fetchSpy.calls.reset();

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith({
      value,
      elements: [element],
      functionLink: {
        ...value.action,
        functionType: PebFunctionType.Action,
        integration: value.integration,
      },
      filters: [],
    });
    expect(clearSpy).not.toHaveBeenCalled();

    /**
     * value.action.actionData is set
     */
    value.action.actionData = { field: 'title' };
    fetchSpy.calls.reset();

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(fetchSpy).toHaveBeenCalledWith({
      value,
      elements: [element],
      functionLink: {
        ...value.action,
        functionType: PebFunctionType.Action,
        integration: value.integration,
      },
      filters: [{
        field: value.action.actionData.field,
      }],
    });

    /**
     * value.action.tags is [PebIntegrationActionTag.GetRecommendations]
     */
    value.action.tags = [PebIntegrationActionTag.GetRecommendations];
    fetchSpy.calls.reset();

    service.setFunctions(value).subscribe();
    selectedElements$.next([element]);

    expect(checkActionMetaSpy).not.toHaveBeenCalled();
    expect(checkSearchStringNavigationSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorComponent.openProductsDialog).not.toHaveBeenCalled();
    expect(editorComponent.openCategoriesDialog).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith({
      value,
      elements: [element],
      functionLink: {
        ...value.action,
        functionType: PebFunctionType.Action,
        integration: value.integration,
      },
      detailAction: true,
    });
    expect(clearSpy).not.toHaveBeenCalled();

  });

  it('should create action', () => {

    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    const effects = [{
      type: PebPageEffect.Update,
      target: `${PebEffectTarget.Pages}:${editorStore.page.id}`,
      payload: { contextId: 'ctx-013' },
    }];

    const action = service[`createAction`](effects);
    expect(omit(action, 'createdAt')).toEqual({
      effects,
      id: 'gid-001',
      targetPageId: editorStore.page.id,
      affectedPageIds: [editorStore.page.id],
    });
    expect(action.createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalledOnceWith('action');

  });

  it('should check action meta', () => {

    const element = {
      definition: {
        id: 'elem',
        data: null,
        children: [
          {
            id: 'child-001',
            data: {
              functionLink: {
                functionType: PebFunctionType.Data,
                property: null,
                dataType: PebIntegrationDataType.Submit,
              },
            },
          },
          {
            id: 'child-002',
            data: {
              functionLink: {
                functionType: PebFunctionType.Data,
                property: 'childProperty',
                dataType: PebIntegrationDataType.Select,
              },
            },
          },
          {
            id: 'child-003',
            data: {
              functionLink: {
                functionType: PebFunctionType.Action,
                property: 'test',
                dataType: PebIntegrationDataType.Text,
              },
            },
          },
        ],
      },
    };
    const action = {
      requestMeta: {
        test: { required: true },
        childProperty: { required: true },
        value: { required: false },
      },
    };

    /**
     * argument action is null
     */
    expect(service[`checkActionMeta`](element as any, null)).toBeNull();

    /**
     * argument action is set
     * action.requestMeta has 2 required properties: test, childProperty
     * one of element.definition.children has submit data type in function link
     */
    expect(service[`checkActionMeta`](element as any, action as any)).toEqual({
      requiredFields: 'No fields: test',
    });

    /**
     * action.requestMeta has 1 required properties: childProperty
     */
    action.requestMeta.test.required = false;

    expect(service[`checkActionMeta`](element as any, action as any)).toBeNull();

    /**
     * NONE of element.definition.children has submit data type in function link
     */
    element.definition.children[0].data.functionLink.dataType = PebIntegrationDataType.Input;

    expect(service[`checkActionMeta`](element as any, action as any)).toEqual({
      submit: 'No submit button',
    });

  });

  it('should check search string navigation', () => {

    const element = {
      definition: {
        id: 'elem',
        data: null,
      },
    };
    const data = { property: 'test' };

    /**
     * data.property is 'test'
     */
    expect(service[`checkSearchStringNavigation`](element as any, data as any)).toBeNull();

    /**
     * data.property is 'search'
     * element.definition.data is null
     */
    data.property = 'search';

    expect(service[`checkSearchStringNavigation`](element as any, data as any)).toEqual({
      link: 'No navigation link',
    });

    /**
     * element.definition.data.linkInteraction is null
     */
    element.definition.data = { linkInteraction: null };

    expect(service[`checkSearchStringNavigation`](element as any, data as any)).toEqual({
      link: 'No navigation link',
    });

    /**
     * element.definition.data.linkInteraction.type is PebInteractionType.NavigateInternal
     */
    element.definition.data.linkInteraction = { type: PebInteractionType.NavigateInternal };

    expect(service[`checkSearchStringNavigation`](element as any, data as any)).toBeNull();

  });

  it('should map to functions', () => {

    const integrationsList: any[] = [
      {
        title: 'Payever Integration 1',
        data: [
          {
            title: 'Payever Data null',
            dataType: null,
          },
          {
            title: 'Payever Data languages',
            dataType: PebIntegrationDataType.Languages,
          },
          {
            title: 'Payever Data image url',
            dataType: PebIntegrationDataType.ImageUrl,
          },
        ],
        actions: [{
          id: 'a-003',
          title: 'Get Filters Action',
          tags: [PebIntegrationActionTag.GetFilters],
        }],
        interactions: [],
      },
      {
        title: 'Payever Integration 2',
        data: [{
          title: 'Payever Data input',
          dataType: PebIntegrationDataType.Input,
        }],
        actions: [
          {
            id: 'a-001',
            title: 'Get Collections Action',
            tags: [PebIntegrationActionTag.GetCollections],
          },
          {
            id: 'a-002',
            title: 'Get Recommendations Action',
            tags: [PebIntegrationActionTag.GetRecommendations],
          },
        ],
        interactions: [{
          title: 'Payever Interaction 1',
        }]
      },
      {
        title: 'Payever Integration 3',
        data: [],
        actions: [],
        interactions: []
      },
    ];
    const actionsDataStore = {
      'a-001': {
        result: [{ field: 'test.field' }]
      },
    };

    /**
     * arguments integration & actionsDataStore are null
     */
    expect(service.mapToFunctions(null, null)).toBeUndefined();

    /**
     * argument integrations is set
     */
    expect(service.mapToFunctions(integrationsList, null)).toEqual([
      {
        title: 'integration 1',
        children: [
          {
            title: 'action',
            children: [{
              action: {
                id: 'a-003',
                title: 'Get Filters Action',
                tags: [PebIntegrationActionTag.GetFilters],
              },
              integration: integrationsList[0],
              title: 'Get all filters',
            }],
          },
          {
            title: 'data',
            children: [{
              integration: integrationsList[0],
              data: {
                title: 'Payever Data image url',
                dataType: PebIntegrationDataType.ImageUrl,
              },
              title: 'Data image url',
            }],
          },
          {
            title: 'dropdown',
            children: [{
              integration: integrationsList[0],
              data: {
                title: 'Payever Data languages',
                dataType: PebIntegrationDataType.Languages,
              },
              title: 'Data languages',
            }],
          },
        ],
      },
      {
        title: 'integration 2',
        children: [
          {
            title: 'action',
            children: [
              {
                action: {
                  id: 'a-001',
                  title: 'Get Collections Action',
                  tags: [PebIntegrationActionTag.GetCollections],
                },
                integration: integrationsList[1],
                title: 'Get Collections Action',
              },
              {
                action: {
                  id: 'a-002',
                  title: 'Get Recommendations Action',
                  tags: [PebIntegrationActionTag.GetRecommendations],
                },
                integration: integrationsList[1],
                title: 'Get Recommendations Action',
              },
              {
                interaction: {
                  title: 'Payever Interaction 1'
                },
                integration: integrationsList[1],
                title: 'Payever Interaction 1',
              },
            ],
          },
          {
            title: 'field',
            children: [{
              integration: integrationsList[1],
              data: {
                title: 'Payever Data input',
                dataType: PebIntegrationDataType.Input,
              },
              title: 'Data input',
              action: null,
            }],
          },
        ],
      },
    ]);

    /**
     * argument actionsDataStore is set
     */
    expect(service.mapToFunctions(integrationsList, actionsDataStore)[1].children[0].children[1]).toEqual({
      action: {
        id: 'a-001',
        title: 'Get Collections Action',
        tags: [PebIntegrationActionTag.GetCollections],
        actionData: { field: 'test.field' },
      },
      integration: integrationsList[1],
      title: 'Get Collections Action by test.field',
    });

  });

  it('should get filter actions', () => {

    const nextSpy = spyOn(service.actionsDataStore$, 'next');
    const data = { test: 'fetched.action.data' };

    contextApi.fetchIntegrationAction.and.returnValue(of(data));

    service.getFilterActions();

    expect(nextSpy).toHaveBeenCalledWith({ 'a-002': data });
    expect(contextApi.fetchIntegrationAction).toHaveBeenCalledWith({
      integration: integrations[1],
      action: integrations[1].actions[1],
    });

  });

  it('should fetch grid integration action', () => {

    const element = {
      definition: {
        id: 'elem',
        data: {
          colCount: 2,
          rowCount: 1,
          context: { test: 'element.ctx' },
        },
        children: [{ id: 'child-001' }],
      },
      children: [{
        id: 'child-001',
        target: {
          cdr: {
            detectChanges: jasmine.createSpy('detectChanges'),
          },
        },
      }],
      controls: null,
    };
    const functionLink: any = { functionType: PebFunctionType.ActionData };
    const value: any = { test: 'value' };
    const action: any = { id: 'a-001' };
    const page: any = {
      id: 'p-002',
      templateId: 'tpl-002',
      contextId: 'ctx-002',
      stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => ({
        ...acc,
        [screen]: `${screen.charAt(0)}-002`,
      }), {}),
    };
    const filters = [{
      field: 'id',
      fieldCondition: PebFilterConditionType.In,
      value: ['test'],
    }];
    const productsIds = ['prod-001'];
    const categoriesIds = ['category-001'];
    const gridContext: any = { test: 'grid.ctx' };
    const createGridContextSpy = spyOn<any>(service, 'createGridContext').and.returnValue(gridContext);
    const createActionSpy = spyOn<any>(service, 'createAction').and.returnValue(action);

    editorStore.commitAction.and.returnValue(of(null));

    /**
     * arguments filters, productsIds, categoriesIds, page & detailAction are NOT set
     * element.controls is null
     */
    service[`fetchGridIntegrationAction`]({
      value,
      functionLink,
      elements: [element] as any[],
    })[0].subscribe();

    expect(createGridContextSpy).toHaveBeenCalledWith(
      value,
      [],
      element.definition.data.colCount,
      element.definition.data.rowCount,
      false,
    );
    expect(createActionSpy).toHaveBeenCalledWith([
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:${editorStore.page.templateId}`,
        payload: {
          ...element.definition,
          data: {
            ...element.definition.data,
            functionLink,
            context: {
              ...element.definition.data.context,
              productsIds: [],
              categoriesIds: [],
            },
          },
          children: [],
        },
      },
      ...Object.values(PebScreen).map((screen: PebScreen) => {
        return {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${editorStore.page.stylesheetIds[screen]}`,
          payload: {
            ...element.definition.children.reduce(
              (acc, child) => {
                acc[child.id] = null;

                return acc;
              },
              {},
            ),
          },
        };
      }),
      {
        type: PebContextSchemaEffect.Update,
        target: `${PebEffectTarget.ContextSchemas}:${editorStore.page.contextId}`,
        payload: {
          [element.definition.id]: gridContext,
        },
      },
    ]);
    expect(editorStore.commitAction).toHaveBeenCalledWith(action);
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(element.children[0].target.cdr.detectChanges).not.toHaveBeenCalled();

    renderer.rendered.next();
    expect(store.dispatch.calls.allArgs()).toEqual([
      [new PebDeselectAllAction()],
      ...editorState.selectedElements.map(elId => [new PebAddToSelectionAction(elId)]) as any,
    ]);
    expect(element.children[0].target.cdr.detectChanges).toHaveBeenCalled();

    /**
     * arguments filters, productsIds, categoriesIds, page & detailAction are set
     * element.controls.gridFrame is null
     */
    element.controls = { gridFrame: null };

    service[`fetchGridIntegrationAction`]({
      value,
      functionLink,
      filters,
      productsIds,
      categoriesIds,
      page,
      detailAction: true,
      elements: [element] as any[],
    })[0].subscribe();
    renderer.rendered.next();

    expect(createGridContextSpy).toHaveBeenCalledWith(
      value,
      filters,
      element.definition.data.colCount,
      element.definition.data.rowCount,
      true,
    );
    expect(createActionSpy).toHaveBeenCalledWith([
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:${page.templateId}`,
        payload: {
          ...element.definition,
          data: {
            ...element.definition.data,
            functionLink,
            context: {
              ...element.definition.data.context,
              productsIds,
              categoriesIds,
            },
          },
          children: [],
        },
      },
      ...Object.values(PebScreen).map((screen: PebScreen) => {
        return {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
          payload: {
            ...element.definition.children.reduce(
              (acc, child) => {
                acc[child.id] = null;

                return acc;
              },
              {},
            ),
          },
        };
      }),
      {
        type: PebContextSchemaEffect.Update,
        target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
        payload: {
          [element.definition.id]: gridContext,
        },
      },
    ]);

    /**
     * element.controls.gridFrame.instance.detectChanges is set
     */
    element.controls.gridFrame = {
      instance: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
    };

    service[`fetchGridIntegrationAction`]({
      value,
      functionLink,
      elements: [element] as any[],
    })[0].subscribe();
    renderer.rendered.next();

    expect(element.controls.gridFrame.instance.detectChanges).toHaveBeenCalled();

  });

  it('should create grid context', () => {

    const colCount = 3;
    const rowCount = 2;
    const filters: any[] = [{
      field: 'id',
      fieldCondition: PebFilterConditionType.In,
      value: ['test'],
    }];
    const value = {
      integration: { test: 'integration' },
      action: { test: 'action' },
    };

    /**
     * argument detailAction is FALSE
     */
    expect(service[`createGridContext`](value as any, filters, colCount, rowCount, false)).toEqual({
      params: [
        value.integration,
        value.action,
        filters,
        [],
        { offset: 0, limit: colCount * rowCount + colCount * 4 },
        { contextParameterType: ContextParameterType.Dynamic, value: '@product-filters.data' },
        { contextParameterType: ContextParameterType.Dynamic, value: '@product-sort.data' },
      ],
      service: 'integrations',
      method: 'fetchActionWithAdditional',
    });

    /**
     * argument detailAction is TRUE
     */
    expect(service[`createGridContext`](value as any, filters, colCount, rowCount, true)).toEqual({
      params: [
        value.integration,
        value.action,
        { contextParameterType: ContextParameterType.Dynamic, value: '@products-detail.data.id' },
      ],
      service: 'integrations',
      method: 'fetchDetailActionWithAdditional',
    });

  });

  it('should clear grid context', () => {

    const element = {
      definition: {
        id: 'elem',
        data: {
          colCount: 2,
          rowCount: 2,
          context: { test: 'data.ctx' },
        },
      },
      nativeElement: { clientHeight: 800 },
      options: { scale: 2 },
      target: {
        applyStyles: jasmine.createSpy('applyStyles'),
      },
      controls: null,
    };
    const action: any = { id: 'a-001' };
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.callFake(() => `gid-00${generateIdSpy.calls.count()}`);
    const createSpy = spyOn<any>(service, 'createAction').and.returnValue(action);
    const stylesheetUpdateEffectPayload = Object.values(PebScreen).reduce((acc, screen) => ({
      ...acc,
      [screen]: {
        ...acc[screen],
        ...Array.from<any>({ length: 4 }).reduce((acc, _, i) => ({
          ...acc,
          [`gid-00${i + 1}`]: {
            backgroundColor: '#d4d4d4',
            margin: '0 0 0 0',
            width: '100%',
            height: '100%',
            gridArea: 'auto',
          },
        }), {}),
      },
    }), {
      [editorState.screen]: {
        [element.definition.id]: { gridTemplateRows: '200px 200px' },
      },
    });
    const appendElementEffect = Array.from({ length: 4 }).map((_, i) => ({
      id: `gid-00${i + 1}`,
      type: PebElementType.Shape,
      data: {
        variant: PebShapeVariant.Square,
        text: '',
      },
      children: [],
      meta: { deletable: false, still: true },
    }));
    const contextUpdateEffectPayload = Array.from<any>({ length: 4 }).reduce((acc, _, i) => ({
      ...acc,
      [`gid-00${i + 1}`]: null,
    }), {});

    editorStore.commitAction.and.returnValue(of(null));

    /**
     * element.controls is null
     */
    service[`clearGridContext`]([element])[0].pipe(
      switchMap(val => val as any),
    ).subscribe();

    expect(createSpy).toHaveBeenCalledWith([
      ...Object.entries(stylesheetUpdateEffectPayload).map(([screen, payload]) => ({
        payload,
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:${editorStore.page.stylesheetIds[screen]}`,
      })),
      {
        type: PebContextSchemaEffect.Update,
        target: `${PebEffectTarget.ContextSchemas}:${editorStore.page.contextId}`,
        payload: {
          ...contextUpdateEffectPayload,
          [element.definition.id]: null,
        },
      },
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:${editorStore.page.templateId}`,
        payload: {
          ...element.definition,
          data: {
            ...element.definition.data,
            functionLink: null,
            context: {
              ...element.definition.data.context,
              categoriesIds: [],
              productsIds: [],
            },
          },
          children: appendElementEffect,
        },
      },
    ]);
    expect(editorStore.commitAction).toHaveBeenCalledWith(action);
    expect(element.target.applyStyles).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalled();

    renderer.rendered.next();
    expect(element.target.applyStyles).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(new PebDeselectAllAction());

    /**
     * element.controls.gridFrame is null
     */
    element.controls = { gridFrame: null };

    service[`clearGridContext`]([element])[0].pipe(
      switchMap(val => val as any),
    ).subscribe();
    renderer.rendered.next();

    /**
     * element.controls.gridFrame.instance.detectChanges is set
     */
    element.controls = {
      gridFrame: {
        instance: {
          detectChanges: jasmine.createSpy('detectChanges'),
        },
      },
    };

    service[`clearGridContext`]([element])[0].pipe(
      switchMap(val => val as any),
    ).subscribe();
    renderer.rendered.next();

    expect(element.controls.gridFrame.instance.detectChanges).toHaveBeenCalled();

  });

});
