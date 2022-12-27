import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of, Subject } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import {
  PebActionAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebEditorState,
  PebEffectTarget,
  PebElementType,
  PebInteractionType,
  PebMediaService,
  PebMotionDelivery,
  PebMotionDirection,
  PebMotionEvent,
  PebMotionEventType,
  PebMotionTextDelivery,
  PebMotionType,
  PebShopEffect,
} from '@pe/builder-core';
import { PebEditor } from '@pe/builder-main-editor';
import { PebEditorAccessorService, PebEditorRenderer, PebEditorStore, SnackbarErrorService } from '@pe/builder-shared';
import { SnackbarService } from '@pe/snackbar';

import { PebEditorMotionPlugin } from './motion.plugin';

describe('PebEditorMotionPlugin', () => {

  let plugin: PebEditorMotionPlugin;
  let editorComponent: jasmine.SpyObj<PebEditor>;
  let state: {
    singleSelectedElement$: Subject<string>;
    selectionChanged$: jasmine.Spy;
    animating: boolean;
  };
  let renderer: {
    rendered: Subject<void>;
    getElementComponent: jasmine.Spy;
  };
  let editorStore: {
    page$: Subject<any>;
    page: {
      template: { id: string };
    };
    snapshot: {
      application: {
        data: {
          snackbars: { [key in PebInteractionType]?: { [id: string]: any } };
        },
      },
    },
    updateElement: jasmine.Spy;
  };
  let logger: { log: jasmine.Spy; };

  beforeEach(() => {

    editorComponent = jasmine.createSpyObj<PebEditor>('PebEditor', ['openSidebarMotion']);

    state = {
      singleSelectedElement$: new Subject(),
      selectionChanged$: jasmine.createSpy('selectionChanged$').and.returnValue(of(null)),
      animating: null,
    };

    renderer = {
      rendered: new Subject(),
      getElementComponent: jasmine.createSpy('getElementComponent'),
    };

    editorStore = {
      page$: new Subject(),
      page: null,
      snapshot: {
        application: {
          data: null,
        },
      },
      updateElement: jasmine.createSpy('updateElement'),
    };

    logger = { log: jasmine.createSpy('log') };

    TestBed.configureTestingModule({
      providers: [
        PebEditorMotionPlugin,
        FormBuilder,
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorState, useValue: state },
        { provide: PebEditorRenderer, useValue: renderer },
        { provide: PebEditorStore, useValue: editorStore },
        { provide: SnackbarService, useValue: {} },
        { provide: SnackbarErrorService, useValue: {} },
        { provide: PebEditorApi, useValue: {} },
        { provide: PebMediaService, useValue: {} },
        { provide: 'PEB_ENTITY_NAME', useValue: 'entity' },
      ],
    });

    plugin = TestBed.inject(PebEditorMotionPlugin);
    plugin.logger = logger;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should handle after global init', () => {

    const initSpy = spyOn<any>(plugin, 'initMotionForm');
    const openSpy = spyOn<any>(plugin, 'openMotionSidebar').and.returnValue(of(null));
    const elementMock = {
      definition: {
        id: 'elem',
        type: PebElementType.Grid,
      },
    };

    plugin.afterGlobalInit().subscribe();

    /**
     * emit state.singleSelectedElement$ as null
     * emit editorStore.page$ as null
     * emit renderer.rendered
     * editorStore.page is null
     */
    state.singleSelectedElement$.next(null);
    editorStore.page$.next(null);
    renderer.rendered.next();

    expect(renderer.getElementComponent).not.toHaveBeenCalled();
    expect(initSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    /**
     * editorStore.page.template is null
     * emit editorStore.page$ as mocked data with prop template as null
     * emit renderer.rendered
     */
    editorStore.page = { template: null };
    editorStore.page$.next({
      template: null,
    });
    renderer.rendered.next();

    expect(renderer.getElementComponent).not.toHaveBeenCalled();
    expect(initSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    /**
     * editorStore.page.template.id is set
     * emit editorStore.page$ as mocked data with all props set
     * emit renderer.rendered
     * renderer.getElementComponent returns null
     */
    editorStore.page.template = { id: 'tpl-001' };
    editorStore.page$.next(editorStore.page);
    renderer.getElementComponent.and.returnValue(null);
    renderer.rendered.next();

    expect(renderer.getElementComponent).toHaveBeenCalledWith(editorStore.page.template.id, 0);
    expect(initSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    /**
     * emit state.singleSelectedElement$
     * renderer.getElementComponent returns mocked data
     */
    renderer.getElementComponent.and.returnValue(elementMock);
    state.singleSelectedElement$.next(elementMock.definition.id);

    expect(renderer.getElementComponent).toHaveBeenCalledWith(elementMock.definition.id, 1);
    expect(initSpy).toHaveBeenCalledWith(elementMock);
    expect(openSpy).toHaveBeenCalledWith(elementMock, elementMock.definition);

  });

  it('should init motion form', () => {

    const elementMock = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
        motion: null,
      },
      buildIn: null,
      action: null,
      buildOut: null,
    };

    /**
     * elementCmp.definition.type is PebElementType.Shape
     * elementCmp.definition.motion is null
     */
    plugin[`initMotionForm`](elementMock as any);

    expect(elementMock.buildIn.initialValue).toEqual({
      type: PebBuildInAnimationType.None,
      delay: 0,
      duration: 1,
      order: 1,
      delivery: PebMotionDelivery.AtOnce,
      event: PebMotionEvent.OnLoad,
      eventType: undefined,
      direction: null,
      textDelivery: null,
    });
    expect(elementMock.buildIn.form.value).toEqual({
      ...elementMock.buildIn.initialValue,
      eventType: null,
    });
    expect(elementMock.buildIn.update).toBeNull();
    expect(elementMock.buildIn.submit).toBeInstanceOf(Subject);

    expect(elementMock.action.initialValue).toEqual({
      type: PebBuildInAnimationType.None,
      delay: 0,
      duration: 1,
      order: 1,
      delivery: PebMotionDelivery.AtOnce,
      event: PebMotionEvent.None,
      eventType: PebMotionEventType.BasketFill,
      direction: null,
      textDelivery: null,
    });
    expect(elementMock.action.form.value).toEqual(elementMock.action.initialValue);
    expect(elementMock.action.update).toBeNull();
    expect(elementMock.action.submit).toBeInstanceOf(Subject);

    expect(elementMock.buildOut.initialValue).toEqual({
      type: PebBuildInAnimationType.None,
      delay: 0,
      duration: 1,
      order: 1,
      delivery: PebMotionDelivery.AtOnce,
      event: PebMotionEvent.None,
      eventType: undefined,
      direction: null,
      textDelivery: null,
    });
    expect(elementMock.buildOut.form.value).toEqual({
      ...elementMock.buildOut.initialValue,
      eventType: null,
    });
    expect(elementMock.buildOut.update).toBeNull();
    expect(elementMock.buildOut.submit).toBeInstanceOf(Subject);

    /**
     * elementCmp.definition.type is PebElementType.Text
     * elementCmp.definition.motion.buildIn & buildOut are set
     */
    elementMock.definition.type = PebElementType.Text;
    elementMock.definition.motion = {
      buildIn: {
        type: PebBuildInAnimationType.Drift,
        delay: 100,
        duration: 300,
        order: 10,
        delivery: PebMotionDelivery.Paragraph,
        event: PebMotionEvent.OnDataPoint,
        eventType: PebMotionEventType.Snackbar,
        direction: PebMotionDirection.TopToBottom,
        textDelivery: PebMotionTextDelivery.Word,
      },
      action: null,
      buildOut: {
        type: PebBuildOutAnimationType.MoveOut,
        delay: 350,
        duration: 500,
        order: 13,
        delivery: PebMotionDelivery.HighlightedParagraph,
        event: PebMotionEvent.OnClick,
        eventType: PebMotionEventType.Snackbar,
        direction: null,
        textDelivery: PebMotionTextDelivery.Character,
      },
    };

    plugin[`initMotionForm`](elementMock as any);

    expect(elementMock.buildIn.initialValue).toEqual(elementMock.definition.motion.buildIn);
    expect(elementMock.buildIn.form.value).toEqual(elementMock.buildIn.initialValue);

    expect(elementMock.buildOut.initialValue).toEqual({
      ...elementMock.definition.motion.buildOut,
      direction: PebMotionDirection.LeftToRight,
    });
    expect(elementMock.buildOut.form.value).toEqual(elementMock.buildOut.initialValue);

  });

  it('should open motion sidebar', () => {

    const elCmp: any = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
      },
    };
    const sidebarCmpRef = {
      instance: {
        component: null,
        element: null,
      },
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
      destroy: jasmine.createSpy('destroy'),
    };
    const handleSpy = spyOn(plugin, 'handlePreview').and.returnValue(of(null));
    const trackSpy = spyOn(plugin, 'trackSidebarChanges').and.returnValue(of(null));

    editorComponent.openSidebarMotion.and.returnValue(sidebarCmpRef as any);

    plugin[`openMotionSidebar`](elCmp, elCmp.definition).subscribe();

    expect(editorComponent.openSidebarMotion).toHaveBeenCalledWith(plugin.sidebarComponent);
    expect(sidebarCmpRef.instance.component).toEqual(elCmp);
    expect(sidebarCmpRef.instance.element).toEqual(elCmp.definition);
    expect(sidebarCmpRef.changeDetectorRef.detectChanges).toHaveBeenCalled();
    expect(handleSpy).toHaveBeenCalledWith(sidebarCmpRef.instance as any, elCmp);
    expect(trackSpy).toHaveBeenCalledWith(sidebarCmpRef.instance as any, elCmp);
    expect(state.selectionChanged$).toHaveBeenCalled();
    expect(sidebarCmpRef.destroy).toHaveBeenCalled();

  });

  it('should handle preview', () => {

    const sidebar = {
      previewMotion: new EventEmitter<any>(),
    };
    const elementMock = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
        motion: null,
      },
      animating: null,
      applyAnimation: jasmine.createSpy('applyAnimation').and.returnValue(of(null)),
      applyStyles: jasmine.createSpy('applyStyles').and.returnValue(of(null)),
    };
    const animationMock = {
      type: null,
      eventType: null,
    };

    plugin.handlePreview(sidebar as any, elementMock as any).subscribe();

    /**
     * elementCmp.definition.motion is null
     */
    Object.values(PebMotionType).forEach(motionType => sidebar.previewMotion.emit({ motionType }));

    expect(state.animating).toBeNull();
    expect(elementMock.animating).toBeNull();
    expect(elementMock.applyAnimation).not.toHaveBeenCalled();
    expect(elementMock.applyStyles).not.toHaveBeenCalled();

    /**
     * elementCmp.definition.motion.buildIn & buildOut are null
     */
    elementMock.definition.motion = {
      buildIn: null,
      action: animationMock,
      buildOut: null,
    };

    sidebar.previewMotion.emit({ motionType: PebMotionType.BuildIn });
    sidebar.previewMotion.emit({ motionType: PebMotionType.BuildOut });

    expect(state.animating).toBeNull();
    expect(elementMock.animating).toBeNull();
    expect(elementMock.applyAnimation).not.toHaveBeenCalled();
    expect(elementMock.applyStyles).not.toHaveBeenCalled();

    /**
     * elementCmp.definition.motion.action is set
     * animation.eventType & type are null
     */
    sidebar.previewMotion.emit({ motionType: PebMotionType.Action });

    expect(state.animating).toBe(false);
    expect(elementMock.animating).toBe(false);
    expect(elementMock.applyAnimation).toHaveBeenCalledOnceWith(
      animationMock,
      PebMotionType.Action,
      { restore: true },
    );
    expect(elementMock.applyStyles).toHaveBeenCalled();

    /**
     * animation.eventType is PebMotionEventType.BasketFill
     */
    elementMock.applyAnimation.calls.reset();
    elementMock.applyStyles.calls.reset();
    animationMock.eventType = PebMotionEventType.BasketFill;

    sidebar.previewMotion.emit({ motionType: PebMotionType.Action });

    expect(elementMock.applyAnimation).toHaveBeenCalledOnceWith(
      animationMock,
      PebMotionType.Action,
      { restore: true },
    );
    expect(elementMock.applyStyles).toHaveBeenCalled();

    /**
     * animation.type is PebActionAnimationType.None
     */
    elementMock.applyAnimation.calls.reset();
    elementMock.applyStyles.calls.reset();
    animationMock.type = PebActionAnimationType.None;

    sidebar.previewMotion.emit({ motionType: PebMotionType.Action });

    expect(elementMock.applyAnimation).toHaveBeenCalledOnceWith(
      animationMock,
      PebMotionType.Action,
      { restore: true },
    );
    expect(elementMock.applyStyles).toHaveBeenCalled();

    /**
     * animation.type is PebActionAnimationType.Move
     */
    elementMock.applyAnimation.calls.reset();
    elementMock.applyStyles.calls.reset();
    animationMock.type = PebActionAnimationType.Move;

    sidebar.previewMotion.emit({ motionType: PebMotionType.Action });

    expect(elementMock.applyAnimation.calls.allArgs()).toEqual([
      [animationMock, PebMotionType.Action, { restore: true }],
      [{
        type: PebBuildOutAnimationType.MoveOut,
        eventType: PebMotionEventType.BasketFill,
      }, PebMotionType.BuildOut, { restore: true }],
      [{
        type: PebBuildInAnimationType.MoveIn,
        eventType: PebMotionEventType.BasketFill,
      }, PebMotionType.BuildIn, { restore: false }],
    ]);
    expect(elementMock.applyStyles).toHaveBeenCalled();

  });

  it('should track sidebar changes', () => {

    const sidebar = {
      changeMotion: new EventEmitter<any>(),
    };
    const elementMock = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
        motion: null,
      },
    };
    const motionMock = {
      buildIn: { type: PebBuildInAnimationType.Blur },
      action: { type: PebActionAnimationType.Dissolve },
      buildOut: { type: PebBuildOutAnimationType.MoveOut },
    };

    editorStore.updateElement.and.returnValue(of(null));

    plugin.trackSidebarChanges(sidebar as any, elementMock as any).subscribe();

    /**
     * elementCmp.definition.type is PebElementType.Shape
     */
    sidebar.changeMotion.emit(motionMock);

    expect(elementMock.definition.motion).toEqual(motionMock);
    expect(editorStore.updateElement).toHaveBeenCalledWith({
      ...elementMock.definition,
      motion: motionMock,
    }, []);

    /**
     * editorStore.snapshot.application.data.snackbars is set as
     * { [PebInteractionType.CartClick]: {} }
     */
    editorStore.snapshot.application.data = {
      snackbars: { [PebInteractionType.CartClick]: {} },
    };
    sidebar.changeMotion.emit(motionMock);

    expect(editorStore.updateElement.calls.mostRecent().args[1]).toEqual([]);

    /**
     * editorStore.snapshot.application.data.snackbars[PebInteractionType.CartClick][elementCmp.definition.id]
     */
    editorStore.snapshot.application.data.snackbars[PebInteractionType.CartClick] = {
      [elementMock.definition.id]: {
        element: {
          motion: null,
        },
      },
    };
    sidebar.changeMotion.emit(motionMock);

    expect(editorStore.updateElement.calls.mostRecent().args[1]).toEqual([{
      type: PebShopEffect.UpdateData,
      target: PebEffectTarget.Shop,
      payload: {
        snackbars: {
          [PebInteractionType.CartClick]: {
            [elementMock.definition.id]: {
              element: {
                motion: motionMock,
              },
            },
          },
        },
      },
    }]);

  });

  it('should get order count', () => {

    const elementMock = {
      parent: null,
    };
    const childrenMock = [
      { definition: null },
      {
        definition: {
          motion: {
            [PebMotionType.BuildIn]: { type: PebBuildInAnimationType.Blur, order: 2 },
            [PebMotionType.Action]: { type: PebActionAnimationType.Move, order: 3 },
            [PebMotionType.BuildOut]: { type: PebBuildOutAnimationType.Dissolve, order: 1 },
          },
        },
      },
      {
        definition: {
          motion: {
            [PebMotionType.BuildIn]: { type: PebBuildInAnimationType.MoveIn, order: 1 },
            [PebMotionType.Action]: null,
            [PebMotionType.BuildOut]: { type: PebBuildOutAnimationType.None, order: 3 },
          },
        },
      },
    ];

    /**
     * elementCmp.parent is null
     */
    expect(plugin.orderCount(elementMock as any)).toBeUndefined();

    /**
     * elementCmp.parent.children is null
     */
    elementMock.parent = { children: null };
    expect(plugin.orderCount(elementMock as any)).toBeUndefined();

    /**
     * elementMock.parent.children is set
     */
    elementMock.parent.children = childrenMock;
    expect(plugin.orderCount(elementMock as any)).toBe(4);

  });

});
