import { Component, ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import * as pebCore from '@pe/builder-core';
// tslint:disable-next-line:no-duplicate-imports
import {
  PebEditorElementInteraction,
  PebEditorState,
  PebEffectTarget,
  PebElementType,
  PebFunctionType,
  PebIntegrationDataType,
  PebInteractionType,
  PebLanguage,
  PebPageEffect,
  PebScreen,
  PebStylesheetEffect,
  PebTemplateEffect,
  PebTextVerticalAlign,
} from '@pe/builder-core';
import { PebAbstractElement } from '@pe/builder-renderer';
import { PebTextEditorService, TextEditorCommand } from '@pe/builder-text-editor';
import { omit } from 'lodash';
import Delta from 'quill-delta';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { PebEditorAccessorService, PebEditorStore } from '../../services';
import { PebEditorRenderer } from '../editor-renderer';
import { PebAbstractTextElement } from './abstract.text-element';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends PebAbstractTextElement {

  get elements() { return null; }
  get mappedStyles() { return null; }
  get verticalAlign() { return PebTextVerticalAlign.Center; }

}

describe('PebAbstractTextElement', () => {

  let component: TestComponent;
  let interactionStart$: Subject<any>;
  let editorState: jasmine.SpyObj<PebEditorState>;
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let editorRenderer: jasmine.SpyObj<PebEditorRenderer>;
  let textEditorService: jasmine.SpyObj<PebTextEditorService>;
  let interactionCompleted$: Subject<any>;
  let editorComponent: { commands$: Subject<any> };
  let selectedElements$: Subject<any[]>;
  let dimensions$: BehaviorSubject<{ width: number; height: number; }>;
  let elemRef: ElementRef;

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    elemRef = new ElementRef(document.createElement('div'));

    selectedElements$ = new Subject();
    spyOnProperty(TestComponent.prototype, 'selectedElements$').and.returnValue(selectedElements$);

    dimensions$ = new BehaviorSubject({ width: 500, height: 350 });
    const textEditorServiceSpy = jasmine.createSpyObj<PebTextEditorService>('PebTextEditorService', [
      'dispatch',
      'setRedoStack',
      'setUndoStack',
      'selectElement',
      'applyStyles',
    ], {
      dimensions$,
      limits$: of({ width: 1024, height: 720 }),
      styles$: of({ color: '#333333' }) as any,
    });

    interactionStart$ = new Subject();
    interactionCompleted$ = new Subject();
    const editorStateMock = {
      interactionStart$,
      interactionCompleted$,
      textEditorActive: {},
      scale$: of(2),
    };

    const editorRendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', [
      'getElementComponent',
    ]);

    const editorStoreMock = {
      page: {
        id: 'p-001',
        templateId: 'tpl-001',
        stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => {
          acc[screen] = `${screen.slice(0, 1)}-001`;

          return acc;
        }, {}),
      },
      commitAction: jasmine.createSpy('commitAction'),
    };

    editorComponent = { commands$: new Subject() };

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      providers: [
        { provide: PebTextEditorService, useValue: textEditorServiceSpy },
        { provide: PebEditorState, useValue: editorStateMock },
        { provide: PebEditorRenderer, useValue: editorRendererSpy },
        { provide: PebEditorStore, useValue: editorStoreMock },
        { provide: PebEditorAccessorService, useValue: { editorComponent: null } },
      ],
    }).compileComponents().then(() => {

      const mockObject: any = {};

      component = new TestComponent(
        null,
        null,
        mockObject,
        null,
        null,
        null,
        null,
        mockObject,
        mockObject,
        elemRef,
        mockObject,
        TestBed,
        mockObject,
        mockObject,
        mockObject,
        mockObject,
        mockObject,
        'browser',
        mockObject,
      );

      editorState = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;
      editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
      editorRenderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;
      textEditorService = TestBed.inject(PebTextEditorService) as jasmine.SpyObj<PebTextEditorService>;

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should set select$ on construct', () => {

    const elementsMock: any[] = [
      {},
      { id: 'elem-001' },
      { id: 'elem-002' },
      { id: 'elem-003' },
    ];

    component.element = elementsMock[2];
    component.select$.subscribe(elem => expect(elem).toEqual(elementsMock[2]));

    selectedElements$.next(elementsMock);
    selectedElements$.next(elementsMock); // emitted again to cover distinctUntilChanged

  });

  it('should set deselect$ on construct', () => {

    const elementsMock: any[] = [
      { id: 'elem-001' },
      { id: 'elem-002' },
    ];

    component.element = elementsMock[1];
    component.deselect$.subscribe(elem => expect(elem).toEqual(elementsMock.slice(0, 1)));

    selectedElements$.next(elementsMock);
    selectedElements$.next(elementsMock.slice(0, 1));

  });

  it('should set activate$ on construct', () => {

    const elementMock = {
      id: 'elem-001',
      type: PebElementType.Shape,
      data: null,
    };

    component.element = elementMock;
    component.activate$.subscribe(result => expect(result).toBe(true));
    component[`setActive$`].next(true);

    /**
     * element.data is null
     */
    selectedElements$.next([elementMock]);

    /**
     * element.data.functionLink is null
     */
    elementMock.data = { functionLink: null };
    component[`setActive$`].next(true);

    /**
     * elementMock.data.functionLink.dataType is PebIntegrationDataType.Text
     */
    elementMock.data.functionLink = {
      functionType: PebFunctionType.Data,
      dataType: PebIntegrationDataType.Text,
    };
    component[`setActive$`].next(true);

  });

  it('should set deactivate$ on construct', () => {

    const elementMock = {
      id: 'elem',
      type: PebElementType.Shape,
      data: null,
    };

    component.element = elementMock;
    component.deactivate$.subscribe(val => expect(val).toBe(false));
    component[`setActive$`].next(true);
    component[`setActive$`].next(false);

  });

  it('should set editorEnabled$ on construct', () => {

    const elementMock = {
      id: 'elem-001',
      type: PebElementType.Shape,
      data: null,
    };

    component.element = elementMock;
    component.editorEnabled$.subscribe();

    /**
     * observable starts with FALSE
     */
    expect(editorState.textEditorActive).toBeNull();
    expect(textEditorService.dispatch).toHaveBeenCalledWith(TextEditorCommand.clearHistory);
    expect(textEditorService.setRedoStack).toHaveBeenCalledWith([]);
    expect(textEditorService.setUndoStack).toHaveBeenCalledWith([]);

    /**
     * emit component.activate$
     */
    textEditorService.dispatch.calls.reset();
    textEditorService.setRedoStack.calls.reset();
    textEditorService.setUndoStack.calls.reset();

    component[`setActive$`].next(true);

    expect(editorState.textEditorActive).toEqual(textEditorService);
    expect(textEditorService.dispatch).not.toHaveBeenCalled();
    expect(textEditorService.setRedoStack).not.toHaveBeenCalled();
    expect(textEditorService.setUndoStack).not.toHaveBeenCalled();

  });

  it('should set/get options', () => {

    const getSpy = spyOnProperty(component, 'options').and.callThrough();
    const opsMock: any = {
      ops: [{ test: 'ops' }],
    };
    const changesNextSpy = spyOn(component.contentChanges$, 'next');
    const contentNextSpy = spyOn(component.content$, 'next');
    const styles = {
      width: 500,
      height: 350,
    };
    const options = {
      screen: PebScreen.Desktop,
      locale: PebLanguage.English,
    };

    spyOnProperty(component, 'isContentChanged').and.returnValue(true);
    spyOn(component, 'getTextContent').and.returnValue(opsMock);

    /**
     * setting value as {} (empty object)
     * component.isContentChanged is TRUE
     * component.rendererOptions is null
     */
    component.styles = styles;
    component[`rendererOptions`] = null;
    component.options = {} as any;

    expect(component[`rendererOptions`]).toEqual({} as any);
    expect(component.options).toEqual({} as any);
    expect(getSpy).toHaveBeenCalled();
    expect(changesNextSpy).not.toHaveBeenCalled();
    expect(component.content).toEqual(opsMock);
    expect(component[`originalWidth`]).toEqual(styles.width);
    expect(component[`originalHeight`]).toEqual(styles.height);
    expect(component[`originalVerticalAlign`]).toEqual(PebTextVerticalAlign.Center);
    expect(component.originalContent.ops).toEqual(opsMock.ops);
    expect(contentNextSpy).toHaveBeenCalledWith(opsMock);

    /**
     * setting value as
     * {
     *  screen: PebScreen.Desktop,
     *  locale: PebLanguage.English
     * }
     */
    component[`rendererOptions`] = { screen: PebScreen.Desktop } as any;
    component.options = options as any;

    expect(changesNextSpy).toHaveBeenCalled();

  });

  it('should set textStyle$ on construct', () => {

    const elementMock = {
      id: 'elem-001',
      type: PebElementType.Shape,
      data: null,
    };

    /**
     * component.element.data is null
     */
    component.element = elementMock;
    component.textStyle$.subscribe(styles => expect(styles).toEqual({
      color: '#333333',
      verticalAlign: PebTextVerticalAlign.Center,
    }));

    /**
     * component.element.data.linkInteraction is set
     */
    elementMock.data = {
      linkInteraction: { type: PebInteractionType.CartClick },
    };

    component.textStyle$.subscribe(styles => expect(styles).toEqual({
      color: '#333333',
      verticalAlign: PebTextVerticalAlign.Center,
      link: elementMock.data.linkInteraction,
    }));

  });

  it('should get is content changed', () => {

    const originalContentMock = {
      diff: () => ({
        length: () => 10,
      }),
    };

    /**
     * component.content is null
     */
    component.content = null;
    expect(component.isContentChanged).toBe(false);

    /**
     * component.content is set
     */
    component.originalContent = originalContentMock as any;
    component.content = { ops: [{ delete: 3 }] } as any;
    expect(component.isContentChanged).toBe(true);

  });

  it('should handle text changed', () => {

    const delta: any = { ops: [{ test: true }] };

    component.onTextChanged(delta);
    expect(component.content).toEqual(delta);

  });

  it('should set text style', () => {

    const nextSpy = spyOn(component[`setTextStyle$`], 'next');
    const styles = { verticalAlign: PebTextVerticalAlign.Top };

    component.setTextStyle(styles);

    expect(nextSpy).toHaveBeenCalledWith(styles);

  });

  it('should deactivate', () => {

    const nextSpy = spyOn(component[`setActive$`], 'next');

    component.deactivate();

    expect(nextSpy).toHaveBeenCalledWith(false);

  });

  it('should handle ng after view init', fakeAsync(() => {

    const elementMock = {
      id: 'elem-001',
      type: PebElementType.Shape,
      data: null,
    };
    const applyStylesSpy = spyOn(component, 'applyStyles');
    const effectsSpy = spyOnProperty(component, 'effects').and.returnValue([]);
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    const effectsMock = [{
      type: PebPageEffect.Update,
      target: 'target',
      payload: { test: 'payload' },
    }];
    const contentMock: any = {
      ops: [{ test: 'ops' }],
    };
    const editorEnabled$ = new BehaviorSubject(false);
    const textStyleMock = {
      verticalAlign: PebTextVerticalAlign.Bottom,
      link: undefined,
    };

    spyOnProperty(component, 'isContentChanged').and.returnValue(true);
    editorRenderer.getElementComponent.and.returnValue(elementMock as any);
    editorStore.commitAction.and.returnValue(of(null));

    /**
     * editorAccessService.editorComponent is null
     * component.element.data is null
     */
    component.element = elementMock;
    component.content = contentMock;
    component[`select$` as any] = of(elementMock);
    component[`deactivate$` as any] = of(true);
    component[`rendererOptions`] = {
      screen: PebScreen.Desktop,
      scale: 1,
      locale: PebLanguage.English,
      interactions: true,
    };
    component.styles = {};
    component[`originalWidth`] = 1000;
    component[`originalHeight`] = 700;
    component.originalContent = null;
    component.editorEnabled$ = editorEnabled$;
    component.ngAfterViewInit();

    expect(component[`width`]).toBe(1000);
    expect(component[`height`]).toBe(700);
    expect(applyStylesSpy).toHaveBeenCalled();
    expect(editorRenderer.getElementComponent).toHaveBeenCalled();
    expect(textEditorService.selectElement).toHaveBeenCalledWith(elementMock);

    /**
     * check text selection disable
     */
    interactionStart$.next(PebEditorElementInteraction.Move);
    expect(elemRef.nativeElement).toHaveClass('disable-text-selection');

    interactionCompleted$.next(PebEditorElementInteraction.Move);
    expect(elemRef.nativeElement).not.toHaveClass('disable-text-selection');

    /**
     * check content changes
     * component.effects is []
     */
    component.contentChanges$.next();

    expect(generateIdSpy).not.toHaveBeenCalled();
    expect(editorStore.commitAction).not.toHaveBeenCalled();
    expect(component.originalContent).toBeNull();

    /**
     * component.effects is set
     */
    effectsSpy.and.returnValue(effectsMock);
    component.contentChanges$.next();

    expect(generateIdSpy).toHaveBeenCalledWith('action');
    expect(editorStore.commitAction).toHaveBeenCalled();
    expect(omit(editorStore.commitAction.calls.argsFor(0)[0], 'createdAt')).toEqual({
      effects: effectsMock,
      id: 'gid-001',
      targetPageId: editorStore.page.id,
      affectedPageIds: [editorStore.page.id],
    });
    expect(editorStore.commitAction.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(component.originalContent).toEqual(new Delta(contentMock));

    /**
     * check limits
     * component.element.data.text is null
     */
    applyStylesSpy.calls.reset();
    elementMock.data = { text: null };
    dimensions$.next({ width: 2020, height: 1410 });

    expect(component[`width`]).toBe(1010);
    expect(component[`height`]).toBe(705);
    expect(component.styles.width).toBe(1010);
    expect(component.styles.height).toBe(705);
    expect(applyStylesSpy).toHaveBeenCalled();

    /**
     * component.element.data.text is set with generic locale
     * component.styles.minWidth & minHeight are undefined
     */
    elementMock.data.text = {
      [PebScreen.Desktop]: {
        [PebLanguage.Generic]: { test: 'generic' },
      },
    };
    dimensions$.next({ width: 1920, height: 768 });

    expect(component[`width`]).toBe(960);
    expect(component[`height`]).toBe(384);
    expect(component.styles.width).toBe(960);
    expect(component.styles.height).toBe(384);

    /**
     * component.element.data.text is set with 2 locales\
     * component.styles.minWidth & minHeight are set
     */
    elementMock.data.text[PebScreen.Desktop][PebLanguage.English] = { test: 'english' };
    component.styles.minWidth = 1000;
    component.styles.minHeight = 650;
    dimensions$.next({ width: 1920, height: 768 });

    expect(component[`width`]).toBe(1000);
    expect(component[`height`]).toBe(650);
    expect(component.styles.width).toBe(1000);
    expect(component.styles.height).toBe(650);

    /**
     * check set text style
     * component.editorEnabled$ is of(false)
     * component.element.data is null
     * value.link is undefined
     */
    applyStylesSpy.calls.reset();
    component[`setTextStyle$`].next(textStyleMock);
    tick(150);
    component[`setTextStyle$`].next(textStyleMock);

    expect(applyStylesSpy).not.toHaveBeenCalled();
    expect(textEditorService.applyStyles).toHaveBeenCalledWith({ verticalAlign: textStyleMock.verticalAlign });

    /**
     * value.link is set
     */
    textStyleMock.link = { test: 'link' };
    textEditorService.applyStyles.calls.reset();
    component[`setTextStyle$`].next(textStyleMock);

    expect(elementMock.data).toEqual({
      ...elementMock.data,
      linkInteraction: textStyleMock.link,
    });
    expect(applyStylesSpy).toHaveBeenCalled();
    expect(textEditorService.applyStyles).toHaveBeenCalledWith({
      ...textStyleMock,
      link: null,
    });

    /**
     * component.element.data is null
     * component.editorEnabled$ is of(true)
     */
    applyStylesSpy.calls.reset();
    textEditorService.applyStyles.calls.reset();
    elementMock.data = null;
    editorEnabled$.next(true);
    tick(150);
    component[`setTextStyle$`].next(textStyleMock);

    expect(applyStylesSpy).not.toHaveBeenCalled();
    expect(textEditorService.applyStyles).toHaveBeenCalledWith(textStyleMock);

    /**
     * component.element.data.linkInteraction is set
     */
    elementMock.data = { linkInteraction: textStyleMock.link };
    component[`setTextStyle$`].next(textStyleMock);

    expect(elementMock.data.linkInteraction).toBeNull();
    expect(applyStylesSpy).not.toHaveBeenCalled();

    /**
     * editorAccessorService.editorComponent is set
     */
    component[`editorAccessorService`].editorComponent = editorComponent as any;
    component.ngAfterViewInit();

    tick(150);

    editorComponent.commands$.next({ type: 'undo' });
    expect(textEditorService.dispatch).toHaveBeenCalledOnceWith(TextEditorCommand.undo);

    editorComponent.commands$.next({ type: 'redo' });
    expect(textEditorService.dispatch).toHaveBeenCalledWith(TextEditorCommand.redo);

  }));

  it('should handle ng destroy', () => {

    const superSpy = spyOn(PebAbstractElement.prototype, 'ngOnDestroy');
    const nextSpy = spyOn(component.contentChanges$, 'next');
    const changedSpy = spyOnProperty(component, 'isContentChanged').and.returnValue(false);

    /**
     * component.isContentChanged is FALSE
     */
    changedSpy.and.returnValue(false);

    component.ngOnDestroy();

    expect(nextSpy).not.toHaveBeenCalled();
    expect(superSpy).toHaveBeenCalled();

    /**
     * component.isContentChanged is TRUE
     */
    changedSpy.and.returnValue(true);

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();

  });

  it('should get effects', () => {

    const elementMock = {
      id: 'elem-001',
      type: PebElementType.Shape,
      data: null,
    };
    const contentMock = {
      ops: [{ insert: 'test' }],
    };

    /**
     * component.options.locale is NOT equal to component.options.defaultLocale
     * component.element.data is null
     * component.width is equal to component.originalWidth
     * component.height is equal to component.originalHeight
     * component.verticalAlign is equal to component.originalVerticalAlign
     */
    component.content = contentMock as any;
    component.element = elementMock;
    component[`rendererOptions`] = {
      screen: PebScreen.Desktop,
      scale: 2,
      locale: PebLanguage.English,
      interactions: true,
      defaultLocale: PebLanguage.German,
    };
    component[`width`] = component[`originalWidth`] = 1000;
    component[`height`] = component[`originalHeight`] = 500;
    component[`originalVerticalAlign`] = component.verticalAlign;

    expect(component.effects).toEqual([{
      type: PebTemplateEffect.UpdateElement,
      target: `${PebEffectTarget.Templates}:${editorStore.page.templateId}`,
      payload: elementMock,
    }]);

    /**
     * component.element.data.text is null
     * component.element.data.functionLink is integration only
     * component.options.locale is equal to component.options.defaultLocale
     * component.width is NOT equal to component.originalWidth
     * component.height is NOT equal to component.originalHeight
     * component.verticalAlign is NOT equal to component.originalVerticalAlign
     */
    elementMock.data = {
      text: null,
      functionLink: {
        integration: { id: 'i-001' },
      },
    };

    component[`rendererOptions`].defaultLocale = PebLanguage.English;
    component[`width`] = 1920;
    component[`height`] = 900;
    component[`originalVerticalAlign`] = PebTextVerticalAlign.Top;

    expect(component.effects).toEqual([
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:${editorStore.page.templateId}`,
        payload: elementMock,
      },
      {
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:${editorStore.page.stylesheetIds[PebScreen.Desktop]}`,
        payload: {
          [elementMock.id]: {
            width: 1920,
            height: 900,
            verticalAlign: PebTextVerticalAlign.Center,
          },
        },
      },
    ]);
    expect(elementMock.data.text).toEqual({
      [PebScreen.Desktop]: {
        [PebLanguage.Generic]: contentMock,
        [PebLanguage.English]: contentMock,
      },
    });

    /**
     * component.element.data.text is set with generic locale
     * component.element.data.functionLink.integration is null
     * component.options.locale is equal to component.options.defaultLocale
     */
    elementMock.data.text = {
      [PebScreen.Desktop]: {
        [PebLanguage.Generic]: { test: 'generic' },
      },
    };
    elementMock.data.functionLink = {
      functionType: PebFunctionType.Data,
      dataType: PebIntegrationDataType.Text,
      integration: null,
    };

    component.options.defaultLocale = PebLanguage.Chinese;
    expect(component.effects).toEqual([
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:${editorStore.page.templateId}`,
        payload: elementMock,
      },
      {
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:${editorStore.page.stylesheetIds[PebScreen.Desktop]}`,
        payload: {
          [elementMock.id]: {
            width: 1920,
            height: 900,
            verticalAlign: PebTextVerticalAlign.Center,
          },
        },
      },
    ]);
    expect(elementMock.data.text).toEqual({
      [PebScreen.Desktop]: {
        [PebLanguage.Generic]: contentMock,
        [PebLanguage.English]: contentMock,
      },
    });

    /**
     * component.element.data.text is set with 2 locales
     * component.element.data.functionLink.integration is set
     */
    elementMock.data.text = {
      [PebScreen.Desktop]: {
        [PebLanguage.Generic]: { test: 'generic' },
        [PebLanguage.English]: { test: 'english' },
      },
    };
    elementMock.data.functionLink.integration = { type: PebInteractionType.CartClick };

    expect(component.effects).toEqual([
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:${editorStore.page.templateId}`,
        payload: elementMock,
      },
      {
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:${editorStore.page.stylesheetIds[PebScreen.Desktop]}`,
        payload: {
          [elementMock.id]: {
            width: 1920,
            height: 900,
            verticalAlign: PebTextVerticalAlign.Center,
          },
        },
      },
    ]);
    expect(contentMock.ops[0].insert).toEqual('');

  });

});
