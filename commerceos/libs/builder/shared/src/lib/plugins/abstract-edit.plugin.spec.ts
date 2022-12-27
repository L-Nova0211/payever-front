import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PebEditorApi, PEB_STORAGE_PATH } from '@pe/builder-api';
import * as pebCore from '@pe/builder-core';
import {
  MediaType,
  PebEditorState,
  PebElementType,
  PebMediaService,
  PebScreen,
  PebShopContainer,
} from '@pe/builder-core';
import { PebTextEditorService } from '@pe/builder-text-editor';
import { PE_ENV } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';
import { of, Subject, Subscription, throwError } from 'rxjs';
import { isEmpty } from 'rxjs/operators';
import * as sidebarUtils from '../behaviors/sidebars/_deprecated-sidebars/sidebar.utils';
import {
  AlignType,
  FillType,
  ImageSize,
  PageSidebarDefaultOptions,
  VideoSize,
} from '../behaviors/sidebars/_deprecated-sidebars/sidebar.utils';
import { PEB_EDITOR_EVENTS } from '../editor.constants';
import { VideoSourceType, VideoSubTab } from '../renderer/editor-element';
import { PebEditorRenderer } from '../renderer/editor-renderer';
import { PebEditor } from '../root/editor.component';
import { SnackbarErrorService } from '../services';
import { PebEditorAccessorService } from '../services/editor-accessor.service';
import { PebEditorStore } from '../services/editor.store';
import { PebTextFormService } from '../shared/forms';
import * as utils from '../utils';
import { AbstractEditElementPlugin } from './abstract-edit.plugin';

describe('Plugins:AbstractEdit', () => {

  let plugin: AbstractEditElementPlugin<any>;
  let state: jasmine.SpyObj<PebEditorState>;
  let renderer: jasmine.SpyObj<PebEditorRenderer>;
  let editorComponent: jasmine.SpyObj<PebEditor>;
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let mediaService: jasmine.SpyObj<PebMediaService>;
  let snackbarService: jasmine.SpyObj<SnackbarService>;
  let logger: { log: jasmine.Spy };

  beforeAll(() => {

    Object.defineProperty(sidebarUtils, 'asyncGetBgScale', {
      value: sidebarUtils.asyncGetBgScale,
      writable: true,
    });

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

    Object.defineProperty(utils, 'toBase64', {
      value: utils.toBase64,
      writable: true,
    });

  });

  beforeEach(() => {

    editorComponent = jasmine.createSpyObj<PebEditor>('PebEditor', ['insertToSlot']);

    const stateMock = {
      screen: PebScreen.Desktop,
      scale: 1.5,
    };

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', [
      'getElementComponent',
      'elementIntersect',
    ]);

    const editorStoreSpy = jasmine.createSpyObj<PebEditorStore>('PebEditorStore', [
      'updateStyles',
      'updateElementKit',
      'updateStylesByScreen',
      'updateElement',
    ]);

    const snackbarServiceSpy = jasmine.createSpyObj<SnackbarService>('SnackbarService', ['toggle']);

    const mediaServiceSpy = jasmine.createSpyObj<PebMediaService>('PebMediaService', {
      uploadImage: of({}),
      uploadVideo: of({}),
    });

    const envMock = {
      custom: {
        cdn: 'c-cdn',
      },
    };

    logger = {
      log: jasmine.createSpy('log'),
    };

    TestBed.configureTestingModule({
      providers: [
        AbstractEditElementPlugin,
        FormBuilder,
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorRenderer, useValue: rendererSpy },
        { provide: PebEditorStore, useValue: editorStoreSpy },
        { provide: SnackbarService, useValue: snackbarServiceSpy },
        { provide: PEB_EDITOR_EVENTS, useValue: {} },
        { provide: SnackbarErrorService, useValue: {} },
        { provide: PebEditorApi, useValue: {} },
        { provide: PebMediaService, useValue: mediaServiceSpy },
        { provide: PEB_STORAGE_PATH, useValue: '/storage' },
        { provide: PebTextEditorService, useValue: {} },
        { provide: PebTextFormService, useValue: {} },
        { provide: PE_ENV, useValue: envMock },
        { provide: 'PEB_ENTITY_NAME', useValue: 'test-entity' },
      ],
    });

    plugin = TestBed.inject(AbstractEditElementPlugin);
    plugin.logger = logger;

    state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;
    renderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;
    editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
    mediaService = TestBed.inject(PebMediaService) as jasmine.SpyObj<PebMediaService>;
    snackbarService = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should set editor - actually do nothing', () => {

    plugin[`editor`] = {} as any;

    expect().nothing();

  });

  it('should get editor', () => {

    expect(plugin[`editor`]).toEqual(editorComponent);

  });

  it('should init element forms', () => {

    const elCmp: any = {
      definition: { id: 'elem' },
    };

    expect(plugin.initElementForms(elCmp)).toEqual(elCmp);

  });

  it('should init sidebar forms - actually do nothing', () => {

    plugin.initSidebarForms(null);

    expect().nothing();

  });

  it('should handle forms', () => {

    plugin.handleForms(null, null).pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));

  });

  it('should finalize forms', () => {

    expect(plugin.finalizeForms(null, null)()).toBeUndefined();

  });

  it('should test single element of type selected', () => {

    state['singleSelectedElement$' as any] = of('selected');
    renderer.getElementComponent.and.returnValues(
      null,
      {
        definition: {
          id: 'button',
          type: PebElementType.Button,
        },
      } as any,
    );

    // w/o elCmp
    plugin['constructor' as any].elementTypes = Object.values(PebElementType);
    plugin[`singleElementOfTypeSelected`]().subscribe().unsubscribe();

    // w/ elCmp
    plugin[`singleElementOfTypeSelected`]().subscribe((elem) => {
      expect(elem.definition.id).toEqual('button');
    });

  });

  it('should test single grid cell of type selected', () => {

    const types = [PebElementType.GridCellCategory];

    state[`singleSelectedGridCell$` as any] = of('c-001');

    renderer.getElementComponent.and.returnValues(
      null,
      {
        definition: {
          id: 'c-001',
          type: PebElementType.GridCellCategory,
        },
      } as any,
    );

    // w/o element
    plugin[`singleGridCellOfTypeSelected`](types).pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));

    // w/ element
    plugin[`singleGridCellOfTypeSelected`](types).subscribe(elem => expect(elem).toEqual({
      definition: {
        id: 'c-001',
        type: PebElementType.GridCellCategory,
      },
    } as any));

  });

  it('should init sidebar', () => {

    const elementCmp = {
      definition: {
        id: 'elem',
      },
      styles: {
        display: 'flex',
      },
    };
    const sidebarCmpRef = {
      instance: {},
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef as any);

    expect(plugin[`initSidebar`](elementCmp as any).instance).toEqual({
      component: elementCmp,
      element: elementCmp.definition,
      styles: elementCmp.styles,
    } as any);
    expect(sidebarCmpRef.changeDetectorRef.detectChanges).toHaveBeenCalled();

  });

  it('should init alignment form', () => {

    const sidebarRef: any = {
      instance: {},
    };

    plugin[`initAlignmentForm`](sidebarRef);

    expect(sidebarRef.instance.alignment.form.controls.align).toBeTruthy();

  });

  it('should handle alignment form', () => {

    const sidebarRef: any = {
      instance: {},
    };
    const elementCmp = {
      id: 'elem-001',
      definition: { id: 'elem-001' },
      nativeElement: {
        style: {
          transform: undefined,
        },
      },
      controls: {
        edges: {
          instance: {
            valid: true,
            detectChanges: jasmine.createSpy('detectChanges'),
          },
        },
        anchors: {
          instance: {
            variant: 'invalid',
            detectChanges: jasmine.createSpy('detectChanges'),
          },
        },
      },
      position: {
        form: new FormGroup({
          x: new FormControl(),
          y: new FormControl(),
        }),
      },
      parent: {
        id: 'parent',
        definition: {
          type: PebElementType.Shape,
        },
        getAbsoluteElementRect: () => ({
          top: 50,
          left: 100,
        }),
      },
      siblings: [{ id: 'elem-002' }],
      getAbsoluteElementRect: () => ({
        x: 10,
        y: 120,
        top: 100,
        left: 300,
      }),
    };
    let subscription: Subscription;

    spyOn<any>(plugin, 'getNextAlignmentPosition').and.returnValue({
      nextPosition: { x: 100, y: 150 },
      translate: { x: 90, y: 30 },
    });
    editorStore.updateStyles.and.returnValue(of(null));

    /**
     * renderer.elementIntersect returns FALSE
     */
    renderer.elementIntersect.and.returnValue(false);

    plugin[`initAlignmentForm`](sidebarRef);
    subscription = plugin[`handleAlignmentForm`](elementCmp as any, sidebarRef).subscribe();

    sidebarRef.instance.alignment.form.patchValue({
      align: AlignType.Top,
    });

    expect(elementCmp.nativeElement.style.transform).toEqual('translate(90px, 30px)');
    expect(sidebarRef.instance.alignment.form.controls.align.value).toEqual('');
    expect(elementCmp.controls.edges.instance.valid).toBe(true);
    expect(elementCmp.controls.edges.instance.detectChanges).toHaveBeenCalled();
    expect(elementCmp.controls.anchors.instance.variant).toEqual('default');
    expect(elementCmp.controls.anchors.instance.detectChanges).toHaveBeenCalled();
    expect(elementCmp.position.form.value).toEqual({ x: 100, y: 150 });
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: {
        top: 50,
        left: 200,
      },
    });

    subscription.unsubscribe();

    /**
     * renderer.elementIntersect returns TRUE
     * elementCmp.parent.definition.type is PebElementType.Section
     */
    renderer.elementIntersect.and.returnValue(true);
    editorStore.updateStyles.calls.reset();
    elementCmp.parent.definition.type = PebElementType.Section;

    subscription = plugin[`handleAlignmentForm`](elementCmp as any, sidebarRef).subscribe();

    sidebarRef.instance.alignment.form.patchValue({
      align: AlignType.Top,
    });

    expect(elementCmp.nativeElement.style.transform).toEqual('translate(0, 0)');
    expect(elementCmp.controls.edges.instance.valid).toBe(false);
    expect(elementCmp.controls.anchors.instance.variant).toEqual('invalid');
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: {
        top: 50,
        left: 300,
      },
    });

    subscription.unsubscribe();

    /**
     * elementCmp.controls.anchors is null
     * elementCmp.controls.edges.valid is FALSE
     */
    elementCmp.controls.anchors = null;

    subscription = plugin[`handleAlignmentForm`](elementCmp as any, sidebarRef).subscribe();

    sidebarRef.instance.alignment.form.patchValue({
      align: AlignType.Top,
    });

    expect(elementCmp.nativeElement.style.transform).toEqual('translate(0, 0)');
    expect(elementCmp.controls.edges.instance.valid).toBe(false);
    expect(elementCmp.controls.edges.instance.detectChanges).toHaveBeenCalled();

    subscription.unsubscribe();

    /**
     * renderer.elementIntersect returns FALSE
     */
    renderer.elementIntersect.and.returnValue(false);

    subscription = plugin[`handleAlignmentForm`](elementCmp as any, sidebarRef).subscribe();

    sidebarRef.instance.alignment.form.patchValue({
      align: AlignType.Top,
    });

    expect(elementCmp.nativeElement.style.transform).toEqual('translate(90px, 30px)');
    expect(elementCmp.controls.edges.instance.valid).toBe(true);
    expect(elementCmp.controls.edges.instance.detectChanges).toHaveBeenCalled();

    subscription.unsubscribe();

    /**
     * elementCmp.controls.edges.valid is TRUE
     */
    subscription = plugin[`handleAlignmentForm`](elementCmp as any, sidebarRef).subscribe();

    sidebarRef.instance.alignment.form.patchValue({
      align: AlignType.Top,
    });

    expect(elementCmp.nativeElement.style.transform).toEqual('translate(90px, 30px)');
    expect(elementCmp.position.form.value).toEqual({ x: 100, y: 150 });

    subscription.unsubscribe();

    /**
     * elementCmp.position is null
     */
    elementCmp.position = undefined;

    subscription = plugin[`handleAlignmentForm`](elementCmp as any, sidebarRef).subscribe();

    sidebarRef.instance.alignment.form.patchValue({
      align: AlignType.Top,
    });

    subscription.unsubscribe();

  });

  it('should init video form', () => {

    const elementCmp = {
      definition: null,
      background: {
        form: new FormGroup({
          fillType: new FormControl(),
        }),
      },
      video: null,
    };
    const sourceTypeOptions = [
      { name: 'My video', value: VideoSourceType.MyVideo },
    ];

    /**
     * elementCmp.definition is null
     */
    plugin[`initVideoForm`](elementCmp as any);

    expect(elementCmp.video).toBeDefined();
    expect(elementCmp.video.initialValue).toEqual({
      videoSubTab: VideoSubTab.Media,
      sourceOptions: sourceTypeOptions,
      sourceType: sourceTypeOptions[0],
      source: undefined,
      thumbnail: undefined,
      file: undefined,
      autoplay: undefined,
      controls: undefined,
      loop: undefined,
      sound: undefined,
      preview: undefined,
      videoObjectFit: PageSidebarDefaultOptions.VideoSize,
      videoScale: PageSidebarDefaultOptions.videoScale,
    });
    expect(elementCmp.video.form.value).toEqual({
      sourceType: sourceTypeOptions[0],
      source: null,
      file: null,
      thumbnail: null,
      autoplay: null,
      controls: null,
      loop: null,
      sound: null,
      preview: null,
      videoObjectFit: PageSidebarDefaultOptions.VideoSize,
      videoScale: PageSidebarDefaultOptions.videoScale,
    });

    /**
     * elementCmp.definition.data is null
     */
    elementCmp.definition = { data: null };

    plugin[`initVideoForm`](elementCmp as any);

    expect(elementCmp.video.initialValue).toEqual({
      videoSubTab: VideoSubTab.Media,
      sourceOptions: sourceTypeOptions,
      sourceType: sourceTypeOptions[0],
      source: undefined,
      thumbnail: undefined,
      file: undefined,
      autoplay: undefined,
      controls: undefined,
      loop: undefined,
      sound: undefined,
      preview: undefined,
      videoObjectFit: PageSidebarDefaultOptions.VideoSize,
      videoScale: PageSidebarDefaultOptions.videoScale,
    });
    expect(elementCmp.video.form.value).toEqual({
      sourceType: sourceTypeOptions[0],
      source: null,
      thumbnail: null,
      file: null,
      autoplay: null,
      controls: null,
      loop: null,
      sound: null,
      preview: null,
      videoObjectFit: PageSidebarDefaultOptions.VideoSize,
      videoScale: PageSidebarDefaultOptions.videoScale,
    });

    /**
     * elementCmp.definition.data is set
     */
    elementCmp.definition.data = {
      source: 'source/video.mp4',
      thumbnail: 'source/thumb.jpg',
      file: new File(['video'], 'video.mp4', { type: 'video/mp4' }),
      autoplay: false,
      controls: true,
      loop: false,
      sound: true,
      preview: 'source/preview.jpg',
      videoObjectFit: VideoSize.Cover,
      videoScale: 95,
    };

    plugin[`initVideoForm`](elementCmp as any);

    expect(elementCmp.video.initialValue).toEqual({
      videoSubTab: 'media',
      sourceOptions: sourceTypeOptions,
      sourceType: sourceTypeOptions[0],
      source: 'source/video.mp4',
      thumbnail: 'source/thumb.jpg',
      file: new File(['video'], 'video.mp4', { type: 'video/mp4' }),
      autoplay: false,
      controls: true,
      loop: false,
      sound: true,
      preview: 'source/preview.jpg',
      videoObjectFit: VideoSize.Cover,
      videoScale: 95,
    });
    expect(elementCmp.video.form.value).toEqual({
      sourceType: sourceTypeOptions[0],
      source: 'source/video.mp4',
      thumbnail: 'source/thumb.jpg',
      file: new File(['video'], 'video.mp4', { type: 'video/mp4' }),
      autoplay: false,
      controls: true,
      loop: false,
      sound: true,
      preview: 'source/preview.jpg',
      videoObjectFit: VideoSize.Cover,
      videoScale: 95,
    });
    expect(elementCmp.background.form.value.fillType).toEqual({ name: FillType.Video });

  });

  it('should handle video form', () => {

    const elementCmp = {
      definition: {
        id: 'elem',
        type: PebElementType.Video,
        data: {
          preview: 'source/preview.jpg',
          source: 'source/video.mp4',
          thumbnail: 'storage/thumb.jpg',
          file: new File(['video'], 'video.mp4', { type: 'video/mp4' }),
          autoplay: false,
          controls: true,
          loop: false,
          sound: true,
        },
      },
      detectChanges: jasmine.createSpy('detectChanges'),
      background: {
        form: new FormGroup({
          fillType: new FormControl(),
          bgColor: new FormControl(),
          bgImage: new FormControl(),
        }),
      },
      video: undefined,
    };
    const sidebarRef = {
      instance: {
        editorVideoForm: {
          isLoading$: of(true),
        },
      },
    };
    const event: any = { test: 'event' };
    const updateSettingSpy = spyOn<any>(plugin, 'updateVideoFieldSetting').and.returnValue(of(null));
    const uploadVideoSpy = spyOn<any>(plugin, 'uploadVideo');
    const uploadResult = {
      thumbnail: 'storage/thumb-new.jpg',
      blobName: 'source/video-new.mp4',
      preview: 'source/preview-new.jpg',
    };
    let nextSpy: jasmine.Spy;

    editorStore.updateElement.and.returnValue(of(null));

    /**
     * plugin.uploadVideo throws error as null
     */
    uploadVideoSpy.and.returnValue(throwError(null));

    plugin[`initVideoForm`](elementCmp as any);
    plugin[`handleVideoForm`](elementCmp as any, sidebarRef as any).subscribe();
    nextSpy = spyOn(elementCmp.video.result$, 'next');

    elementCmp.video.form.patchValue({
      autoplay: true,
    });
    elementCmp.video.submit.next(event);

    expect(updateSettingSpy).toHaveBeenCalledWith(elementCmp.video.form);
    expect(elementCmp.background.form.value).toEqual({
      fillType: { name: 'Video' },
      bgColor: '',
      bgImage: '',
    });
    expect(editorStore.updateElement).toHaveBeenCalled();
    expect(elementCmp.detectChanges).toHaveBeenCalled();
    expect(uploadVideoSpy).toHaveBeenCalledWith(event, sidebarRef);
    expect(snackbarService.toggle).toHaveBeenCalledWith(true, {
      content: 'Upload is not possible due to server error',
      duration: 2000,
      iconId: 'icon-commerceos-error',
    });
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(elementCmp.video.form.value.preview).toEqual(elementCmp.definition.data.preview);
    expect(elementCmp.video.form.value.source).toEqual(elementCmp.definition.data.source);
    expect(elementCmp.video.form.value.thumbnail).toEqual(elementCmp.definition.data.thumbnail);

    /**
     * plugin.uploadVideo throws error as { error: null }
     */
    uploadVideoSpy.and.returnValue(throwError({ error: null }));
    elementCmp.video.submit.next(event);

    expect(snackbarService.toggle.calls.mostRecent().args[1].content)
      .toEqual('Upload is not possible due to server error');

    /**
     * plugin.uploadVideo throws error with message
     */
    uploadVideoSpy.and.returnValue(throwError({ error: { message: 'test error' } }));
    elementCmp.video.submit.next(event);

    expect(snackbarService.toggle.calls.mostRecent().args[1].content)
      .toEqual('test error');

    /**
     * plugin.uploadVideo returns mocked data
     */
    uploadVideoSpy.and.returnValue(of(uploadResult));

    elementCmp.video.submit.next(event);

    expect(elementCmp.video.form.value.preview).toEqual(uploadResult.preview);
    expect(elementCmp.video.form.value.source).toEqual(uploadResult.blobName);
    expect(elementCmp.video.form.value.thumbnail).toEqual(uploadResult.thumbnail);
    expect(snackbarService.toggle.calls.mostRecent().args[1].content)
      .toEqual('Video is uploaded successfully');

  });

  it('should upload video', () => {

    const event = {
      target: {
        files: {
          0: new File(['video'], 'video.mp4', { type: 'video/mp4' }),
          item(index) {
            return event.target.files[index];
          },
        },
      },
    };
    const response = {
      preview: 'preview.jpg',
      thumbnail: 'thumb.jpg',
      blobName: 'blob.mp4',
    };

    mediaService.uploadVideo.and.returnValue(of(response));

    plugin[`uploadVideo`](event as any, null).subscribe(result => expect(result).toEqual(response));
    expect(mediaService.uploadVideo).toHaveBeenCalledWith(event.target.files.item(0), PebShopContainer.BuilderVideo);

  });

  it('should init position form', () => {

    const elementCmp: any = {
      getAbsoluteElementRect: () => ({
        top: 20,
        left: 20,
      }),
    };

    plugin[`initPositionForm`](elementCmp);

    elementCmp.position.update();
    expect(elementCmp.position.initialValue).toEqual({ x: 20, y: 20 });
    expect(elementCmp.position.form).toBeTruthy();
    Object.values(elementCmp.position.limits).forEach((limit: any) => expect(limit.value).toEqual({
      min: 0,
      max: 500,
    }));

  });

  it('should handle position form', () => {

    const elementCmp = {
      nativeElement: document.createElement('div'),
      definition: { id: 'elem-001' },
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        top: 20,
        left: 20,
      }),
      parent: {
        definition: {
          id: 'parent',
          type: PebElementType.Shape,
        },
        getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect'),
        children: [],
      },
      position: null,
      applyStyles: jasmine.createSpy('applyStyles'),
    };
    let patchSpy: jasmine.Spy;

    editorStore.updateStyles.and.returnValue(of(null));

    plugin[`initPositionForm`](elementCmp as any);
    plugin[`handlePositionForm`](elementCmp as any).subscribe();
    patchSpy = spyOn(elementCmp.position.form, 'patchValue').and.callThrough();

    expect(elementCmp.position).toBeDefined();

    /**
     * delta.x & delta.y are 0
     */
    elementCmp.position.form.patchValue({
      x: 20,
      y: 20,
    });

    expect(elementCmp.getAbsoluteElementRect).toHaveBeenCalledTimes(2);
    expect(elementCmp.nativeElement.style.transform).toEqual('');
    expect(elementCmp.parent.getAbsoluteElementRect).not.toHaveBeenCalled();
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(editorStore.updateStyles).not.toHaveBeenCalled();
    expect(snackbarService.toggle).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith('statusChanges', 'VALID');

    /**
     * delta.x is NOT 0
     * elementCmp.parent.children is []
     * elementCmp.parent is NOT section
     */
    elementCmp.getAbsoluteElementRect.calls.reset();
    elementCmp.getAbsoluteElementRect.and.returnValues(
      {
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
      },
      {
        top: 300,
        left: 300,
        right: 300,
        bottom: 300,
      },
      {
        top: 300,
        left: 300,
        right: 300,
        bottom: 300,
      },
    );
    elementCmp.parent.getAbsoluteElementRect.and.returnValue({
      top: 250,
      left: 250,
      right: 350,
      bottom: 350,
    });
    elementCmp.position.form.patchValue({ x: 100 });

    expect(elementCmp.nativeElement.style.transform).toEqual('translate(120px, 0px)');
    expect(elementCmp.getAbsoluteElementRect).toHaveBeenCalledTimes(3);
    expect(elementCmp.parent.getAbsoluteElementRect).toHaveBeenCalled();
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: {
        top: 50,
        left: 50,
      },
    });
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(snackbarService.toggle).not.toHaveBeenCalled();

    /**
     * elementCmp.parent is section
     */
    editorStore.updateStyles.calls.reset();
    elementCmp.getAbsoluteElementRect.and.returnValues(
      {
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
      },
      {
        top: 300,
        left: 300,
        right: 300,
        bottom: 300,
      },
      {
        top: 300,
        left: 300,
        right: 300,
        bottom: 300,
      },
    );
    elementCmp.parent.getAbsoluteElementRect.and.returnValue({
      top: 250,
      left: 250,
      right: 350,
      bottom: 350,
    });
    elementCmp.parent.definition.type = PebElementType.Section;
    elementCmp.position.form.patchValue({ x: 100 });

    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: {
        top: 50,
        left: 300,
      },
    });

    /**
     * elementCmp.parent.children is set
     */
    editorStore.updateStyles.calls.reset();
    patchSpy.calls.reset();
    elementCmp.getAbsoluteElementRect.and.returnValues(
      {
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
      },
      {
        top: 300,
        left: 300,
        right: 300,
        bottom: 300,
      },
      {
        top: 300,
        left: 300,
        right: 300,
        bottom: 300,
      },
    );
    elementCmp.parent.children = [
      { definition: elementCmp.definition, },
      {
        definition: { id: 'elem-002' },
        getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
          top: 250,
          left: 250,
          right: 350,
          bottom: 350,
        }),
      },
    ];
    elementCmp.position.form.patchValue({ x: 120 });

    expect(editorStore.updateStyles).not.toHaveBeenCalled();
    expect(patchSpy).toHaveBeenCalledTimes(2);
    expect(patchSpy).toHaveBeenCalledWith({ x: 20, y: 20 }, { emitEvent: false, onlySelf: true });
    expect(elementCmp.parent.children[1].getAbsoluteElementRect).toHaveBeenCalled();
    expect(elementCmp.applyStyles).toHaveBeenCalled();
    expect(snackbarService.toggle).toHaveBeenCalledWith(true, {
      content: 'Invalid position',
      duration: 2000,
      iconId: 'icon-commerceos-error',
    });

  });

  it('should init dimensions form', () => {

    const elementCmp: any = {
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 500,
        height: 300,
      }),
    };
    const activateSpy = spyOn<any>(plugin, 'activateDimensionsForm');
    const updateSpy = spyOn<any>(plugin, 'updateDimensionsForm');

    spyOn<any>(plugin, 'getDimensionsLimits').and.returnValues(
      null,
      {
        width: {
          min: 50,
          max: 1000,
        },
        height: {
          min: 50,
          max: 700,
        },
      },
    );

    /**
     * plugin.getDimenstionsLimits returns null
     */
    plugin[`initDimensionsForm`](elementCmp);

    expect(elementCmp.dimensions).toBeUndefined();
    expect(activateSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();

    /**
     * plugin.getDimenstionsLimits returns mocked data
     */
    plugin[`initDimensionsForm`](elementCmp);

    expect(elementCmp.dimensions.form).toBeTruthy();
    expect(elementCmp.dimensions.limits.width.value).toEqual({
      min: 50,
      max: 1000,
    });
    expect(elementCmp.dimensions.limits.height.value).toEqual({
      min: 50,
      max: 700,
    });
    expect(activateSpy).toHaveBeenCalledWith(elementCmp);
    expect(updateSpy).toHaveBeenCalledWith(elementCmp);

  });

  it('should activate dimensions form', () => {

    const elementCmp: any = {
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 500,
        height: 300,
      }),
    };

    spyOn<any>(plugin, 'getDimensionsLimits').and.returnValue({
      width: {
        min: 50,
        max: 1000,
      },
      height: {
        min: 50,
        max: 700,
      },
    });

    plugin[`initDimensionsForm`](elementCmp);

    const setSpy = spyOn(elementCmp.dimensions.form, 'setValue').and.callThrough();

    // all in range
    elementCmp.dimensions.activate();

    expect(setSpy).not.toHaveBeenCalled();

    // height > max
    elementCmp.getAbsoluteElementRect.and.returnValue({
      width: 500,
      height: 750,
    });

    elementCmp.dimensions.activate();

    expect(setSpy).toHaveBeenCalled();
    expect(elementCmp.dimensions.form.value).toEqual({
      width: 500,
      height: 700,
    });

  });

  it('should update dimensions form', () => {

    const elementCmp: any = {
      definition: { id: 'elem' },
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 600,
        height: 300,
      }),
    };

    spyOn<any>(plugin, 'getDimensionsLimits').and.returnValues(
      {
        width: {
          min: 50,
          max: 1000,
        },
        height: {
          min: 50,
          max: 700,
        },
      },
      null,
      {
        width: {
          min: 50,
          max: 1000,
        },
        height: {
          min: 50,
          max: 700,
        },
      },
    );

    plugin[`initDimensionsForm`](elementCmp);

    const widthSetValidatorsSpy = spyOn(elementCmp.dimensions.form.controls.width, 'setValidators').and.callThrough();
    const heightSetValidatorsSpy = spyOn(elementCmp.dimensions.form.controls.height, 'setValidators').and.callThrough();

    // w/o dimensions
    elementCmp.dimensions.update();

    expect(widthSetValidatorsSpy).not.toHaveBeenCalled();
    expect(heightSetValidatorsSpy).not.toHaveBeenCalled();

    // w/ dimensions
    elementCmp.dimensions.update();

    expect(widthSetValidatorsSpy).toHaveBeenCalled();
    expect(heightSetValidatorsSpy).toHaveBeenCalled();
    expect(elementCmp.dimensions.limits.width.value).toEqual({
      min: 50,
      max: 1000,
    });
    expect(elementCmp.dimensions.limits.height.value).toEqual({
      min: 50,
      max: 700,
    });

  });

  it('should get dimensions limits', () => {

    const elementCmp: any = {
      definition: {},
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 600,
        height: 300,
      }),
      getMaxPossibleDimensions: jasmine.createSpy('getMaxPossibleDimensions').and.returnValues({}, null),
      getMinPossibleDimensions: jasmine.createSpy('getMinPossibleDimensions').and.returnValue(50),
    };

    // w/o heightMaxDimensions
    expect(plugin[`getDimensionsLimits`](elementCmp)).toBeUndefined();
    expect(elementCmp.getMaxPossibleDimensions).toHaveBeenCalledTimes(2);
    expect(elementCmp.getMinPossibleDimensions).not.toHaveBeenCalled();

    // w/ dimensions
    elementCmp.getMaxPossibleDimensions.and.returnValue({
      size: 1000,
      spaceStart: 100,
    });

    expect(plugin[`getDimensionsLimits`](elementCmp)).toEqual({
      width: { min: 50, max: 1000 },
      height: { min: 50, max: 900 },
    });
    expect(elementCmp.getMaxPossibleDimensions).toHaveBeenCalledTimes(4);
    expect(elementCmp.getMinPossibleDimensions).toHaveBeenCalledTimes(2);

  });

  it('should handle dimensions form', () => {

    const elementCmp: any = {
      definition: { id: 'elem', data: null },
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 600,
        height: 300,
      }),
      styles: {
        width: null,
        height: null,
      },
      applyStyles: jasmine.createSpy('applyStyles'),
    };
    let updateSpy: jasmine.Spy;

    spyOn<any>(plugin, 'getDimensionsLimits').and.returnValues(
      {
        width: {
          min: 50,
          max: 1000,
        },
        height: {
          min: 50,
          max: 700,
        },
      },
      null,
    );

    editorStore.updateStyles.and.returnValue(of(null));

    /**
     * elementCmp.dimensions is undefined
     */
    plugin[`handleDimensionsForm`](elementCmp)
      .pipe(isEmpty())
      .subscribe(empty => expect(empty).toBe(true))
      .unsubscribe();

    /**
     * elementCmp.dimensions is set
     * elementCmp.dimensions.form is INVALID
     */
    plugin[`initDimensionsForm`](elementCmp);
    elementCmp.dimensions.update();
    updateSpy = spyOn(elementCmp.dimensions, 'update');

    plugin[`handleDimensionsForm`](elementCmp).subscribe();

    elementCmp.dimensions.form.patchValue({ width: 2000 });

    expect(logger.log).toHaveBeenCalledOnceWith('Dimensions: Change: Invalid');
    expect(elementCmp.styles.width).toBeNull();
    expect(elementCmp.styles.height).toBeNull();
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorStore.updateStyles).not.toHaveBeenCalled();

    /**
     * elementCmp.dimensions.form is VALID
     * elementCmp.definition.data is null
     */
    logger.log.calls.reset();
    elementCmp.dimensions.form.patchValue({ width: 400 });

    expect(logger.log.calls.allArgs()).toEqual([
      ['Dimensions: Change: Valid ', elementCmp.dimensions.form.value],
      ['Dimensions: Submit ', elementCmp.dimensions.form.value],
    ]);
    expect(elementCmp.styles.width).toBe(400);
    expect(elementCmp.styles.height).toBe(300);
    expect(elementCmp.applyStyles).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(editorStore.updateElement).not.toHaveBeenCalled();
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: elementCmp.dimensions.form.value,
    });

    /**
     * elementCmp.definition.data.textAutosize is set
     * elementCmp.dimensions.initialValue.width is NOT equal to elementCmp.dimensions.form.value.width
     */
    elementCmp.definition.data = {
      textAutosize: {
        width: true,
        height: true,
      },
    };
    elementCmp.dimensions.initialValue = {
      ...elementCmp.dimensions.form.value,
      width: 500,
    };
    elementCmp.dimensions.submit.next();

    expect(elementCmp.definition.data.textAutosize).toEqual({
      width: false,
      height: true,
    });
    expect(editorStore.updateElement).toHaveBeenCalledWith(elementCmp.definition);

    /**
     * elementCmp.dimensions.initialValue.height is NOT equal to elementCmp.dimensions.form.value.height
     */
    editorStore.updateElement.calls.reset();
    elementCmp.definition.data = {
      textAutosize: {
        width: true,
        height: true,
      },
    };
    elementCmp.dimensions.initialValue = {
      ...elementCmp.dimensions.form.value,
      height: 500,
    };
    elementCmp.dimensions.submit.next();

    expect(elementCmp.definition.data.textAutosize).toEqual({
      width: true,
      height: false,
    });
    expect(editorStore.updateElement).toHaveBeenCalledWith(elementCmp.definition);

  });

  it('should init proportion dimensions form', () => {

    const elementCmp: any = {
      definition: { id: 'elem' },
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 600,
        height: 300,
      }),
    };
    const activateSpy = spyOn<any>(plugin, 'activateProportionDimensionsForm');
    const updateSpy = spyOn<any>(plugin, 'updateProportionDimensionsForm');

    spyOn<any>(plugin, 'getProportionDimensionsLimits').and.returnValues(
      null,
      {
        width: {
          min: 50,
          max: 1000,
        },
        height: {
          min: 50,
          max: 700,
        },
      },
    );

    // w/o dimensions limits
    // w/o data
    expect(plugin[`initProportionDimensionsForm`](elementCmp)).toBeUndefined();
    expect(elementCmp.proportionDimensions).toBeUndefined();
    expect(activateSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();

    // w/ dimensions limits
    // w/ data
    elementCmp.definition = {
      data: {
        constrainProportions: true,
        proportionRatio: 2,
      },
    };

    plugin[`initProportionDimensionsForm`](elementCmp);

    expect(elementCmp.proportionDimensions.form).toBeTruthy();
    expect(elementCmp.proportionDimensions.limits.width.value).toEqual({
      min: 50,
      max: 1000,
    });
    expect(elementCmp.proportionDimensions.limits.height.value).toEqual({
      min: 50,
      max: 700,
    });
    expect(activateSpy).toHaveBeenCalledWith(elementCmp);
    expect(updateSpy).toHaveBeenCalledWith(elementCmp);

  });

  it('should activate proportion dimensions form', () => {

    const elementCmp: any = {
      definition: {
        data: {
          constrainProportions: true,
          proportionRation: null,
        },
      },
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 600,
        height: 300,
      }),
    };

    spyOn<any>(plugin, 'getProportionDimensionsLimits').and.returnValue({
      width: {
        min: 50,
        max: 1000,
      },
      height: {
        min: 50,
        max: 700,
      },
    });

    plugin[`initProportionDimensionsForm`](elementCmp);

    const setSpy = spyOn(elementCmp.proportionDimensions.form, 'patchValue').and.callThrough();

    // all in range
    elementCmp.proportionDimensions.activate();

    expect(setSpy).not.toHaveBeenCalled();

    // height > max
    elementCmp.getAbsoluteElementRect.and.returnValue({
      width: 600,
      height: 750,
    });

    elementCmp.proportionDimensions.activate();

    expect(setSpy).toHaveBeenCalled();
    expect(elementCmp.proportionDimensions.form.value).toEqual({
      width: 600,
      height: 700,
      constrainProportions: true,
      proportionRatio: null,
    });

  });

  it('should update proportion dimensions form', () => {

    const elementCmp: any = {
      definition: {
        data: {
          constrainProportions: true,
          proportionRation: 2,
        },
      },
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 600,
        height: 300,
      }),
    };

    spyOn<any>(plugin, 'getProportionDimensionsLimits').and.returnValues(
      {
        width: {
          min: 50,
          max: 1000,
        },
        height: {
          min: 50,
          max: 700,
        },
      },
      null,
      {
        width: {
          min: 50,
          max: 1000,
        },
        height: {
          min: 50,
          max: 700,
        },
      },
    );

    plugin[`initProportionDimensionsForm`](elementCmp);

    const widthSetValidatorsSpy = spyOn(elementCmp.proportionDimensions.form.controls.width, 'setValidators')
      .and.callThrough();
    const heightSetValidatorsSpy = spyOn(elementCmp.proportionDimensions.form.controls.height, 'setValidators')
      .and.callThrough();

    // w/o dimensions
    elementCmp.proportionDimensions.update();

    expect(widthSetValidatorsSpy).not.toHaveBeenCalled();
    expect(heightSetValidatorsSpy).not.toHaveBeenCalled();

    // w/ dimensions
    elementCmp.proportionDimensions.update();

    expect(widthSetValidatorsSpy).toHaveBeenCalled();
    expect(heightSetValidatorsSpy).toHaveBeenCalled();
    expect(elementCmp.proportionDimensions.limits.width.value).toEqual({
      min: 50,
      max: 1000,
    });
    expect(elementCmp.proportionDimensions.limits.height.value).toEqual({
      min: 50,
      max: 700,
    });

  });

  it('should get proportion dimensions limits', () => {

    const elementCmp: any = {
      definition: {},
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 600,
        height: 300,
      }),
      getMaxPossibleDimensions: jasmine.createSpy('getMaxPossibleDimensions').and.returnValues({}, null),
      getMinPossibleDimensions: jasmine.createSpy('getMinPossibleDimensions').and.returnValue(50),
    };

    // w/o heightMaxDimensions
    expect(plugin[`getProportionDimensionsLimits`](elementCmp)).toBeUndefined();
    expect(elementCmp.getMaxPossibleDimensions).toHaveBeenCalledTimes(2);
    expect(elementCmp.getMinPossibleDimensions).not.toHaveBeenCalled();

    // w/ dimensions
    elementCmp.getMaxPossibleDimensions.and.returnValue({
      size: 1000,
      spaceStart: 100,
    });

    expect(plugin[`getProportionDimensionsLimits`](elementCmp)).toEqual({
      width: { min: 50, max: 1000 },
      height: { min: 50, max: 900 },
    });
    expect(elementCmp.getMaxPossibleDimensions).toHaveBeenCalledTimes(4);
    expect(elementCmp.getMinPossibleDimensions).toHaveBeenCalledTimes(2);

  });

  // FIXME: There is a bug in codebase.
  it('should handle proportion dimensions form', fakeAsync(() => {

    const elementCmp = {
      definition: {
        id: 'elem-001',
        data: {},
      },
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 600,
        height: 300,
      }),
      styles: {
        width: null,
        height: null,
      },
      applyStyles: jasmine.createSpy('applyStyles'),
      proportionDimensions: null,
    };
    const limitsSpy = spyOn<any>(plugin, 'getProportionDimensionsLimits');
    let updateSpy: jasmine.Spy;
    let sub: Subscription;

    spyOn(plugin, 'calculateRatioProportion').and.returnValue(2);

    editorStore.updateElementKit.and.returnValue(of(null));

    /**
     * elementCmp.proportionDimensions is null
     */
    plugin[`handleProportionDimensionsForm`](elementCmp as any)
      .pipe(isEmpty())
      .subscribe(empty => expect(empty).toBe(true))
      .unsubscribe();

    /**
     * plugin.getProportionDimensionsLimits returns mocked data
     * constrainProportions is null
     */
    limitsSpy.and.returnValue({
      width: {
        min: 50,
        max: 1000,
      },
      height: {
        min: 50,
        max: 700,
      },
    });

    plugin[`initProportionDimensionsForm`](elementCmp as any);
    plugin[`handleProportionDimensionsForm`](elementCmp as any).subscribe();
    updateSpy = spyOn(elementCmp.proportionDimensions, 'update');

    // /**
    //  * form is INVALID
    //  */
    // elementCmp.proportionDimensions.form.patchValue({ width: 2000 });

    // tick(100);
    // console.log(elementCmp.proportionDimensions.form.valid);

    // expect(logger.log).toHaveBeenCalledOnceWith('Proportion Dimensions: Change: Invalid');
    // expect(elementCmp.styles).toEqual({
    //   width: null,
    //   height: null,
    // });
    // expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    // expect(updateSpy).not.toHaveBeenCalled();
    // expect(editorStore.updateElementKit).not.toHaveBeenCalled();

    // change width
    // elementCmp.proportionDimensions.form.patchValue({ width: 400 });

    // expect(editorStore.updateElementKit).toHaveBeenCalledWith(
    //   state.screen,
    //   {
    //     id: elementCmp.definition.id,
    //     data: {
    //       constrainProportions: null,
    //       proportionRatio: 2,
    //     },
    //   } as any,
    //   {
    //     [elementCmp.definition.id]: {
    //       width: 400,
    //       height: 300,
    //       constrainProportions: null,
    //       proportionRatio: 2,
    //     },
    //   } as any,
    // );

    // // change height
    // editorStore.updateElementKit.calls.reset();
    // elementCmp.proportionDimensions.form.patchValue({
    //   height: 100,
    // });

    // expect(editorStore.updateElementKit).toHaveBeenCalledWith(
    //   state.screen,
    //   {
    //     id: elementCmp.definition.id,
    //     data: {
    //       constrainProportions: null,
    //       proportionRatio: 1.3333333333333333,
    //     },
    //   } as any,
    //   {
    //     [elementCmp.definition.id]: {
    //       width: 400,
    //       height: 100,
    //       constrainProportions: null,
    //       proportionRatio: 1.3333333333333333,
    //     },
    //   } as any,
    // );

    // // constrainProportions = TRUE
    // // width & height are OK with proportion
    // sub.unsubscribe();
    // elementCmp.proportionDimensions.form.patchValue({ constrainProportions: true });

    // sub = plugin[`handleProportionDimensionsForm`](elementCmp as any).subscribe((result) => {
    //   if (Array.isArray(result)) {
    //     expect(result.filter(Boolean)[0]).toEqual({
    //       width: 600,
    //       height: 300,
    //       constrainProportions: true,
    //       proportionRatio: 4,
    //     });
    //     expect(elementCmp.applyStyles).toHaveBeenCalled();
    //   }
    // });

    // elementCmp.proportionDimensions.form.patchValue({
    //   width: 600,
    //   height: 300,
    // });

    // // width & height are NOT OK with proportion
    // sub.unsubscribe();
    // let changing = 'height';

    // sub = plugin[`handleProportionDimensionsForm`](elementCmp as any).subscribe((result) => {
    //   if (Array.isArray(result)) {
    //     const expected = {
    //       width: changing === 'width' ? 600 : 800,
    //       height: changing === 'width' ? 300 : 400,
    //     };
    //     const filtered = result.filter(dimension => !!dimension
    //       && dimension.width === expected.width
    //       && dimension.height === expected.height);

    //     expect(filtered.length).toBeGreaterThan(0);
    //     expect(elementCmp.applyStyles).toHaveBeenCalled();
    //   }
    // });

    // elementCmp.proportionDimensions.form.patchValue({
    //   height: 400,
    // });

    // changing = 'width';
    // elementCmp.proportionDimensions.form.patchValue({
    //   width: 600,
    // });

    // // constrain proportions change
    // elementCmp.proportionDimensions.form.patchValue({ constrainProportions: false });

    // expect(elementCmp.definition.data['constrainProportions']).toBeUndefined();

    // // submit
    // elementCmp.proportionDimensions.submit.next();

    // // invalid form
    // sub.unsubscribe();
    // sub = plugin[`handleProportionDimensionsForm`](elementCmp as any).pipe(skip(1)).subscribe(() => {
    //   expect(logger.log).toHaveBeenCalledWith('Proportion Dimensions: Change: Invalid');
    // });

    // elementCmp.proportionDimensions.form.patchValue({ width: 2000 });

    // // value.width is less than limits.width.min
    // elementCmp.proportionDimensions.form.patchValue({ width: 20 });
    // expect(elementCmp.proportionDimensions.form.value.width).toBe(50);

    // // value.height is less than limits.height.min
    // elementCmp.proportionDimensions.form.patchValue({ height: 30 });
    // expect(elementCmp.proportionDimensions.form.value.height).toBe(50);

    // sub.unsubscribe();

  }));

  it('should calculate ratio proportion', () => {

    const proportionDimensions = {
      form: new FormGroup({
        width: new FormControl(600),
        height: new FormControl(300),
      }),
    };

    // heigh > 0
    expect(plugin.calculateRatioProportion(proportionDimensions)).toBe(2);

    // height <= 0
    proportionDimensions.form.patchValue({
      height: 0,
    });

    expect(plugin.calculateRatioProportion(proportionDimensions)).toBe(1);

  });

  it('should init opacity form', () => {

    const elementCmp: any = {
      styles: { opacity: 'undefined' },
    };

    // opacity is NaN
    plugin[`initOpacityForm`](elementCmp);

    expect(elementCmp.opacity).toBeTruthy();
    expect(elementCmp.opacity.initialValue.opacity).toBe(100);
    expect(elementCmp.opacity.form.value.opacity).toBe(100);

    // opacity is number
    elementCmp.styles.opacity = 0.5;

    plugin[`initOpacityForm`](elementCmp);

    expect(elementCmp.opacity.initialValue.opacity).toBe(50);
    expect(elementCmp.opacity.form.value.opacity).toBe(50);

  });

  it('should handle opacity form', () => {

    const elementCmp: any = {
      definition: { id: 'elem' },
      styles: { opacity: 1 },
      applyStyles: jasmine.createSpy('applyStyles'),
    };

    editorStore.updateStyles.and.returnValue(of(null));

    plugin[`initOpacityForm`](elementCmp);
    plugin[`handleOpacityForm`](elementCmp).subscribe();

    /**
     * form is INVALID
     */
    elementCmp.opacity.form.patchValue({ opacity: 150 });
    elementCmp.opacity.submit.next();

    expect(logger.log).toHaveBeenCalledOnceWith('Opacity: Change: Invalid');
    expect(elementCmp.styles.opacity).toBe(1);
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(editorStore.updateStyles).not.toHaveBeenCalled();

    /**
     * form is VALID
     */
    logger.log.calls.reset();
    elementCmp.opacity.form.patchValue({ opacity: 55 });
    elementCmp.opacity.submit.next();

    expect(logger.log.calls.allArgs()).toEqual([
      ['Opacity: Change: Valid ', elementCmp.opacity.form.value],
      ['Opacity: Submit ', elementCmp.opacity.form.value],
    ]);
    expect(elementCmp.styles.opacity).toEqual(0.55);
    expect(elementCmp.applyStyles).toHaveBeenCalled();
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: { opacity: 0.55 },
    });

  });

  it('should init image adjustment form', () => {

    const elementCmp: any = {
      styles: {
        imageSaturation: 13,
        imageExposure: 13,
      },
    };

    // w/ values
    plugin[`initImageAdjustment`](elementCmp);

    expect(elementCmp.imageAdjustment).toBeTruthy();
    expect(elementCmp.imageAdjustment.initialValue).toEqual({
      saturation: 13,
      exposure: 13,
    });
    expect(elementCmp.imageAdjustment.form.value).toEqual({
      saturation: 13,
      exposure: 13,
    });

    // w/o values
    elementCmp.styles = {};

    plugin[`initImageAdjustment`](elementCmp);

    expect(elementCmp.imageAdjustment.initialValue).toEqual({
      saturation: 0,
      exposure: 0,
    });
    expect(elementCmp.imageAdjustment.form.value).toEqual({
      saturation: 0,
      exposure: 0,
    });

  });

  it('should handle image adjustment form', fakeAsync(() => {

    const elementCmp: any = {
      definition: { id: 'elem' },
      styles: {
        imageSaturation: 13,
        imageExposure: 13,
      },
      applyStyles: jasmine.createSpy('applyStyles'),
    };
    const getImageFilterStringSpy = spyOn<any>(plugin, 'getImageFilterString').and.callThrough();

    editorStore.updateStylesByScreen.and.returnValue(of(null));

    plugin[`initImageAdjustment`](elementCmp);
    plugin[`handleImageAdjustment`](elementCmp).subscribe();

    /**
     * elementCmp.imageAdjustment.form is INVALID
     */
    elementCmp.imageAdjustment.form.patchValue({
      saturation: 120,
      exposure: -120,
    });

    tick(500);

    expect(logger.log.calls.allArgs()).toEqual(Array(2).fill(['Image adjustment: Change: Invalid']));
    expect(elementCmp.styles.imageFilter).toBeUndefined();
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(getImageFilterStringSpy).not.toHaveBeenCalled();
    expect(editorStore.updateStylesByScreen).not.toHaveBeenCalled();

    /**
     * elementCmp.imageAdjustment.form is VALID
     */
    logger.log.calls.reset();
    elementCmp.imageAdjustment.form.patchValue({
      saturation: 50,
      exposure: -10,
    });

    tick(500);

    expect(logger.log.calls.allArgs()).toEqual([
      ['Image adjustment: Change: Valid', {
        saturation: 50,
        exposure: -10,
      }],
      ['Image adjustment: Submit ', {
        imageSaturation: 50,
        imageExposure: -10,
      }],
    ]);
    expect(elementCmp.styles.imageFilter).toEqual(' saturate(150%) brightness(90%)');
    expect(elementCmp.applyStyles).toHaveBeenCalled();
    expect(getImageFilterStringSpy).toHaveBeenCalledWith({
      imageSaturation: 50,
      imageExposure: -10,
    });
    expect(getImageFilterStringSpy).toHaveBeenCalledTimes(4);
    expect(editorStore.updateStylesByScreen).toHaveBeenCalledWith(
      Object.values(PebScreen).reduce((acc, screen) => ({
        ...acc,
        [screen]: {
          [elementCmp.definition.id]: {
            imageFilter: ' saturate(150%) brightness(90%)',
          },
        },
      }), {}),
    );

  }));

  it('should get image filter string', () => {

    const styles = {
      imageSaturation: 13,
      imageExposure: 13,
    };

    // w/ saturation & w/ exposure & exposure > 0
    expect(plugin[`getImageFilterString`](styles)).toEqual(' saturate(113%) brightness(113%) contrast(113%)');

    // saturation = null & exposure = null
    styles.imageSaturation = null;
    styles.imageExposure = null;

    expect(plugin[`getImageFilterString`](styles)).toEqual('');

  });

  it('should init description form', () => {

    const elementCmp: any = {
      definition: {
        data: {
          description: 'element component',
        },
      },
    };

    // w/ description
    plugin[`initDescriptionForm`](elementCmp);

    expect(elementCmp.description).toBeTruthy();
    expect(elementCmp.description.initialValue.description).toEqual(elementCmp.definition.data.description);
    expect(elementCmp.description.form.controls.description.value).toEqual(elementCmp.definition.data.description);

    // w/o data
    elementCmp.definition.data = undefined;
    plugin[`initDescriptionForm`](elementCmp);

    expect(elementCmp.description.initialValue.description).toEqual('');
    expect(elementCmp.description.form.controls.description.value).toEqual('');

  });

  it('should handle description form', () => {

    const elementCmp: any = {
      definition: {
        data: {
          test: 'data',
          description: 'element component',
        },
      },
    };

    editorStore.updateElement.and.returnValue(of(null));

    plugin[`initDescriptionForm`](elementCmp);
    plugin[`handleDescriptionForm`](elementCmp).subscribe();

    /**
     * form is INVALID
     */
    elementCmp.description.form.controls.description.setValidators([Validators.minLength(10)]);
    elementCmp.description.form.patchValue({ description: 'desc' });
    elementCmp.description.submit.next();

    expect(logger.log).toHaveBeenCalledOnceWith('Description: Change: Invalid');
    expect(editorStore.updateElement).not.toHaveBeenCalled();

    /**
     * form is VALID
     */
    logger.log.calls.reset();
    elementCmp.description.form.patchValue({ description: 'test description' });
    elementCmp.description.submit.next();

    expect(logger.log).toHaveBeenCalledOnceWith('Description: Submit ', {
      description: elementCmp.description.form.value.description,
    });
    expect(editorStore.updateElement).toHaveBeenCalledWith({
      ...elementCmp.definition,
      data: {
        ...elementCmp.definition.data,
        description: elementCmp.description.form.value.description,
      },
    });

  });

  it('should init radius form', () => {

    const elementCmp: any = {
      styles: {
        borderRadius: null,
      },
    };

    plugin[`initRadiusForm`](elementCmp);

    expect(elementCmp.radius).toBeDefined();
    expect(elementCmp.radius.initialValue).toEqual({
      borderRadius: 0,
    });
    expect(elementCmp.radius.form.value).toEqual({
      borderRadius: 0,
    });

  });

  it('should handle radius form', () => {

    const elementCmp: any = {
      definition: { id: 'elem' },
      styles: { borderRadius: null },
      applyStyles: jasmine.createSpy('applyStyles'),
    };
    const sidebarRef = {
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
    };

    editorStore.updateStyles.and.returnValue(of(null));

    plugin[`initRadiusForm`](elementCmp);
    plugin[`handleRadiusForm`](elementCmp, sidebarRef as any).subscribe();

    /**
     * form is INVALID
     */
    elementCmp.radius.form.controls.borderRadius.setValidators([Validators.max(100)]);
    elementCmp.radius.form.patchValue({ borderRadius: 113 });
    elementCmp.radius.submit.next();

    expect(logger.log).toHaveBeenCalledOnceWith('Radius: Change: Invalid');
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(sidebarRef.changeDetectorRef.detectChanges).not.toHaveBeenCalled();
    expect(editorStore.updateStyles).not.toHaveBeenCalled();

    /**
     * form is VALID
     */
    logger.log.calls.reset();
    elementCmp.radius.form.patchValue({ borderRadius: 10 });
    elementCmp.radius.submit.next();

    expect(logger.log.calls.allArgs()).toEqual([
      ['Radius: Change: Valid', elementCmp.radius.form.value],
      ['Radius: Submit ', elementCmp.radius.form.value],
    ]);
    expect(elementCmp.applyStyles).toHaveBeenCalled();
    expect(sidebarRef.changeDetectorRef.detectChanges).toHaveBeenCalled();
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: elementCmp.radius.form.value,
    });

  });

  it('should init proportions form', () => {

    const elementCmp: any = {
      styles: { objectFit: 'fit' },
    };

    // w/ value
    plugin[`initProportionsForm`](elementCmp);

    expect(elementCmp.proportions).toBeTruthy();
    expect(elementCmp.proportions.initialValue.objectFit).toEqual(elementCmp.styles.objectFit);
    expect(elementCmp.proportions.form.value).toEqual({
      objectFit: elementCmp.styles.objectFit,
    });

    // w/o value
    elementCmp.styles.objectFit = undefined;

    plugin[`initProportionsForm`](elementCmp);

    expect(elementCmp.proportions.initialValue.objectFit).toEqual('contain');
    expect(elementCmp.proportions.form.value).toEqual({
      objectFit: 'contain',
    });

  });

  it('should handle proportions form', () => {

    const elementCmp: any = {
      definition: { id: 'elem' },
      styles: { objectFit: 'fit' },
      applyStyles: jasmine.createSpy('applyStyles'),
    };

    editorStore.updateStyles.and.returnValue(of(null));

    plugin[`initProportionsForm`](elementCmp);
    plugin[`handleProportionsForm`](elementCmp).subscribe();

    /**
     * form is INVALID
     */
    elementCmp.proportions.form.controls.objectFit.setValidators([Validators.required]);
    elementCmp.proportions.form.patchValue({ objectFit: null });
    elementCmp.proportions.submit.next();

    expect(logger.log).toHaveBeenCalledOnceWith('Proportions: Change: Invalid');
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(editorStore.updateStyles).not.toHaveBeenCalled();

    /**
     * form is VALID
     */
    logger.log.calls.reset();
    elementCmp.proportions.form.patchValue({ objectFit: 'contain' });
    elementCmp.proportions.submit.next();

    expect(logger.log.calls.allArgs()).toEqual([
      ['Proportions: Change: Valid ', elementCmp.proportions.form.value],
      ['Proportions: Submit ', elementCmp.proportions.form.value],
    ]);
    expect(elementCmp.applyStyles).toHaveBeenCalled();
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: elementCmp.proportions.form.value,
    });

  });

  it('should init image filter form', () => {

    const elementCmp = {
      styles: {
        filter: 'brightness(13) saturate(13)',
      },
    } as any;

    // w/ values
    plugin[`initImageFilterForm`](elementCmp);

    expect(elementCmp.filter).toBeTruthy();
    expect(elementCmp.filter.initialValue.brightness).toBe(-87);
    expect(elementCmp.filter.initialValue.saturate).toBe(-87);
    expect(elementCmp.filter.form.value).toEqual({
      brightness: -87,
      saturate: -87,
    });

    // w/o values
    elementCmp.styles.filter = undefined;

    plugin[`initImageFilterForm`](elementCmp);

    expect(elementCmp.filter.initialValue).toEqual({
      brightness: 0,
      saturate: 0,
    });
    expect(elementCmp.filter.form.value).toEqual({
      brightness: 0,
      saturate: 0,
    });

  });

  it('should handle image filter form', () => {

    const elementCmp: any = {
      definition: { id: 'elem' },
      styles: {
        filter: 'brightness(13) saturate(13)',
      },
      applyStyles: jasmine.createSpy('applyStyles'),
    };
    const getFilterStringSpy = spyOn(plugin, 'getFilterString').and.callThrough();

    editorStore.updateStyles.and.returnValue(of(null) as any);

    plugin[`initImageFilterForm`](elementCmp);
    plugin[`handleImageFilterForm`](elementCmp).subscribe();

    /**
     * form is INVALID
     */
    elementCmp.filter.form.patchValue({ brightness: 200 });
    elementCmp.filter.submit.next();

    expect(logger.log).toHaveBeenCalledOnceWith('Filter: Change: Invalid');
    expect(getFilterStringSpy).not.toHaveBeenCalled();
    expect(elementCmp.styles.filter).toEqual('brightness(13) saturate(13)');
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(editorStore.updateStyles).not.toHaveBeenCalled();

    /**
     * form is VALID
     */
    logger.log.calls.reset();
    elementCmp.filter.form.patchValue({ brightness: 10 });
    elementCmp.filter.submit.next();

    expect(logger.log.calls.allArgs()).toEqual([
      ['Filter: Change: Valid ', elementCmp.filter.form.value],
      ['Filter: Submit ', elementCmp.filter.form.value],
    ]);
    expect(getFilterStringSpy.calls.allArgs()).toEqual(Array(2).fill([elementCmp.filter.form.value]));
    expect(elementCmp.styles.filter).toEqual('brightness(110%) saturate(13%)');
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      [elementCmp.definition.id]: {
        filter: 'brightness(110%) saturate(13%)',
      },
    });

  });

  it('should init shadow form', () => {

    const elementCmp = {
      styles: {
        shadow: null,
      },
      shadow: null,
    };
    const parseSpy = spyOn<any>(plugin, 'parseShadowString').and.callThrough();

    /**
     * elementCmp.styles.shadow is null
     */
    plugin[`initShadowForm`](elementCmp as any);

    expect(elementCmp.shadow).toBeDefined();
    expect(elementCmp.shadow.initialValue).toEqual({
      hasShadow: false,
      shadowBlur: 5,
      shadowColor: '#000000',
      shadowOffset: 10,
      shadowOpacity: 100,
      shadowAngle: 315,
    });
    expect(elementCmp.shadow.form.value).toEqual({
      hasShadow: false,
      shadowBlur: 5,
      shadowColor: '#000000',
      shadowOffset: 10,
      shadowOpacity: 100,
      shadowAngle: 315,
    });
    expect(parseSpy).toHaveBeenCalledWith(null);

    /**
     * elementCmp.styles.shadow is set
     */
    elementCmp.shadow = null;
    elementCmp.styles.shadow = 'drop-shadow(0 3pt 5pt rgba(51,51,51,1))';

    plugin[`initShadowForm`](elementCmp as any);

    expect(elementCmp.shadow).toBeDefined();
    expect(elementCmp.shadow.initialValue).toEqual({
      hasShadow: true,
      shadowBlur: 5,
      shadowColor: '#333333',
      shadowOffset: 3,
      shadowOpacity: 100,
      shadowAngle: 270,
    });
    expect(elementCmp.shadow.form.value).toEqual({
      hasShadow: true,
      shadowBlur: 5,
      shadowColor: '#333333',
      shadowOffset: 3,
      shadowOpacity: 100,
      shadowAngle: 270,
    });
    expect(parseSpy).toHaveBeenCalledWith(elementCmp.styles.shadow);

  });

  it('should handle shadow form', () => {

    const elementCmp: any = {
      definition: { id: 'elem' },
      styles: {
        shadow: 'drop-shadow(0 3pt 5pt rgba(51,51,51,1))',
      },
      applyStyles: jasmine.createSpy('applyStyles'),
    };
    const shadowToStringSpy = spyOn(plugin, 'shadowToString').and.callThrough();

    editorStore.updateStyles.and.returnValue(of(null));

    plugin[`initShadowForm`](elementCmp);
    plugin[`handleShadowForm`](elementCmp).subscribe();

    /**
     * form is invalid
     */
    elementCmp.shadow.form.patchValue({ shadowBlur: 150 });
    elementCmp.shadow.submit.next();

    expect(logger.log).toHaveBeenCalledOnceWith('Shadow: Change: Invalid');
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(shadowToStringSpy).not.toHaveBeenCalled();

    /**
     * form is valid
     */
    logger.log.calls.reset();
    elementCmp.shadow.form.patchValue({ shadowBlur: 50 });
    elementCmp.shadow.submit.next();

    expect(logger.log.calls.allArgs()).toEqual([
      ['Shadow: Change: Valid ', elementCmp.shadow.form.value],
      ['Shadow: Submit ', elementCmp.shadow.form.value],
    ]);
    expect(elementCmp.applyStyles).toHaveBeenCalled();
    expect(editorStore.updateStyles).toHaveBeenCalled();

  });

  it('should init background form', () => {

    const elementCmp = {
      styles: {
        backgroundColor: null,
        backgroundImage: null,
        backgroundSize: 'cover',
        backgroundRepeat: null,
        mediaType: null,
        imageBackgroundColor: null,
        color: null,
      },
      background: null,
    };
    const updateSpy = spyOn<any>(plugin, 'updateImageScaleFieldSetting');

    /**
     * the following props of element.styles are null:
     *
     * backgroundImage
     * backgroundColor
     * backgroundRepeat
     * imageBackgroundColor
     * color
     * mediaType
     */
    plugin[`initBackgroundForm`](elementCmp as any);

    expect(elementCmp.background).toBeDefined();
    expect(elementCmp.background.initialValue).toEqual({
      bgColor: '',
      bgColorGradientAngle: null,
      bgColorGradientStart: null,
      bgColorGradientStartPercent: 0,
      bgColorGradientStop: null,
      bgColorGradientStopPercent: 100,
      file: null,
      bgImage: '',
      fillType: { name: FillType.None },
      imageSize: {
        value: ImageSize.Cover,
        name: 'Scale to Fill',
      },
      imageScale: 100,
      mediaType: MediaType.None,
      imageBgForm: { bgColor: '#000000' },
    });
    expect(elementCmp.background.form.value).toEqual(elementCmp.background.initialValue);
    expect(updateSpy).toHaveBeenCalledWith(elementCmp.background.form);

    /**
     * the following props of element.styles are set
     *
     * backgroundImage (not gradient)
     * backgroundColor
     * color
     * mediaType
     */
    elementCmp.styles.backgroundImage = 'test.jpg';
    elementCmp.styles.backgroundColor = '#cccccc';
    elementCmp.styles.backgroundRepeat = ''
    elementCmp.styles.color = '#333333';
    elementCmp.styles.mediaType = MediaType.Image;
    elementCmp.background = null;

    plugin[`initBackgroundForm`](elementCmp as any);

    expect(elementCmp.background).toBeDefined();
    expect(elementCmp.background.initialValue).toEqual({
      bgColor: '#cccccc',
      bgColorGradientAngle: null,
      bgColorGradientStart: null,
      bgColorGradientStartPercent: 0,
      bgColorGradientStop: null,
      bgColorGradientStopPercent: 100,
      file: null,
      bgImage: 'test.jpg',
      fillType: { name: FillType.ImageFill },
      imageSize: {
        value: ImageSize.Cover,
        name: 'Scale to Fill',
      },
      imageScale: 100,
      mediaType: MediaType.Image,
      imageBgForm: { bgColor: '#333333' },
    });
    expect(elementCmp.background.form.value).toEqual(elementCmp.background.initialValue);

    /**
     * element.styles.backgroundImage is gradient
     * element.styles.backgroundRepeat is set
     * element.styles.imageBackgroundColor is set
     */
    elementCmp.styles.backgroundImage = 'linear-gradient(170deg, #0000ff 30%, #ff0000 65%)';
    elementCmp.styles.backgroundRepeat = 'repeat';
    elementCmp.styles.imageBackgroundColor = '#999999';
    elementCmp.background = null;

    plugin[`initBackgroundForm`](elementCmp as any);

    expect(elementCmp.background).toBeDefined();
    expect(elementCmp.background.initialValue).toEqual({
      bgColor: '#cccccc',
      bgColorGradientAngle: 170,
      bgColorGradientStart: '#0000ff',
      bgColorGradientStartPercent: 30,
      bgColorGradientStop: '#ff0000',
      bgColorGradientStopPercent: 65,
      file: null,
      bgImage: 'linear-gradient(170deg, #0000ff 30%, #ff0000 65%)',
      fillType: { name: FillType.GradientFill },
      imageSize: {
        value: ImageSize.Initial,
        name: 'Tile',
      },
      imageScale: 100,
      mediaType: MediaType.Image,
      imageBgForm: { bgColor: '#999999' },
    });
    expect(elementCmp.background.form.value).toEqual(elementCmp.background.initialValue);

  });

  it('should handle background form', fakeAsync(() => {

    const elementCmp = {
      nativeElement: document.createElement('div'),
      definition: {
        id: 'elem',
        data: {
          colCount: 3,
        },
      },
      styles: {
        backgroundColor: null,
        backgroundImage: null,
        backgroundSize: 'cover',
      },
      target: {
        element: {
          data: null,
        },
      },
      applyStyles: jasmine.createSpy('applyStyles'),
      detectChanges: jasmine.createSpy('detectChanges'),
      background: null as { initialValue: any, form: FormGroup, submit: Subject<void> },
    };
    const sidebarRef = {
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
    } as any;
    const getBgGradientSpy = spyOn<any>(plugin, 'getBackgroundGradient').and.callThrough();
    const updateBgGradientSpy = spyOn<any>(plugin, 'updateGradientBackground');
    const updateImageScaleFieldSpy = spyOn<any>(plugin, 'updateImageScaleFieldSetting').and.callThrough();
    const updateStylesSpy = spyOn(plugin, 'updateStyles');
    const selectedElement = {
      nativeElement: document.createElement('div'),
      definition: {
        id: 'elem-001',
        data: {
          colCount: 2,
        },
      },
      styles: {
        backgroundColor: null,
        backgroundImage: null,
      },
      target: {
        element: {
          data: null,
        },
      },
      applyStyles: jasmine.createSpy('applyStyles'),
      detectChanges: jasmine.createSpy('detectChanges'),
    };
    let sub: Subscription;

    editorStore.updateStyles.and.returnValue(of({ updated: 'styles' }) as any);
    editorStore.updateElementKit.and.returnValue(of({ updated: 'elementKit' }) as any);
    renderer.getElementComponent.and.returnValue(selectedElement as any);

    plugin[`initBackgroundForm`](elementCmp as any);

    const bg = elementCmp.background;
    const nextSpy = spyOn(bg.submit, 'next');

    // handle bgColor changes
    {
      /**
       * state.selectedGridCells is []
       */
      state.selectedGridCells = [];

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change bgColor
       * value is null
       */
      bg.form.patchValue({ bgColor: null });

      expect(elementCmp.applyStyles).toHaveBeenCalled();
      expect(elementCmp.detectChanges).toHaveBeenCalled();
      expect(bg.form.value.fillType.name).toEqual(FillType.None);

      /**
       * value is set
       * bg.form.value.fillType.name is FillType.None
       */
      elementCmp.applyStyles.calls.reset();
      elementCmp.detectChanges.calls.reset();

      bg.form.patchValue({ bgColor: '#333333' });

      expect(elementCmp.applyStyles).toHaveBeenCalled();
      expect(elementCmp.detectChanges).toHaveBeenCalled();
      expect(bg.form.value.fillType.name).toEqual(FillType.ColorFill);

      /**
       * bg.form.value.fillType.name is FillType.ColorFill
       */
      bg.form.patchValue({ bgColor: '#333333' });

      /**
       * state.selectedGridCells is set
       */
      elementCmp.applyStyles.calls.reset();
      elementCmp.detectChanges.calls.reset();
      state.selectedGridCells = [{ id: 'c-001' }] as any[];
      sub.unsubscribe();

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      bg.form.patchValue({ bgColor: '#333333' });

      expect(elementCmp.applyStyles).not.toHaveBeenCalled();
      expect(elementCmp.detectChanges).not.toHaveBeenCalled();
      expect(selectedElement.applyStyles).toHaveBeenCalled();
      expect(selectedElement.detectChanges).toHaveBeenCalled();
      expect(selectedElement.styles).toEqual({
        backgroundColor: '#333333',
        backgroundImage: '',
      });

      selectedElement.applyStyles.calls.reset();
      selectedElement.detectChanges.calls.reset();
      selectedElement.styles = {} as any;
      sub.unsubscribe();
    }

    // handle imageBgForm.bgColor changes
    {
      /**
       * state.selectedGridCells is []
       */
      state.selectedGridCells = [];

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      bg.form.patchValue({
        imageBgForm: {
          bgColor: '#454545',
        },
      });

      expect(elementCmp.applyStyles).toHaveBeenCalled();
      expect(elementCmp.detectChanges).toHaveBeenCalled();
      expect(elementCmp.styles['imageBackgroundColor']).toEqual('#454545');

      /**
       * state.selectedGridCells is set
       */
      elementCmp.applyStyles.calls.reset();
      elementCmp.detectChanges.calls.reset();
      state.selectedGridCells = [{ id: 'c-001' }] as any[];
      sub.unsubscribe();

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      bg.form.patchValue({
        imageBgForm: {
          bgColor: '#999999',
        },
      });

      expect(selectedElement.applyStyles).toHaveBeenCalled();
      expect(selectedElement.detectChanges).toHaveBeenCalled();
      expect(selectedElement.styles['imageBackgroundColor']).toEqual('#999999');

      selectedElement.applyStyles.calls.reset();
      selectedElement.detectChanges.calls.reset();
      selectedElement.styles = {} as any;
      sub.unsubscribe();
    }

    // handle gradient props' changes
    {
      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change bgColorGradientAngle
       * value is null
       */
      bg.form.patchValue({ bgColorGradientAngle: null });

      expect(getBgGradientSpy).not.toHaveBeenCalled();
      expect(updateBgGradientSpy).not.toHaveBeenCalled();

      /**
       * value is 0
       */
      bg.form.patchValue({ bgColorGradientAngle: 0 });

      expect(getBgGradientSpy).toHaveBeenCalledWith(0, null, null, null, null, bg.form);
      expect(updateBgGradientSpy).toHaveBeenCalled();

      /**
       * change bgColorGradientStart
       * value is null
       */
      getBgGradientSpy.calls.reset();
      updateBgGradientSpy.calls.reset();
      bg.form.patchValue({ bgColorGradientStart: null });

      expect(getBgGradientSpy).not.toHaveBeenCalled();
      expect(updateBgGradientSpy).not.toHaveBeenCalled();

      /**
       * value is set
       */
      bg.form.patchValue({ bgColorGradientStart: '#333333' });

      expect(getBgGradientSpy).toHaveBeenCalledWith(null, '#333333', null, null, null, bg.form);
      expect(updateBgGradientSpy).toHaveBeenCalled();

      /**
       * change bgColorGradientStartPercent
       * value is null
       */
      getBgGradientSpy.calls.reset();
      updateBgGradientSpy.calls.reset();
      bg.form.patchValue({ bgColorGradientStartPercent: null });

      expect(getBgGradientSpy).not.toHaveBeenCalled();
      expect(updateBgGradientSpy).not.toHaveBeenCalled();

      /**
       * value is set
       */
      bg.form.patchValue({ bgColorGradientStartPercent: 10 });

      expect(getBgGradientSpy).toHaveBeenCalledWith(null, null, 10, null, null, bg.form);
      expect(updateBgGradientSpy).toHaveBeenCalled();

      /**
       * change bgColorGradientStop
       * value is null
       */
      getBgGradientSpy.calls.reset();
      updateBgGradientSpy.calls.reset();
      bg.form.patchValue({ bgColorGradientStop: null });

      expect(getBgGradientSpy).not.toHaveBeenCalled();
      expect(updateBgGradientSpy).not.toHaveBeenCalled();

      /**
       * value is set
       */
      bg.form.patchValue({ bgColorGradientStop: '#999999' });

      expect(getBgGradientSpy).toHaveBeenCalledWith(null, null, null, '#999999', null, bg.form);
      expect(updateBgGradientSpy).toHaveBeenCalled();

      /**
       * change bgColorGradientStopPercent
       * value is null
       */
      getBgGradientSpy.calls.reset();
      updateBgGradientSpy.calls.reset();
      bg.form.patchValue({ bgColorGradientStopPercent: null });

      expect(getBgGradientSpy).not.toHaveBeenCalled();
      expect(updateBgGradientSpy).not.toHaveBeenCalled();

      /**
       * value is set
       */
      bg.form.patchValue({ bgColorGradientStopPercent: 75 });

      expect(getBgGradientSpy).toHaveBeenCalledWith(null, null, null, null, 75, bg.form);
      expect(updateBgGradientSpy).toHaveBeenCalled();

      sub.unsubscribe();
    }

    // handle bgImage changes
    {
      const updateValueAndValiditySpy = spyOn(bg.form.get('imageSize'), 'updateValueAndValidity');
      editorStore.updateElementKit.and.returnValue(of(null));

      /**
       * state.selectedGridCells is []
       */
      state.selectedGridCells = [];

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change bgImage
       * value is null
       */
      bg.form.patchValue({ bgImage: null });

      tick(300);

      expect(elementCmp.applyStyles).toHaveBeenCalled();
      expect(elementCmp.detectChanges).toHaveBeenCalled();
      expect(elementCmp.styles['mediaType']).toEqual(MediaType.Image);
      expect(updateImageScaleFieldSpy).toHaveBeenCalled();
      expect(sidebarRef.changeDetectorRef.detectChanges).toHaveBeenCalled();
      expect(updateValueAndValiditySpy).toHaveBeenCalled();
      expect(editorStore.updateElementKit).toHaveBeenCalledWith(state.screen, elementCmp.definition as any, {
        [elementCmp.definition.id]: {
          backgroundImage: null,
          backgroundColor: '',
        },
      });

      /**
       * value is 'test.jpg'
       */
      editorStore.updateElementKit.calls.reset();
      bg.form.patchValue({ bgImage: 'test.jpg' });

      tick(300);

      expect(elementCmp.styles.backgroundColor).toEqual('');
      expect(editorStore.updateElementKit).toHaveBeenCalledWith(state.screen, elementCmp.definition as any, {
        [elementCmp.definition.id]: {
          backgroundImage: 'test.jpg',
          backgroundColor: '',
          mediaType: MediaType.Image,
        },
      });

      /**
       * state.selectedGridCells is set
       */
      editorStore.updateElementKit.calls.reset();
      elementCmp.applyStyles.calls.reset();
      elementCmp.detectChanges.calls.reset();
      state.selectedGridCells = [{ id: 'c-001' }] as any[];
      sub.unsubscribe();

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change bgImage
       * value is null
       */
      bg.form.patchValue({ bgImage: null });

      tick(300);

      expect(selectedElement.applyStyles).toHaveBeenCalled();
      expect(selectedElement.detectChanges).toHaveBeenCalled();
      expect(editorStore.updateElementKit).toHaveBeenCalledWith(state.screen, [selectedElement.definition] as any[], [{
        [selectedElement.definition.id]: {
          backgroundImage: null,
          backgroundColor: '',
        },
      }]);

      /**
       * value is set
       */
      bg.form.patchValue({ bgImage: 'test.jpg' });

      tick(300);

      expect(selectedElement.styles.backgroundColor).toEqual('');
      expect(editorStore.updateElementKit).toHaveBeenCalledWith(state.screen, [selectedElement.definition] as any[], [{
        [selectedElement.definition.id]: {
          backgroundImage: 'test.jpg',
          backgroundColor: '',
          mediaType: MediaType.Image,
        },
      }]);

      /**
       * value is gradient
       */
      selectedElement.applyStyles.calls.reset();
      selectedElement.detectChanges.calls.reset();
      updateImageScaleFieldSpy.calls.reset();
      updateValueAndValiditySpy.calls.reset();
      sidebarRef.changeDetectorRef.detectChanges.calls.reset();

      bg.form.patchValue({
        bgImage: 'linear-gradient(100deg, #333333 30%, #cccccc 95%)',
      });

      tick(300);

      expect(elementCmp.applyStyles).not.toHaveBeenCalled();
      expect(elementCmp.detectChanges).not.toHaveBeenCalled();
      expect(selectedElement.applyStyles).not.toHaveBeenCalled();
      expect(selectedElement.detectChanges).not.toHaveBeenCalled();
      expect(updateImageScaleFieldSpy).not.toHaveBeenCalled();
      expect(updateValueAndValiditySpy).not.toHaveBeenCalled();
      expect(sidebarRef.changeDetectorRef.detectChanges).not.toHaveBeenCalled();

      updateValueAndValiditySpy.and.callThrough();
      sub.unsubscribe();
    }

    // handle file changes
    {
      const base64Image = 'data:image/jpeg;base64';
      const toBase64Spy = spyOn(utils, 'toBase64').and.resolveTo(base64Image);
      const postMessageSpy = jasmine.createSpy('postMessage');
      const patchSpy = spyOn(bg.form.get('bgImage'), 'patchValue');
      const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
      const url = 'c-cdn/test-entity-images/gid-001';
      const messageChannelMock = {
        port1: {
          onmessage: null as Function,
        },
        port2: { test: 'port2' },
      };
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      spyOnProperty(navigator.serviceWorker, 'controller').and.returnValue({
        postMessage: postMessageSpy,
      });
      spyOn(window, 'MessageChannel').and.returnValue(messageChannelMock as any);

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change file
       * editorStore.updateElementKit returns mocked data
       * resolve promise
       */
      bg.form.patchValue({ file });

      flushMicrotasks();

      messageChannelMock.port1.onmessage({ data: { test: true } });
      expect(generateIdSpy).toHaveBeenCalledWith(PebShopContainer.Builder);
      expect(messageChannelMock.port1.onmessage).toBeDefined();
      expect(mediaService.uploadImage).toHaveBeenCalledWith(file, 'cdn/test-entity-images', 'gid-001');
      expect(toBase64Spy).toHaveBeenCalledWith(file);
      expect(postMessageSpy).toHaveBeenCalledWith({
        url,
        data: base64Image,
        action: 'UPLOAD',
      }, [messageChannelMock.port2]);
      expect(elementCmp.styles.backgroundImage).toEqual(url);
      expect(patchSpy).toHaveBeenCalledWith(url);
      expect(editorStore.updateElementKit).toHaveBeenCalledWith(
        state.screen,
        {
          ...elementCmp.definition,
          data: {
            ...elementCmp.definition.data,
            source: null,
          },
        } as any,
        {
          [elementCmp.definition.id]: { backgroundImage: url },
        },
      );
      expect(snackbarService.toggle).toHaveBeenCalledWith(true, {
        content: 'Image is uploaded successfully',
        duration: 2000,
        iconId: 'icon-commerceos-success',
      });

      /**
       * reject promise
       * editorStore.updateElementKit throws error as { error: null }
       */
      editorStore.updateElementKit.and.returnValue(throwError({ error: null }));
      snackbarService.toggle.calls.reset();
      bg.form.patchValue({ file });

      flushMicrotasks();

      messageChannelMock.port1.onmessage({ data: { error: 'error' } });
      expect(snackbarService.toggle).toHaveBeenCalledWith(true, {
        content: 'Cannot load image',
        duration: 2000,
        iconId: 'icon-commerceos-error',
      });

      /**
       * editorStore.updateElementKit throws error as
       * { error: { message: 'test error' } }
       */
      editorStore.updateElementKit.and.returnValue(throwError({ error: { message: 'test error' } }));
      bg.form.patchValue({ file });

      flushMicrotasks();

      expect(snackbarService.toggle).toHaveBeenCalledWith(true, {
        content: 'test error',
        duration: 2000,
        iconId: 'icon-commerceos-error',
      });

      bg.form.patchValue({ file: null }, { emitEvent: false });
      editorStore.updateElementKit.and.returnValue(of({ updated: 'elementKit' }) as any);
      elementCmp.styles.backgroundImage = null;
      elementCmp.applyStyles.calls.reset();
      updateStylesSpy.calls.reset();
      patchSpy.and.callThrough();
      sub.unsubscribe();
    }

    // handle imageSize changes
    {
      const patchSpy = spyOn(bg.form.get('imageScale'), 'patchValue');

      /**
       * state.selectedGridCells is []
       */
      state.selectedGridCells = [];

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change imageSize
       * value is ImageSize.Contain
       */
      bg.form.patchValue({
        imageSize: {
          name: 'Contain',
          value: ImageSize.Contain,
        },
      });

      expect(updateStylesSpy).toHaveBeenCalledWith(elementCmp, {
        backgroundSize: ImageSize.Contain,
      });
      expect(patchSpy).not.toHaveBeenCalled();
      expect(elementCmp.styles).toEqual({
        ...elementCmp.styles,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      } as any);
      expect(elementCmp.applyStyles).toHaveBeenCalled();
      expect(updateImageScaleFieldSpy).toHaveBeenCalledWith(bg.form);
      expect(nextSpy).toHaveBeenCalled();

      /**
       * state.selectedGridCells is set
       */
      sub.unsubscribe();
      state.selectedGridCells = [{ id: 'c-001' }] as any[];
      elementCmp.applyStyles.calls.reset();
      updateStylesSpy.calls.reset();

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();
      bg.form.patchValue({
        imageSize: {
          name: 'Contain',
          value: ImageSize.Contain,
        },
      });

      expect(selectedElement.styles).toEqual({
        ...selectedElement.styles,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      } as any);
      expect(selectedElement.applyStyles).toHaveBeenCalled();
      expect(patchSpy).not.toHaveBeenCalled();
      expect(elementCmp.applyStyles).not.toHaveBeenCalled();
      expect(updateStylesSpy).toHaveBeenCalledWith(selectedElement, {
        backgroundSize: ImageSize.Contain,
      });
      expect(updateImageScaleFieldSpy).toHaveBeenCalledTimes(2);
      expect(nextSpy).toHaveBeenCalledTimes(2);

      /**
       * value is ImageSize.Initial
       */
      updateStylesSpy.calls.reset();
      bg.form.patchValue({
        imageSize: {
          name: 'Initial',
          value: ImageSize.Initial,
        },
      });

      expect(selectedElement.styles).toEqual({
        ...selectedElement.styles,
        backgroundPosition: null,
        backgroundRepeat: 'repeat',
      } as any);
      expect(selectedElement.applyStyles).toHaveBeenCalled();
      expect(patchSpy).toHaveBeenCalledWith(100);
      expect(elementCmp.applyStyles).not.toHaveBeenCalled();
      expect(updateStylesSpy).not.toHaveBeenCalled();
      expect(updateImageScaleFieldSpy).toHaveBeenCalledTimes(3);
      expect(nextSpy).toHaveBeenCalledTimes(3);

      selectedElement.applyStyles.calls.reset();
      nextSpy.calls.reset();
      patchSpy.and.callThrough();
      sub.unsubscribe();
    }

    // handle fillType changes
    {
      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change fillType
       * name is FillType.None
       */
      bg.form.patchValue({
        fillType: { name: FillType.None },
      });

      expect(bg.form.get('bgColorGradientAngle').value).toEqual('');
      expect(bg.form.get('bgColorGradientStart').value).toEqual('');
      expect(bg.form.get('bgColorGradientStartPercent').value).toEqual('');
      expect(bg.form.get('bgColorGradientStop').value).toEqual('');
      expect(bg.form.get('bgColorGradientStopPercent').value).toEqual('');
      expect(bg.form.get('bgColor').value).toBeNull();
      expect(bg.form.get('bgImage').value).toBeNull();
      expect(bg.form.get('mediaType').value).toEqual(MediaType.Video);
      expect(updateImageScaleFieldSpy).toHaveBeenCalledWith(bg.form);

      /**
       * name is FillType.GradientFill
       */
      bg.form.patchValue({
        fillType: { name: FillType.GradientFill },
      });

      expect(bg.form.get('bgColor').value).toBeNull();
      expect(bg.form.get('bgImage').value).toEqual('linear-gradient(90deg, #ffffff 0%, #ffffff 100%)');
      expect(bg.form.get('mediaType').value).toEqual(MediaType.None);

      /**
       * name is FillType.ImageFill
       * bgImage is null
       */
      bg.form.patchValue({ bgImage: null }, { emitEvent: false });
      bg.form.patchValue({
        fillType: { name: FillType.ImageFill },
      });

      expect(bg.form.get('bgColor').value).toBeNull();
      expect(bg.form.get('bgImage').value).toBeNull();
      expect(bg.form.get('mediaType').value).toEqual(MediaType.Image);

      /**
       * bgImage is gradient
       */
      bg.form.patchValue({
        bgImage: 'linear-gradient(10deg, #333333 10%, #999999 65%)',
      }, { emitEvent: false });
      bg.form.patchValue({
        fillType: { name: FillType.ImageFill },
      });

      expect(bg.form.get('bgColor').value).toBeNull();
      expect(bg.form.get('bgImage').value).toBeUndefined();
      expect(bg.form.get('mediaType').value).toEqual(MediaType.Image);

      /**
       * name is FillType.ColorFill
       */
      bg.form.patchValue({
        fillType: { name: FillType.ColorFill },
      });

      expect(bg.form.get('bgColor').value).toEqual('#ffffff');
      expect(bg.form.get('bgImage').value).toBeNull();
      expect(bg.form.get('mediaType').value).toEqual(MediaType.None);

      updateImageScaleFieldSpy.calls.reset();
      sub.unsubscribe();
    };

    // handle imageScale changes
    {
      /**
       * state.selectedGridCells is []
       */
      state.selectedGridCells = [];

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change imageScale
       */
      updateStylesSpy.calls.reset();
      bg.form.patchValue({
        imageSize: { value: ImageSize.OriginalSize },
      }, { emitEvent: false });
      bg.form.patchValue({ imageScale: 25 });

      tick(300);

      expect(updateStylesSpy).toHaveBeenCalledOnceWith(elementCmp, { backgroundSize: '25%' });
      expect(nextSpy).toHaveBeenCalled();

      updateStylesSpy.calls.reset();
      sub.unsubscribe();

      /**
       * state.selectedGridCells is set
       */
      state.selectedGridCells = [{ id: 'c-001' }] as any[];

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change imageScale
       */
      bg.form.patchValue({ imageScale: 50 });

      tick(300);

      expect(updateStylesSpy).toHaveBeenCalledWith(selectedElement, { backgroundSize: '50%' });
      expect(nextSpy).toHaveBeenCalled();

      updateStylesSpy.calls.reset();
      nextSpy.calls.reset();
      sub.unsubscribe();
    }

    // handle mediaType changes
    {
      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();

      /**
       * change mediaTyoe
       * value is MediaType.Video
       */
      bg.form.patchValue({ mediaType: MediaType.Video });

      expect(elementCmp.styles['mediaType']).toEqual(MediaType.Video);
      expect(nextSpy).toHaveBeenCalled();

      nextSpy.calls.reset();
      sub.unsubscribe();
    }

    // handle submit
    {
      nextSpy.and.callThrough();
      editorStore.updateElementKit.calls.reset();
      editorStore[`page` as any] = {
        id: 'p-001',
        stylesheets: {
          [state.screen]: {
            [elementCmp.definition.id]: { fontSize: 32 },
          },
        },
      };

      bg.form.get('bgColorGradientAngle').setValidators(Validators.required);
      bg.form.patchValue({
        bgColorGradientAngle: null,
      }, { emitEvent: false });

      /**
       * bg.form is INVALID
       */
      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef)
        .pipe(isEmpty())
        .subscribe(empty => expect(empty).toBe(true));
      bg.submit.next();
      sub.unsubscribe();

      /**
       * bg.form.invalid is FALSE
       * state.selectedGridCells is []
       * elementCmp.target.element.data is null
       */
      bg.form.patchValue({ bgColorGradientAngle: 300 }, { emitEvent: false });
      bg.initialValue = bg.form.value;
      state.selectedGridCells = [];
      elementCmp.styles['mediaType'] = MediaType.None;
      elementCmp.target.element.data = null;

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();
      bg.submit.next();

      expect(logger.log).toHaveBeenCalledWith('Background: Submit ', bg.form.value);
      expect(editorStore.updateElementKit).toHaveBeenCalledWith(
        state.screen,
        elementCmp.definition as any,
        { [elementCmp.definition.id]: elementCmp.styles },
      );
      expect(elementCmp.applyStyles).toHaveBeenCalled();

      /**
       * elementCmp.target.element.data.sync is TRUE
       */
      editorStore.updateElement.calls.reset();
      elementCmp.target.element.data = { sync: true };
      bg.submit.next();

      expect(editorStore.updateElementKit).toHaveBeenCalledWith(
        Object.values(PebScreen),
        elementCmp.definition as any,
        { [elementCmp.definition.id]: elementCmp.styles },
      );

      /**
       * state.selectedGridCells is set
       * selectedElement.target.element.data is null
       */
      sub.unsubscribe();
      editorStore.updateElementKit.calls.reset();
      state.selectedGridCells = [{ id: 'c-001' }] as any[];
      selectedElement.target.element.data = null;
      elementCmp.applyStyles.calls.reset();

      sub = plugin[`handleBackgroundForm`](elementCmp as any, sidebarRef).subscribe();
      bg.submit.next();

      expect(editorStore.updateElementKit).toHaveBeenCalledWith(
        state.screen,
        [selectedElement.definition] as any[],
        [{
          [selectedElement.definition.id]: selectedElement.styles,
        }],
      );
      expect(elementCmp.applyStyles).not.toHaveBeenCalled();
      expect(selectedElement.applyStyles).toHaveBeenCalled();

      /**
       * selectedElement.target.element.data.sync is TRUE
       */
      selectedElement.target.element.data = { sync: true };
      bg.submit.next();

      expect(editorStore.updateElementKit).toHaveBeenCalledWith(
        Object.values(PebScreen),
        [selectedElement.definition] as any[],
        [{
          [selectedElement.definition.id]: selectedElement.styles,
        }],
      );

      editorStore.updateElementKit.calls.reset();
      elementCmp.applyStyles.calls.reset();
      selectedElement.applyStyles.calls.reset();
      sub.unsubscribe();
    }

  }));

  it('should init border form', () => {

    const elementCmp: any = {
      styles: {
        borderWidth: 2,
        borderStyle: 'dotted',
        borderColor: '#cccccc',
      },
    };

    // w/ values
    plugin[`initBorderForm`](elementCmp);

    expect(elementCmp.border).toBeTruthy();
    expect(elementCmp.border.initialValue).toEqual({
      borderWidth: 2,
      borderStyle: 'dotted',
      borderColor: '#cccccc',
      hasBorder: true,
    });
    expect(elementCmp.border.form.value).toEqual({
      borderWidth: 2,
      borderStyle: 'dotted',
      borderColor: '#cccccc',
      hasBorder: true,
    });

    // w/o values
    elementCmp.styles = {};

    plugin[`initBorderForm`](elementCmp);

    expect(elementCmp.border.initialValue).toEqual({
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: '#000',
      hasBorder: false,
    });
    expect(elementCmp.border.form.value).toEqual({
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: '#000',
      hasBorder: false,
    });

  });

  it('should handle border form', () => {

    const elementCmp: any = {
      definition: {
        id: 'elem',
        data: {},
      },
      styles: {
        borderWidth: 2,
        borderStyle: 'dotted',
        borderColor: '#cccccc',
      },
      target: {
        styles: {
          color: '#333333',
        },
      },
      applyStyles: jasmine.createSpy('applyStyles'),
    };

    editorStore.updateStyles.and.returnValue(of(null));

    plugin[`initBorderForm`](elementCmp);
    plugin[`handleBorderForm`](elementCmp).subscribe();

    /**
     * element.border.form is INVALID
     */
    elementCmp.border.form.patchValue({ borderWidth: 113 });
    elementCmp.border.submit.next();

    expect(logger.log).toHaveBeenCalledOnceWith('Border: Change: Invalid');
    expect(elementCmp.applyStyles).not.toHaveBeenCalled();
    expect(editorStore.updateStyles).not.toHaveBeenCalled();

    /**
     * element.border.form is VALID
     * hasBorder is TRUE
     * borderWidth is 0
     */
    elementCmp.border.form.patchValue({
      hasBorder: true,
      borderWidth: 0,
    });
    elementCmp.border.submit.next();

    expect(elementCmp.border.form.value.borderWidth).toBe(1);
    expect(elementCmp.styles).toEqual({
      borderWidth: 1,
      borderStyle: 'dotted',
      borderColor: '#cccccc',
    });
    expect(elementCmp.applyStyles).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith('Border: Submit ', elementCmp.border.form.value);
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      elem: {
        ...elementCmp.target.styles,
        borderWidth: 1,
        borderStyle: 'dotted',
        borderColor: '#cccccc',
      },
    });

    /**
     * element.border.form is VALID
     * hasBorder is TRUE
     * borderWidth is set
     */
    elementCmp.border.form.patchValue({ borderWidth: 13 });
    elementCmp.border.submit.next();

    expect(elementCmp.border.form.value.borderWidth).toBe(13);
    expect(elementCmp.styles).toEqual({
      borderWidth: 13,
      borderStyle: 'dotted',
      borderColor: '#cccccc',
    });
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      elem: {
        ...elementCmp.target.styles,
        borderWidth: 13,
        borderStyle: 'dotted',
        borderColor: '#cccccc',
      },
    });

    /**
     * hasBorder is FALSE
     */
    elementCmp.border.form.patchValue({
      hasBorder: false,
    });
    elementCmp.border.submit.next();

    expect(elementCmp.border.form.value.borderWidth).toBe(0);
    expect(elementCmp.styles).toEqual({
      borderWidth: null,
      borderStyle: null,
      borderColor: null,
    });
    expect(editorStore.updateStyles).toHaveBeenCalledWith(state.screen, {
      elem: {
        ...elementCmp.target.styles,
        borderWidth: 0,
        borderStyle: 'dotted',
        borderColor: '#cccccc',
      },
    });

  });

  it('should update video field settings', () => {

    const form = new FormGroup({
      videoObjectFit: new FormControl(),
      videoScale: new FormControl(),
    });

    /**
     * form.value.videoObjectFit is null
     */
    plugin[`updateVideoFieldSetting`](form).subscribe();

    expect(form.get('videoScale').value).toBeNull();
    expect(form.get('videoScale').enabled).toBe(true);

    /**
     * form.value.videoObjectFit.value is VideoSize.Stretch
     */
    form.patchValue({
      videoObjectFit: {
        value: VideoSize.Stretch,
      },
    });

    expect(form.get('videoScale').value).toBe(100);
    expect(form.get('videoScale').enabled).toBe(false);

    /**
     * form.value.videoObjectFit.value is VideoSize.Tile
     */
    form.patchValue({
      videoObjectFit: {
        value: VideoSize.Tile,
      },
    });

    expect(form.get('videoScale').enabled).toBe(true);

  });

  it('should get filter values from string', () => {

    const filterString = 'brightness(113%) saturate(-10%)';

    expect(plugin[`getFilterValuesFromString`]('test')).toEqual({});
    expect(plugin[`getFilterValuesFromString`](filterString)).toEqual({
      brightness: 13,
      saturate: -110,
    });

  });

  it('should get filter string', () => {

    const filterValues = {
      brightness: 13,
      saturate: -110,
    };

    // w/o values
    expect(plugin[`getFilterString`]({})).toEqual('inherit');

    // w/ both values
    expect(plugin[`getFilterString`](filterValues)).toEqual('brightness(113%) saturate(-10%)');

    // w/o brightness
    expect(plugin[`getFilterString`]({ saturate: filterValues.saturate })).toEqual('saturate(-10%)');

    // w/o saturate
    expect(plugin[`getFilterString`]({ brightness: filterValues.brightness })).toEqual('brightness(113%)');

  });

  it('should get next alignment position', () => {

    const parent = {
      getContentContainerRect: jasmine.createSpy('getContentContainerRect').and.returnValue({
        width: 1200,
        height: 900,
        top: 0,
        left: 360,
        right: 360,
        bottom: 0,
      }),
    };
    const children = {
      getAbsoluteElementRect: jasmine.createSpy('getAbsoluteElementRect').and.returnValue({
        width: 500,
        height: 350,
        top: 20,
        left: 20,
        right: 680,
        bottom: 550,
      }),
    };
    let result: {
      nextPosition: { x: number, y: number },
      translate: { x: number, y: number },
    };

    state.scale = 2;

    // ### LEFT ###
    result = plugin[`getNextAlignmentPosition`](parent as any, children as any, AlignType.Left);

    expect(result).toEqual({
      nextPosition: { x: 360, y: 20 },
      translate: { x: 680, y: 0 },
    });

    // ### CENTER ###
    result = plugin[`getNextAlignmentPosition`](parent as any, children as any, AlignType.Center);

    expect(result).toEqual({
      nextPosition: { x: 710, y: 20 },
      translate: { x: 1380, y: 0 },
    });

    // ### RIGHT ###
    result = plugin[`getNextAlignmentPosition`](parent as any, children as any, AlignType.Right);

    expect(result).toEqual({
      nextPosition: { x: 1060, y: 20 },
      translate: { x: 2080, y: 0 },
    });

    // ### TOP ###
    result = plugin[`getNextAlignmentPosition`](parent as any, children as any, AlignType.Top);

    expect(result).toEqual({
      nextPosition: { x: 20, y: 0 },
      translate: { x: 0, y: -40 },
    });

    // ### MIDDLE ###
    result = plugin[`getNextAlignmentPosition`](parent as any, children as any, AlignType.Middle);

    expect(result).toEqual({
      nextPosition: { x: 20, y: 275 },
      translate: { x: 0, y: 510 },
    });

    // ### BOTTOM ###
    result = plugin[`getNextAlignmentPosition`](parent as any, children as any, AlignType.Bottom);

    expect(result).toEqual({
      nextPosition: { x: 20, y: 550 },
      translate: { x: 0, y: 1060 },
    });

    // ### LEFT ###
    // (initialCoords.left + (parentRect.left / scale)) < 1
    parent.getContentContainerRect.and.returnValue({
      left: 1,
    });
    children.getAbsoluteElementRect.and.returnValue({
      top: 0,
      left: 0,
    });

    result = plugin[`getNextAlignmentPosition`](parent as any, children as any, AlignType.Left);

    expect(result).toEqual({
      nextPosition: { x: 1, y: 0 },
      translate: { x: 2, y: 0 },
    });

  });

  it('should get shadow string', () => {

    const shadowValues = {
      hasShadow: true,
      shadowBlur: 5,
      shadowOffset: 20,
      shadowColor: '#333333',
      shadowOpacity: 50,
      shadowAngle: 0,
    };

    expect(plugin[`shadowToString`]({ hasShadow: false } as any)).toBeNull();
    expect(plugin[`shadowToString`](shadowValues)).toEqual('drop-shadow(20pt 0pt 5px rgba(51,51,51,0.5))');

  });

  it('should get background gradient', () => {

    const start = '#ffffff';
    const end = '#000000';
    const form = new FormGroup({
      bgColorGradientAngle: new FormControl(),
      bgColorGradientStart: new FormControl(),
      bgColorGradientStartPercent: new FormControl(),
      bgColorGradientStop: new FormControl(),
      bgColorGradientStopPercent: new FormControl(),
    });

    /**
     * all arguments except form are null
     * all values of form are null
     */
    expect(plugin[`getBackgroundGradient`](null, null, null, null, null, form))
      .toEqual('linear-gradient(90deg, #ffffff 0%, #ffffff 100%)');

    /**
     * all values of form are set
     */
    form.setValue({
      bgColorGradientAngle: 10,
      bgColorGradientStart: '#000000',
      bgColorGradientStartPercent: 20,
      bgColorGradientStop: '#e63946',
      bgColorGradientStopPercent: 90,
    });

    expect(plugin[`getBackgroundGradient`](null, null, null, null, null, form))
      .toEqual('linear-gradient(10deg, #000000 20%, #e63946 90%)');

    /**
     * all arguments are set
     */
    expect(plugin[`getBackgroundGradient`](120, '#a8dadc', 10, '#1d3557', 80, form))
      .toEqual('linear-gradient(120deg, #a8dadc 10%, #1d3557 80%)')

  });

  it('should update gradient background', () => {

    const formMock = new FormGroup({
      bgColor: new FormControl('#222222'),
      bgImage: new FormControl('test.jpg'),
      mediaType: new FormControl(MediaType.Image),
    });
    const gradient = 'linear-gradient(130deg, #ffffff 0%, #cccccc 65%)';

    /**
     * argument gradient is not gradient
     */
    plugin[`updateGradientBackground`]('test', formMock);

    expect(formMock.value).toEqual({
      bgColor: '',
      bgImage: 'test',
      mediaType: MediaType.Image,
    });

    /**
     * argument gradient is a gradient
     */
    plugin[`updateGradientBackground`](gradient, formMock);

    expect(formMock.value).toEqual({
      bgColor: '',
      bgImage: gradient,
      mediaType: MediaType.None,
    });

  });

  it('should update image scale field setting', () => {

    const form = new FormGroup({
      imageSize: new FormControl({
        value: ImageSize.OriginalSize,
      }),
      fillType: new FormControl({
        name: FillType.ImageFill,
      }),
      bgImage: new FormControl(),
      imageScale: new FormControl(),
      mediaType: new FormControl(MediaType.Image),
    });

    // w/o bgImage
    plugin[`updateImageScaleFieldSetting`](form);

    expect(form.controls.imageScale.disabled).toBe(true);

    // w/ bgImage
    form.patchValue({ bgImage: 'test.jpg' }, { emitEvent: false });

    plugin[`updateImageScaleFieldSetting`](form);

    expect(form.controls.imageScale.enabled).toBe(true);

  });

  it('should update styles', () => {

    const element = {
      styles: {
        display: 'flex',
      },
      applyStyles: jasmine.createSpy('applyStyles'),
    };
    const styles = {
      backgroundColor: null,
      backgroundImage: null,
      height: null,
      width: 500,
    };

    /**
     * backgroundColor, backgroundImage & height are null
     */
    plugin[`updateStyles`](element, styles);

    expect(element.styles).toEqual({
      display: 'flex',
      backgroundColor: null,
      backgroundImage: null,
      width: 500,
      height: null,
    } as any);
    expect(element.applyStyles).toHaveBeenCalled();

    /**
     * backgroundColor, backgroundImage & height are set
     */
    styles.backgroundColor = '#222222';
    styles.backgroundImage = 'test.jpg';
    styles.height = 300;

    plugin[`updateStyles`](element, styles);

    expect(element.styles).toEqual({
      display: 'flex',
      backgroundColor: '#222222',
      backgroundImage: 'test.jpg',
      width: 500,
      height: 300,
    } as any);

  });

});
