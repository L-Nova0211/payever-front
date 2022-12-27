import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject, Subscription } from 'rxjs';

import * as pebCore from '@pe/builder-core';
import {
  PebEditorState,
  PebEffectTarget,
  PebElementType,
  PebFunctionType,
  PebIntegrationTag,
  PebInteractionType,
  PebPageType,
  PebPageVariant,
  PebTemplateEffect,
  PebTextVerticalAlign,
} from '@pe/builder-core';

import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebEditorStore } from '@pe/builder-services';

import { PebLinkFormService } from './link-form.service';

describe('PebLinkFormService', () => {

  let service: PebLinkFormService;
  let editorStore: {
    page: {
      id: string;
      templateId: string;
    };
    snapshot$: Subject<any>;
    commitAction: jasmine.Spy;
  };
  let renderer: jasmine.SpyObj<PebEditorRenderer>;
  let selectedElements$: Subject<any[]>;

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  beforeEach(() => {

    selectedElements$ = new Subject();
    spyOnProperty(PebLinkFormService.prototype, 'selectedElements$').and.returnValue(selectedElements$);

    editorStore = {
      page: {
        id: 'p-001',
        templateId: 'tpl-001',
      },
      snapshot$: new Subject(),
      commitAction: jasmine.createSpy('commitAction'),
    };

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', ['getElementComponent']);

    TestBed.configureTestingModule({
      providers: [
        PebLinkFormService,
        { provide: PebEditorState, useValue: {} },
        { provide: PebEditorStore, useValue: editorStore },
        { provide: PebEditorRenderer, useValue: rendererSpy },
      ],
    });

    service = TestBed.inject(PebLinkFormService);
    renderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set elements$ on construct', () => {

    const nextSpy = spyOn(service.lastSelectedElements$, 'next');
    const childrenMock = {
      'child-001': {
        id: 'child-001',
        type: PebElementType.Shape,
      },
      'child-002': {
        id: 'child-002',
        type: PebElementType.Video,
      },
    };
    const elementsMock = {
      'elem-001': {
        id: 'elem-001',
        type: PebElementType.Video,
      },
      'elem-002': {
        id: 'elem-002',
        type: PebElementType.Shape,
      },
      'elem-003': {
        id: 'elem-003',
        type: PebElementType.Grid,
        data: { functionLink: null },
        children: Object.values(childrenMock),
      },
      'elem-004': {
        id: 'elem-004',
        type: PebElementType.Grid,
        data: {
          functionLink: {
            functionType: PebFunctionType.Action,
            tags: [],
            integration: { tag: PebIntegrationTag.Contact },
          },
        },
      },
      'elem-005': {
        id: 'elem-005',
        type: PebElementType.Grid,
        data: {
          functionLink: {
            functionType: PebFunctionType.Action,
            tags: [],
            integration: { tag: PebIntegrationTag.Products },
          },
        },
      },
      'elem-006': {
        id: 'elem-006',
        type: PebElementType.Grid,
        data: {
          functionLink: {
            functionType: PebFunctionType.Data,
          },
        },
      },
    };
    let elements: any[];

    renderer.getElementComponent.and.callFake((id: string) => elementsMock[id] ?? childrenMock[id] ?? null);

    service.elements$.subscribe(res => elements = res);
    selectedElements$.next(Object.values(elementsMock));

    expect(elements).toEqual([
      elementsMock['elem-002'],
      childrenMock['child-001'],
      elementsMock['elem-005'],
    ]);
    expect(renderer.getElementComponent.calls.allArgs()).toEqual([
      ['elem-002'],
      ['child-001'],
      ['elem-005'],
    ]);
    expect(nextSpy).toHaveBeenCalledWith(elements);

  });

  it('should set textStyles$ on construct', () => {

    const textStyle = {
      color: '#333333',
      link: null,
    };
    const elementMock = {
      id: 'elem-001',
      type: PebElementType.Shape,
      target: {
        textStyle$: new BehaviorSubject(textStyle),
      },
    };
    let result: any;

    renderer.getElementComponent.and.returnValue(elementMock as any);

    /**
     * link in observable element.target.textStyles$ is null
     */
    service.textStyle$.subscribe(res => result = res);
    selectedElements$.next([elementMock]);

    expect(result).toBeNull();

    /**
     * link in observable element.target.textStyles$ is set as object
     */
    textStyle.link = {
      type: PebInteractionType.NavigateInternal,
      payload: 'url/internal',
    };
    elementMock.target.textStyle$.next(textStyle);

    expect(result).toEqual(textStyle.link);

    /**
     * link in observable element.target.textStyles$ is set as array
     */
    textStyle.link = [
      null,
      {
        type: PebInteractionType.NavigateInternal,
        payload: 'url/internal',
      },
      null,
      {
        type: PebInteractionType.NavigateInternal,
        payload: 'url/internal',
      },
      {
        type: PebInteractionType.NavigateExternal,
        payload: 'url/external',
      },
    ];
    elementMock.target.textStyle$.next(textStyle);

    expect(result).toEqual([
      null,
      {
        type: PebInteractionType.NavigateInternal,
        payload: 'url/internal',
      },
      {
        type: PebInteractionType.NavigateExternal,
        payload: 'url/external',
      },
    ]);

  });

  it('should set routes$ on construct', () => {

    const pages = {
      'p-001': {
        id: 'p-001',
        name: 'Page 1',
        type: PebPageType.Replica,
        variant: PebPageVariant.Product,
      },
      'p-002': {
        id: 'p-002',
        name: 'Page 2',
        type: PebPageType.Master,
        variant: PebPageVariant.Default,
      },
      'p-003': {
        id: 'p-003',
        name: 'Page 3',
        type: PebPageType.Replica,
        variant: PebPageVariant.Default,
      },
    };
    const snapshot = {
      application: null,
      pages: Object.values(pages),
    };
    const routing = [
      ...Object.keys(pages).map((pageId, i) => ({
        pageId,
        routeId: `r-00${i + 1}`,
        url: `pages/${pageId}`,
      })),
      {
        routeId: 'r-013',
        pageId: 'p-013',
        url: 'pages/p-013',
      },
    ];
    let result: any;

    /**
     * snapshot.application is null
     */
    service.routes$.subscribe(res => result = res);
    editorStore.snapshot$.next(snapshot);

    expect(result).toEqual({
      [PebInteractionType.NavigateInternal]: [],
      [PebInteractionType.OverlayOpenPage]: [],
    });

    /**
     * snapshot.application.routing is set
     */
    snapshot.application = { routing };
    editorStore.snapshot$.next(snapshot);

    expect(result).toEqual({
      [PebInteractionType.NavigateInternal]: [{
        name: 'pages/p-003',
        value: 'r-003',
      }],
      [PebInteractionType.OverlayOpenPage]: routing.slice(0, 3).map(r => ({
        value: r.routeId,
        name: pages[r.pageId].name,
      })),
    });

  });

  it('should set text styles', () => {

    const elementMock = {
      id: 'elem-001',
      target: {
        setTextStyle: jasmine.createSpy('setTextStyle'),
        effects: [{
          type: PebTemplateEffect.RelocateElement,
          target: `${PebEffectTarget.Templates}:${editorStore.page.templateId}`,
          payload: 'payload',
        }],
      },
      applyStyles: jasmine.createSpy('applyStyles'),
      detectChanges: jasmine.createSpy('detectChanges'),
    };
    const styles = {
      color: '#333333',
      verticalAlign: null,
    };
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    let sub: Subscription;

    editorStore.commitAction.and.returnValue(of(null));

    /**
     * in argument styles verticalAlign is null
     * argument commitAction is FALSE as default
     */
    sub = service.setTextStyles(styles).subscribe();
    service.lastSelectedElements$.next([elementMock] as any[]);

    expect(elementMock.target.setTextStyle).toHaveBeenCalledWith(styles);
    expect(elementMock.applyStyles).not.toHaveBeenCalled();
    expect(elementMock.detectChanges).not.toHaveBeenCalled();
    expect(editorStore.commitAction).not.toHaveBeenCalled();
    expect(generateIdSpy).not.toHaveBeenCalled();

    /**
     * in argument styles verticalAlign is set
     * argument commitAction is TRUE
     */
    sub.unsubscribe();
    styles.verticalAlign = PebTextVerticalAlign.Top;

    sub = service.setTextStyles(styles, true).subscribe();

    expect(elementMock.applyStyles).toHaveBeenCalled();
    expect(elementMock.detectChanges).toHaveBeenCalled();
    expect(editorStore.commitAction).toHaveBeenCalled();
    let arg = editorStore.commitAction.calls.argsFor(0)[0];
    delete arg.createdAt;
    expect(arg).toEqual({
      effects: elementMock.target.effects,
      id: 'gid-001',
      targetPageId: editorStore.page.id,
      affectedPageIds: [editorStore.page.id],
    } as any);
    expect(generateIdSpy).toHaveBeenCalledOnceWith('action');

  });

});
