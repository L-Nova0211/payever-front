import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { of, Subject, Subscription, throwError } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import {
  MediaType,
  PebEditorState,
  PebElementType,
  PebMediaService,
  PebScreen,
  PebShopContainer,
} from '@pe/builder-core';
import {
  AbstractEditElementPlugin,
  FillType,
  PebEditorRenderer,
  PebEditorStore,
  SnackbarErrorService,
  VideoSize,
} from '@pe/builder-shared';
import { SnackbarService } from '@pe/snackbar';

import { PebEditorShapePlugin } from './shape.plugin';

describe('PebEditorShapePlugin', () => {

  let plugin: PebEditorShapePlugin;
  let renderer: jasmine.SpyObj<PebEditorRenderer>;
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let mediaService: jasmine.SpyObj<PebMediaService>;
  let snackbarService: jasmine.SpyObj<SnackbarService>;
  let state: {
    screen: PebScreen,
    screen$: Subject<PebScreen>;
    selectionChanged$: jasmine.Spy;
    selectedElements$: Subject<string[]>;
    selectedGridCells: any[];
  };

  beforeAll(() => {

  });

  beforeEach(() => {

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', ['getElementComponent'], {
      rendered: of(null),
      destroyed$: new Subject(),
    });

    const editorStoreSpy = jasmine.createSpyObj<PebEditorStore>('PebEditorStore', [
      'updateElement',
      'updateElementKit',
    ]);

    state = {
      screen: PebScreen.Desktop,
      screen$: new Subject(),
      selectionChanged$: jasmine.createSpy('selectionChanged$').and.returnValue(of(null)),
      selectedElements$: new Subject(),
      selectedGridCells: null,
    };

    const mediaServiceSpy = jasmine.createSpyObj<PebMediaService>('PebMediaService', [
      'uploadVideo',
    ]);

    const snackbarServiceSpy = jasmine.createSpyObj<SnackbarService>('SnackbarService', ['toggle']);

    TestBed.configureTestingModule({
      providers: [
        PebEditorShapePlugin,
        FormBuilder,
        { provide: PebEditorRenderer, useValue: rendererSpy },
        { provide: PebEditorStore, useValue: editorStoreSpy },
        { provide: SnackbarErrorService, useValue: {} },
        { provide: PebEditorState, useValue: state },
        { provide: SnackbarService, useValue: snackbarServiceSpy },
        { provide: PebEditorApi, useValue: {} },
        { provide: PebMediaService, useValue: mediaServiceSpy },
        { provide: 'PEB_ENTITY_NAME', useValue: {} },
      ],
    });

    plugin = TestBed.inject(PebEditorShapePlugin);
    renderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;
    editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
    mediaService = TestBed.inject(PebMediaService) as jasmine.SpyObj<PebMediaService>;
    snackbarService = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should handle after global init', () => {

    const ngZone = {
      onStable: of(true),
    };
    const handleSpies = [
      spyOn<any>(plugin, 'handleMultipleSelected').and.returnValue(of(null)),
      spyOn<any>(plugin, 'handleSingleSelected').and.returnValue(of(null)),
    ];

    plugin[`ngZone` as any] = ngZone;
    plugin.afterGlobalInit().subscribe();

    handleSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());

    state.screen$.next(PebScreen.Desktop);
    handleSpies.forEach(spy => expect(spy).toHaveBeenCalled());

  });

  it('should init element forms', () => {

    const elCmp = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
      },
      styles: {
        color: '#333333',
      },
    };
    const superSpy = spyOn(AbstractEditElementPlugin.prototype, 'initElementForms');
    const initSpies = [
      spyOn<any>(plugin, 'initPositionForm'),
      spyOn<any>(plugin, 'initProportionDimensionsForm'),
      spyOn<any>(plugin, 'initBackgroundForm'),
      spyOn<any>(plugin, 'initOpacityForm'),
      spyOn<any>(plugin, 'initVideoForm'),
      spyOn<any>(plugin, 'initRadiusForm'),
      spyOn<any>(plugin, 'initBorderForm'),
      spyOn<any>(plugin, 'initShadowForm'),
    ];

    plugin.initElementForms(elCmp as any);

    initSpies.forEach(spy => expect(spy).toHaveBeenCalledWith(elCmp));
    expect(plugin.behaviourState.activeElement).toEqual(elCmp as any);
    expect(plugin.behaviourState.initialElement).toEqual({
      element: elCmp.definition,
      styles: {
        ...elCmp.styles,
        opacity: 1,
      },
    });
    expect(superSpy).toHaveBeenCalled();

  });

  it('should handle forms', () => {

    const elCmp: any = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
      },
    };
    const sidebarRef: any = {
      instance: { test: 'sidebar' },
    };
    const handleSpies = [
      spyOn<any>(plugin, 'handleBackgroundForm'),
      spyOn<any>(plugin, 'handleBackgroundFillType'),
      spyOn<any>(plugin, 'handleRadiusForm'),
      spyOn<any>(plugin, 'handleVideoForm'),
      spyOn<any>(plugin, 'handlePositionForm'),
      spyOn<any>(plugin, 'handleProportionDimensionsForm'),
      spyOn<any>(plugin, 'handleOpacityForm'),
      spyOn<any>(plugin, 'handleShadowForm'),
      spyOn<any>(plugin, 'handleBorderForm'),
    ];

    handleSpies.forEach(spy => spy.and.returnValue(of(null)));

    plugin[`handleForms`](elCmp, sidebarRef).subscribe();

    handleSpies.filter(spy => spy.length === 2).forEach(spy => expect(spy).toHaveBeenCalledWith(elCmp, sidebarRef));
    handleSpies.filter(spy => spy.length === 1).forEach(spy => expect(spy).toHaveBeenCalledWith(elCmp));

  });

  it('should finalize forms', () => {

    const elCmp = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
      },
      styles: { color: '#333333' },
      target: {
        styles: { color: '#333333' },
      },
    };
    const sidebarRef = {
      destroy: jasmine.createSpy('destroy'),
    };
    const diffSpy = spyOn<any>(plugin, 'difference').and.callThrough();

    /**
     * elCmp.styles is equal to elCmp.target.styles
     */
    plugin.finalizeForms(elCmp as any, sidebarRef as any)();

    expect(diffSpy).toHaveBeenCalledWith(elCmp.styles, elCmp.target.styles);
    expect(editorStore.updateElementKit).not.toHaveBeenCalled();
    expect(sidebarRef.destroy).toHaveBeenCalled();

    /**
     * there is difference between elCmp.styles & elCmp.target.styles
     */
    elCmp.styles.color = '#999999';

    plugin.finalizeForms(elCmp as any, sidebarRef as any)();

    expect(editorStore.updateElementKit).toHaveBeenCalledWith(
      state.screen,
      elCmp.definition,
      { [elCmp.definition.id]: elCmp.target.styles },
    );

  });

  it('should handle single selected', () => {

    const elCmp: any = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
      },
    };
    const sidebarRef: any = { test: 'sidebar' };
    const singleSelectedSpy = spyOn<any>(plugin, 'singleElementOfTypeSelected')
      .and.returnValue(of(elCmp));
    const initSidebarSpy = spyOn<any>(plugin, 'initSidebar').and.returnValue(sidebarRef);
    const initElementFormsSpy = spyOn(plugin, 'initElementForms');
    const initAlignmentFormSpy = spyOn<any>(plugin, 'initAlignmentForm');
    const handleSpies = [
      spyOn<any>(plugin, 'handleAlignmentForm').and.returnValue(of(null)),
      spyOn<any>(plugin, 'handleForms').and.returnValue(of(null)),
    ];
    const finalizeSpy = spyOn(plugin, 'finalizeForms').and.returnValue(() => null);

    plugin[`handleSingleSelected`]().subscribe();

    expect(singleSelectedSpy).toHaveBeenCalled();
    expect(initElementFormsSpy).toHaveBeenCalledWith(elCmp);
    expect(initSidebarSpy).toHaveBeenCalledWith(elCmp);
    expect(initAlignmentFormSpy).toHaveBeenCalledWith(sidebarRef);
    handleSpies.forEach(spy => expect(spy).toHaveBeenCalledWith(elCmp, sidebarRef));
    expect(state.selectionChanged$).toHaveBeenCalled();
    expect(finalizeSpy).toHaveBeenCalledWith(elCmp, sidebarRef);

  });

  it('should handle multiple selected', () => {

    const elementsMock = {
      'elem-001': {
        definition: {
          id: 'elem-001',
          type: PebElementType.Shape,
        },
        styles: {
          color: '#333333',
          backgroundColor: '#ffffff',
          opacity: 1,
        },
        target: {
          styles: { color: '#333333' },
          cdr: {
            detectChanges: jasmine.createSpy('detectChanges'),
          },
          applyStyles: jasmine.createSpy('applyStyles'),
        },
      },
      'elem-002': {
        definition: {
          id: 'elem-002',
          type: PebElementType.Section,
        },
        styles: {},
        target: {
          styles: { color: '#333333' },
          cdr: {
            detectChanges: jasmine.createSpy('detectChanges'),
          },
          applyStyles: jasmine.createSpy('applyStyles'),
        },
      },
    };
    const sidebarRef: any = { test: 'sidebar' };
    const initElementFormsSpy = spyOn(plugin, 'initElementForms');
    const initSidebarSpy = spyOn<any>(plugin, 'initSidebar').and.returnValue(sidebarRef);
    const changes$ = new Subject<any>();
    const handleSpy = spyOn(plugin, 'handleForms').and.returnValue(changes$);
    const shadowToStringSpy = spyOn(plugin, 'shadowToString').and.callThrough();
    const selectionChanged$ = new Subject<void>();

    renderer.getElementComponent.and.callFake((id: string) => elementsMock[id] ?? null);
    state.selectionChanged$.and.returnValue(selectionChanged$);

    plugin[`handleMultipleSelected`]().subscribe();

    /**
     * emit state.selectedElements$
     * length of selected elements is 0
     */
    state.selectedElements$.next([]);

    expect(renderer.getElementComponent).not.toHaveBeenCalled();
    expect(initElementFormsSpy).not.toHaveBeenCalled();
    expect(initSidebarSpy).not.toHaveBeenCalled();
    expect(handleSpy).not.toHaveBeenCalled();
    expect(shadowToStringSpy).not.toHaveBeenCalled();
    expect(state.selectionChanged$).not.toHaveBeenCalled();

    /**
     * length of selected elements is 2
     * one of elements has type PebElementType.Section
     */
    state.selectedElements$.next(Object.keys(elementsMock));

    expect(renderer.getElementComponent.calls.allArgs()).toEqual(Object.keys(elementsMock).map(id => [id]));
    expect(initElementFormsSpy).not.toHaveBeenCalled();
    expect(initSidebarSpy).not.toHaveBeenCalled();
    expect(handleSpy).not.toHaveBeenCalled();
    expect(shadowToStringSpy).not.toHaveBeenCalled();
    expect(state.selectionChanged$).not.toHaveBeenCalled();

    /**
     * all elements is type of PebElementType.Shape
     */
    elementsMock['elem-002'].definition.type = PebElementType.Shape;
    state.selectedElements$.next(Object.keys(elementsMock));

    expect(initElementFormsSpy).toHaveBeenCalledWith(elementsMock['elem-001'] as any);
    expect(initSidebarSpy).toHaveBeenCalledWith(elementsMock['elem-001'] as any);
    expect(handleSpy).toHaveBeenCalledWith(elementsMock['elem-001'] as any, sidebarRef);
    Object.values(elementsMock).forEach((el) => {
      expect(el.target.cdr.detectChanges).not.toHaveBeenCalled();
      expect(el.target.applyStyles).not.toHaveBeenCalled();
    });
    expect(elementsMock['elem-001'].target.cdr.detectChanges).not.toHaveBeenCalled();
    expect(elementsMock['elem-001'].target.applyStyles).not.toHaveBeenCalled();
    expect(shadowToStringSpy).not.toHaveBeenCalled();

    /**
     * emit changes as 'test'
     * emit selectionChanged$
     * selectedChanges is FALSE
     */
    changes$.next('test');
    selectionChanged$.next();

    Object.values(elementsMock).forEach((el) => {
      expect(el.target.styles).toEqual({ color: '#333333' });
      expect(el.target.cdr.detectChanges).toHaveBeenCalled();
      expect(el.target.applyStyles).toHaveBeenCalled();
    });
    expect(shadowToStringSpy).not.toHaveBeenCalled();

    /**
     * emit changes$ as 'rgb(51, 51, 51)'
     */
    state.selectedElements$.next(Object.keys(elementsMock));
    changes$.next('rgb(51, 51, 51)');

    Object.values(elementsMock).forEach((el) => {
      expect(el.target.styles).toEqual({
        color: '#333333',
        backgroundColor: 'rgb(51, 51, 51)',
      } as any);
    });
    expect(shadowToStringSpy).not.toHaveBeenCalled();

    /**
     * emit changes$ as 1
     */
    changes$.next(1);

    Object.values(elementsMock).forEach((el) => {
      expect(el.target.styles).toEqual({
        color: '#333333',
        backgroundColor: 'rgb(51, 51, 51)',
        opacity: 1,
      } as any);
    });
    expect(shadowToStringSpy).not.toHaveBeenCalled();

    /**
     * emit changes$ as { color: '#333333' }
     */
    changes$.next({ color: '#333333' });

    Object.values(elementsMock).forEach((el) => {
      expect(el.target.styles).toEqual({
        color: '#333333',
        backgroundColor: 'rgb(51, 51, 51)',
        opacity: 1,
      } as any);
    });
    expect(shadowToStringSpy).not.toHaveBeenCalled();

    /**
     * emit changes$ with shadow properties
     */
    changes$.next({
      hasShadow: true,
      shadowBlur: 3,
      shadowColor: '#333333',
      shadowOffset: 3,
      shadowAngle: 0,
      shadowOpacity: 75,
    });

    Object.values(elementsMock).forEach((el) => {
      expect(el.target.styles).toEqual({
        color: '#333333',
        backgroundColor: 'rgb(51, 51, 51)',
        opacity: 1,
        shadow: 'drop-shadow(3pt 0pt 3px rgba(51,51,51,0.75))',
      } as any);
    });
    expect(shadowToStringSpy).toHaveBeenCalledWith({
      hasShadow: true,
      shadowBlur: 3,
      shadowColor: '#333333',
      shadowOffset: 3,
      shadowAngle: 0,
      shadowOpacity: 75,
    });

  });

  it('should handle video form', fakeAsync(() => {

    const elCmp = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
        data: { test: 'elem.data' },
      },
      video: {
        form: new FormGroup({
          videoScale: new FormControl(),
          videoObjectFit: new FormControl(),
          source: new FormControl(),
        }),
        submit: new Subject<any>(),
        result$: {
          next: jasmine.createSpy('next'),
        },
      },
      background: {
        form: new FormGroup({
          fillType: new FormControl(),
          bgColor: new FormControl(),
          bgImage: new FormControl(),
        }),
      },
      target: {
        video: null,
        isVideoLoading: null,
        cdr: {
          detectChanges: jasmine.createSpy('detectChanges'),
        },
      },
      detectChanges: jasmine.createSpy('detectChanges'),
    };
    const sidebarRef = {
      hostView: {
        destroyed: true,
      },
      instance: {
        editorVideoForm: {
          isLoading$: of(false),
        },
      },
    };
    const elementsMock = {
      'c-001': {
        definition: {
          id: 'c-001',
          type: PebElementType.GridCell,
          data: { test: 'data' },
        },
        detectChanges: jasmine.createSpy('detectChanges'),
      },
    };

    const updateSpy = spyOn<any>(plugin, 'updateVideoFieldSetting');
    const uploadSpy = spyOn<any>(plugin, 'uploadVideo');
    const patchSpy = spyOn(plugin, 'patchForm');
    let sub: Subscription;

    editorStore.updateElement.and.returnValue(of(null));

    /**
     * state.selectedGridCells is null
     */
    state.selectedGridCells = null;

    sub = plugin[`handleVideoForm`](elCmp as any, sidebarRef as any).subscribe();

    expect(renderer.getElementComponent).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(elCmp.detectChanges).not.toHaveBeenCalled();
    expect(uploadSpy).not.toHaveBeenCalled();
    expect(snackbarService.toggle).not.toHaveBeenCalled();
    expect(patchSpy).not.toHaveBeenCalled();
    expect(elCmp.video.result$.next).not.toHaveBeenCalled();
    expect(elCmp.target.isVideoLoading).toBe(false);
    expect(elCmp.target.cdr.detectChanges).toHaveBeenCalled();

    /**
     * change videoScale
     * elCmp.video.form.value.videoObjectFit is null
     */
    elCmp.video.form.patchValue({
      videoScale: 95,
    });

    expect(editorStore.updateElement).toHaveBeenCalledOnceWith({
      ...elCmp.definition,
      data: {
        ...elCmp.definition.data,
        videoObjectFitPosition: 'center center',
        videoScale: 95,
        videoObjectFit: null,
        source: null,
        videoWidth: '100%',
        videoHeight: '100%',
      },
    });
    expect(updateSpy).toHaveBeenCalledWith(elCmp.video.form);

    /**
     * change source & videoObjectFit
     * elCmp.video.form.value.videoObjectFit.value is VideoSize.Stretch
     */
    editorStore.updateElement.calls.reset();
    elCmp.video.form.patchValue({
      source: 'test.mp4',
      videoObjectFit: {
        name: 'Stretch',
        value: VideoSize.Stretch,
      },
    });

    expect(editorStore.updateElement).toHaveBeenCalledOnceWith({
      ...elCmp.definition,
      data: {
        ...elCmp.definition.data,
        videoObjectFitPosition: 'center center',
        videoScale: 100,
        videoObjectFit: {
          name: 'Stretch',
          value: VideoSize.Stretch,
        },
        source: 'test.mp4',
        videoWidth: '100%',
        videoHeight: '100%',
        mediaType: MediaType.Video,
      },
    });
    expect(elCmp.background.form.value).toEqual({
      fillType: { name: 'Video' },
      bgColor: '',
      bgImage: '',
    });

    /**
     * change videoObjectFit
     * elCmp.video.form.value.videoObjectFit.value is VideoSize.OriginalSize
     * elCmp.target.video is null
     */
    editorStore.updateElement.calls.reset();
    elCmp.video.form.patchValue({
      videoObjectFit: {
        name: 'Original Size',
        value: VideoSize.OriginalSize,
      },
    });

    flushMicrotasks();

    expect(editorStore.updateElement).toHaveBeenCalledOnceWith({
      ...elCmp.definition,
      data: {
        ...elCmp.definition.data,
        videoObjectFitPosition: 'center center',
        videoScale: 100,
        videoObjectFit: {
          name: 'Original Size',
          value: VideoSize.OriginalSize,
        },
        source: 'test.mp4',
        videoWidth: '0px',
        videoHeight: '0px',
        mediaType: MediaType.Video,
      },
    });

    /**
     * elCmp.target.video is set
     */
    editorStore.updateElement.calls.reset();
    elCmp.target.video = { nativeElement: document.createElement('video') };
    elCmp.video.form.patchValue({
      videoObjectFit: {
        name: 'Original Size',
        value: VideoSize.OriginalSize,
      },
    });

    flushMicrotasks();

    expect(editorStore.updateElement).toHaveBeenCalledOnceWith({
      ...elCmp.definition,
      data: {
        ...elCmp.definition.data,
        videoObjectFitPosition: 'center center',
        videoScale: 100,
        videoObjectFit: {
          name: 'Original Size',
          value: VideoSize.OriginalSize,
        },
        source: 'test.mp4',
        videoWidth: '1200px',
        videoHeight: '900px',
        mediaType: MediaType.Video,
      },
    });

    /**
     * elCmp.video.form.value.videoObjectFit.value is VideoSize.Tile
     */
    editorStore.updateElement.calls.reset();
    elCmp.video.form.patchValue({
      videoObjectFit: {
        name: 'Tile',
        value: VideoSize.Tile,
      },
      videoScale: 90,
    });

    expect(editorStore.updateElement).toHaveBeenCalledOnceWith({
      ...elCmp.definition,
      data: {
        ...elCmp.definition.data,
        videoObjectFitPosition: 'top left',
        videoScale: 90,
        videoObjectFit: {
          name: 'Tile',
          value: VideoSize.Tile,
        },
        source: 'test.mp4',
        videoWidth: '100%',
        videoHeight: '100%',
        mediaType: MediaType.Video,
      },
    });

    /**
     * elCmp.video.form.value.videoObjectFit.value is VideoSize.Contain
     */
    editorStore.updateElement.calls.reset();
    elCmp.video.form.patchValue({
      videoObjectFit: {
        name: 'Contain',
        value: VideoSize.Contain,
      },
    });

    expect(editorStore.updateElement).toHaveBeenCalledOnceWith({
      ...elCmp.definition,
      data: {
        ...elCmp.definition.data,
        videoObjectFitPosition: 'center center',
        videoScale: 100,
        videoObjectFit: {
          name: 'Contain',
          value: VideoSize.Contain,
        },
        source: 'test.mp4',
        videoWidth: '100%',
        videoHeight: '100%',
        mediaType: MediaType.Video,
      },
    });

    /**
     * emit elCmp.video.submit
     * plugin.uploadVideo throws error as null
     */
    uploadSpy.and.returnValue(throwError(null));
    elCmp.video.submit.next(elCmp.video.form.value);

    expect(uploadSpy).toHaveBeenCalledWith({
      ...elCmp.video.form.value,
      mediaType: MediaType.Video,
    }, sidebarRef);
    expect(snackbarService.toggle).toHaveBeenCalledOnceWith(true, {
      content: 'Upload is not possible due to server error',
      duration: 2000,
      iconId: 'icon-commerceos-error',
    });
    expect(patchSpy).not.toHaveBeenCalled();
    expect(elCmp.video.result$.next).not.toHaveBeenCalled();

    /**
     * plugin.uploadVideo throws error as { error: null }
     */
    snackbarService.toggle.calls.reset();
    uploadSpy.and.returnValue(throwError({ error: null }));
    elCmp.video.submit.next(elCmp.video.form.value);

    expect(snackbarService.toggle).toHaveBeenCalledOnceWith(true, {
      content: 'Upload is not possible due to server error',
      duration: 2000,
      iconId: 'icon-commerceos-error',
    });
    expect(patchSpy).not.toHaveBeenCalled();
    expect(elCmp.video.result$.next).not.toHaveBeenCalled();

    /**
     * plugin.uploadVideo throws error as { error: { message: 'test error' } }
     */
    snackbarService.toggle.calls.reset();
    uploadSpy.and.returnValue(throwError({ error: { message: 'test error' } }));
    elCmp.video.submit.next(elCmp.video.form.value);

    expect(snackbarService.toggle).toHaveBeenCalledOnceWith(true, {
      content: 'test error',
      duration: 2000,
      iconId: 'icon-commerceos-error',
    });
    expect(patchSpy).not.toHaveBeenCalled();
    expect(elCmp.video.result$.next).not.toHaveBeenCalled();

    sub.unsubscribe();

    /**
     * state.selectedGridCells is set
     */
    state.selectedGridCells = [{ id: 'c-001' }];
    renderer.getElementComponent.and.callFake((id: string) => elementsMock[id] ?? null);

    sub = plugin[`handleVideoForm`](elCmp as any, sidebarRef as any).subscribe();

    /**
     * change.videoScale
     */
    editorStore.updateElement.calls.reset();
    elCmp.video.form.patchValue({
      videoScale: 50,
    });

    expect(editorStore.updateElement).toHaveBeenCalledOnceWith([{
      ...elementsMock['c-001'].definition,
      data: {
        ...elementsMock['c-001'].definition.data,
        videoObjectFitPosition: 'center center',
        videoScale: 100,
        videoObjectFit: {
          name: 'Contain',
          value: VideoSize.Contain,
        },
        source: 'test.mp4',
        mediaType: MediaType.Video,
      },
    }]);

    /**
     * emit elCmp.video.submit
     * plugin.uploadVideo returns mocked data
     */
    uploadSpy.and.returnValue(of({
      thumbnail: 'thumb.jpg',
      blobName: 'blob',
    }));
    elCmp.video.submit.next(elCmp.video.form.value);

    expect(snackbarService.toggle).toHaveBeenCalledWith(true, {
      content: 'Video is uploaded successfully',
      duration: 2000,
      iconId: 'icon-commerceos-success',
    });
    expect(patchSpy).toHaveBeenCalledWith({
      thumbnail: 'thumb.jpg',
      source: 'blob',
    }, elCmp.video as any);

    sub.unsubscribe();

  }));

  it('should handle background fill type', () => {

    const elCmp = {
      background: {
        form: new FormGroup({
          fillType: new FormControl(),
        }),
      },
      video: {
        form: new FormGroup({}),
      },
    };
    const sidebarRef = {
      instance: {
        activeTabIndex$: {
          next: jasmine.createSpy('next'),
        },
      },
    };

    plugin[`handleBackgroundFillType`](elCmp as any, sidebarRef as any).subscribe();

    /**
     * elCmp.background.form.value.fillType.name is null
     * elCmp.video.form does not have source control
     */
    elCmp.background.form.patchValue({
      fillType: { name: null },
    });

    expect(elCmp.video.form.value).toEqual({});
    expect(sidebarRef.instance.activeTabIndex$.next).not.toHaveBeenCalled();

    /**
     * elCmp.video.form has source control
     */
    elCmp.video.form.addControl('source', new FormControl());
    elCmp.background.form.patchValue({
      fillType: { name: null },
    });

    expect(elCmp.video.form.value.source).toEqual('');
    expect(sidebarRef.instance.activeTabIndex$.next).not.toHaveBeenCalled();

    /**
     * elCmp.background.form.value.fillType.name is FillType.Video
     */
    elCmp.video.form.setValue({ source: 'test.mp4' });
    elCmp.background.form.patchValue({
      fillType: { name: FillType.Video },
    });

    expect(elCmp.video.form.value.source).toEqual('test.mp4');
    expect(sidebarRef.instance.activeTabIndex$.next).toHaveBeenCalledWith(2);

  });

  it('should upload video', () => {

    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const eventMock = {
      target: {
        files: {
          0: file,
          item: (index: number) => eventMock.target.files[index],
        },
      },
    };
    const sidebarRef = {
      instance: {
        component: {
          video: {
            form: {
              updateValueAndValidity: jasmine.createSpy('updateValueAndValidity'),
            },
          },
        },
        editorVideoForm: {
          previewError: null,
          videoDuration: 113,
          isLoading$: {
            next: jasmine.createSpy('next'),
            complete: jasmine.createSpy('complete'),
          },
          cdr: {
            detectChanges: jasmine.createSpy('detectChanges'),
          },
        },
      },
    };
    const response = {
      thumbnail: 'thumb.jpg',
      blobName: file.name,
    };

    /**
     * mediaService.uploadVideo returns mocked data
     */
    mediaService.uploadVideo.and.returnValue(of(response));

    plugin[`uploadVideo`](eventMock as any, sidebarRef as any)
      .subscribe(result => expect(result).toEqual(response))
      .unsubscribe();

    expect(mediaService.uploadVideo)
      .toHaveBeenCalledWith(eventMock.target.files.item(0), PebShopContainer.BuilderVideo);
    expect(sidebarRef.instance.editorVideoForm.previewError).toBe(false);
    expect(sidebarRef.instance.editorVideoForm.videoDuration).toBeNull();
    expect(sidebarRef.instance.editorVideoForm.cdr.detectChanges).toHaveBeenCalledTimes(2);
    expect(sidebarRef.instance.editorVideoForm.isLoading$.next).toHaveBeenCalledOnceWith(false);
    expect(sidebarRef.instance.editorVideoForm.isLoading$.complete).toHaveBeenCalledTimes(1);
    expect(sidebarRef.instance.component.video.form.updateValueAndValidity).not.toHaveBeenCalled();

    /**
     * mediaService.uploadVideo throws error
     */
    mediaService.uploadVideo.and.returnValue(throwError('test error'));
    sidebarRef.instance.editorVideoForm.cdr.detectChanges.calls.reset();
    sidebarRef.instance.editorVideoForm.isLoading$.next.calls.reset();
    sidebarRef.instance.editorVideoForm.isLoading$.complete.calls.reset();

    plugin[`uploadVideo`](eventMock as any, sidebarRef as any)
      .subscribe(
        () => { },
        error => expect(error).toEqual('test error'),
      ).unsubscribe();

    expect(sidebarRef.instance.editorVideoForm.cdr.detectChanges).toHaveBeenCalledTimes(3);
    expect(sidebarRef.instance.editorVideoForm.isLoading$.next.calls.allArgs()).toEqual(Array(2).fill([false]));
    expect(sidebarRef.instance.editorVideoForm.isLoading$.complete).toHaveBeenCalledTimes(2);
    expect(sidebarRef.instance.component.video.form.updateValueAndValidity).toHaveBeenCalledTimes(1);

  });

  it('should patch form', () => {

    const video = {
      form: {
        patchValue: jasmine.createSpy('patchValue'),
      },
    };
    const payload = { source: 'test.mp4' };

    /**
     * argument emitEvent is TRUE as default
     */
    plugin.patchForm(payload, video as any);

    expect(video.form.patchValue).toHaveBeenCalledWith(payload, { emitEvent: true });

    /**
     * argument emitEvent is FALSE
     */
    plugin.patchForm(payload, video as any, false);

    expect(video.form.patchValue).toHaveBeenCalledWith(payload, { emitEvent: false });

  });

  it('should find difference', () => {

    const base = {
      test: { value: 'test' },
      test2: 'value',
      test3: false,
    };
    const object = {
      ...base,
      test: { value: 'new test' },
      test3: true,
    };

    /**
     * arguments object & base are equal
     */
    expect(plugin[`difference`](base, base)).toEqual({});

    /**
     * arguments object & base are different
     */
    expect(plugin[`difference`](base, object)).toEqual({
      test: { value: 'test' },
      test3: false,
    });

  });

});
