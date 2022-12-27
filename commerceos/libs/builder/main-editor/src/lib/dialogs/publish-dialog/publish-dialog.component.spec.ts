import { HttpEventType } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, EMPTY, of, Subject, throwError } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import {
  PebEditorState,
  PebElementType,
  PebEnvService,
  PebLanguage,
  PebPageType,
  PebPageVariant,
  PebScreen,
  PebShopContainer,
} from '@pe/builder-core';
import { PagePreviewService, PebEditorAccessorService, PebEditorStore } from '@pe/builder-shared';
import { AppType, APP_TYPE, MessageBus } from '@pe/common';

import { PebEditorPublishDialogComponent, PEB_EDITOR_PUBLISH_DIALOG } from './publish-dialog.component';

describe('PebEditorPublishDialogComponent', () => {

  let fixture: ComponentFixture<PebEditorPublishDialogComponent>;
  let component: PebEditorPublishDialogComponent;
  let editorApi: jasmine.SpyObj<PebEditorApi>;
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let pagePreviewService: jasmine.SpyObj<PagePreviewService>;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let renderer: jasmine.SpyObj<PebEditorRenderer>;
  let bgActivityService: jasmine.SpyObj<BackgroundActivityService>;
  let editorComponent: { commands$: { next: jasmine.Spy } };
  let dialogRef: any;
  let lastActionIdSubject: BehaviorSubject<string>;
  let envService: PebEnvService;
  let selectedElements$: Subject<any[]>;

  class PublishDialogMock { };

  beforeEach(waitForAsync(() => {

    selectedElements$ = new Subject();
    spyOnProperty(PebEditorPublishDialogComponent.prototype, 'selectedElements$').and.returnValue(selectedElements$);

    dialogRef = {
      close: jasmine.createSpy('close'),
      backdropClick: jasmine.createSpy('backdropClick').and.returnValue(of(null)),
      beforeClosed: jasmine.createSpy('beforeClosed').and.returnValue(of(true)),
      componentInstance: {
        destroy$: new Subject(),
      },
    };
    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', {
      open: dialogRef,
    });

    const dialogDataMock = { appId: 'app-001' };

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', [
      'getApp',
      'getShopThemeById',
      'getShopThemeActiveVersion',
      'getCurrentShopPreview',
      'updateThemeVersion',
      'uploadImageWithProgress',
    ]);
    editorApiSpy.getApp.and.returnValue(EMPTY);
    editorApiSpy.getShopThemeById.and.returnValue(EMPTY);
    editorApiSpy.getShopThemeActiveVersion.and.returnValue(EMPTY);

    editorComponent = {
      commands$: {
        next: jasmine.createSpy('next'),
      },
    };

    lastActionIdSubject = new BehaviorSubject('a-001');
    const editorStoreSpy = jasmine.createSpyObj<PebEditorStore>('PebEditorStore', [
      'getPage',
      'updatePagePreview',
      'updateThemeName',
      'updateThemePreview',
    ], {
      theme: { id: 'theme-001' } as any,
      snapshot: {
        pages: [],
      } as any,
      activePageId: 'p-013',
      pages: {},
      lastActionId$: lastActionIdSubject,
      lastPublishedActionId$: of('a-001'),
    });

    const pagePreviewServiceSpy = jasmine.createSpyObj<PagePreviewService>('PagePreviewService', ['renderPreview']);

    const stateMock = {
      language: PebLanguage.English,
    };

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', ['getElementComponent']);

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    const backgroundActivityServiceMock = {
      hasActiveTasks$: of(false),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorPublishDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogDataMock },
        { provide: PebEditorApi, useValue: editorApiSpy },
        { provide: PebEnvService, useValue: { businessData: null } },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorStore, useValue: editorStoreSpy },
        { provide: PagePreviewService, useValue: pagePreviewServiceSpy },
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorRenderer, useValue: rendererSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: APP_TYPE, useValue: AppType.Pos },
        { provide: PEB_EDITOR_PUBLISH_DIALOG, useValue: PublishDialogMock },
        { provide: BackgroundActivityService, useValue: backgroundActivityServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorPublishDialogComponent);
      component = fixture.componentInstance;

      editorApi = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;
      envService = TestBed.inject(PebEnvService);
      editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
      pagePreviewService = TestBed.inject(PagePreviewService) as jasmine.SpyObj<PagePreviewService>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
      renderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;
      bgActivityService = TestBed.inject(BackgroundActivityService) as jasmine.SpyObj<BackgroundActivityService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theming on construct', () => {

    /**
     * component.envService.businessData is null
     */
    fixture = TestBed.createComponent(PebEditorPublishDialogComponent);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.default);

    /**
     * component.envService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null } as any;

    fixture = TestBed.createComponent(PebEditorPublishDialogComponent);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.default);

    /**
     * component.envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: AppThemeEnum.light };

    fixture = TestBed.createComponent(PebEditorPublishDialogComponent);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.light);

  });

  it('should get active theme version from behavior subject', () => {

    const version: any = { id: 'tv-001' };

    component.activeThemeVersion$.next(version);
    expect(component.activeThemeVersion).toEqual(version);

  });

  it('should get theme from behavior subject', () => {

    const theme: any = { id: 't-001' };

    component.theme$.next(theme);
    expect(component.theme).toEqual(theme);

  });

  it('should get reviewable', () => {

    const version: any = {
      id: 'tv-001',
      published: true,
    };

    /**
     * component.activeThemeVersion$.value is null as default
     */
    component.reviewable$.subscribe(res => expect(res).toBe(false)).unsubscribe();
    expect(component.reviewable).toBeUndefined();

    /**
     * component.activeThemeVersion$.value is set
     */
    component.activeThemeVersion$.next(version);
    component.reviewable$.subscribe(res => expect(res).toBe(true)).unsubscribe();
    expect(component.reviewable).toBe(true);

  });

  it('should set/get tags', () => {

    const tags = ['test', 'test2'];
    const nextSpy = spyOn(component.tags$, 'next').and.callThrough();

    component.tags = tags;

    expect(nextSpy).toHaveBeenCalledWith(tags);
    expect(component.tags).toEqual(tags);

  });

  it('should set active text editors on construct', fakeAsync(() => {

    const elements = {
      'elem-001': {
        id: 'elem-001',
        type: PebElementType.Shape,
        target: {
          editorEnabled$: of(true),
          deactivate: jasmine.createSpy('deactivate'),
        },
      },
      'elem-002': {
        id: 'elem-002',
        type: PebElementType.Text,
        target: {
          editorEnabled$: of(false),
          deactivate: jasmine.createSpy('deactivate'),
        },
      },
    };

    renderer.getElementComponent.and.callFake((id: string) => elements[id] ?? null);

    /**
     * one of the elements has editor disabled
     */
    component.activeTextEditors$.subscribe();
    selectedElements$.next(Object.values(elements));

    Object.values(elements).forEach(elem => expect(elem.target.deactivate).not.toHaveBeenCalled());
    expect(renderer.getElementComponent.calls.allArgs()).toEqual(Object.values(elements).map(elem => [elem.id]));

    /**
     * all elements has editor enabled
     */
    elements['elem-002'].target.editorEnabled$ = of(true);
    selectedElements$.next(Object.values(elements));

    flush();

    Object.values(elements).forEach(elem => expect(elem.target.deactivate).toHaveBeenCalled());

  }));

  it('should check can publish', () => {

    /**
     * editorStore.lastActionId$ is equal to editorStore.lastPublishedActionId$
     */
    component.canPublish$
      .subscribe(can => expect(can).toBe(false)).unsubscribe();
    expect(component.hasActiveTask$).toEqual(bgActivityService.hasActiveTasks$);

    /**
     * editorStore.lastActionId$ is NOT equal to editorStore.lastPublishedActionId$
     */
    lastActionIdSubject.next('a-013');
    component.canPublish$
      .subscribe(can => expect(can).toBe(true)).unsubscribe();

  });

  it('should handle ng init', () => {

    const appNextSpy = spyOn(component.app$, 'next');
    const pictureNextSpy = spyOn(component.pictureLoading$, 'next');
    const themeNextSpy = spyOn(component.theme$, 'next');
    const versionNextSpy = spyOn(component.activeThemeVersion$, 'next');
    const srcNextSpy = spyOn(component.pictureSrc$, 'next');
    const errorSpy = spyOn(console, 'error');
    const pagesSpy = Object.getOwnPropertyDescriptor(editorStore, 'pages').get as jasmine.Spy;
    const appMock = { id: 'app-001' };
    const versionMock = {
      id: 'tv-001',
      tags: ['test', 'test2'],
    };
    const themeMock = {
      id: 'theme-001',
      picture: 'pic.jpg',
    };
    const pageMock = {
      id: 'p-013',
      data: null,
      template: { id: 'tpl-001' },
      stylesheets: {
        [PebScreen.Desktop]: {
          'elem-001': { color: '#333333' },
        },
      },
    }

    /**
     * editorApi.getShopThemeById throws error
     * editorApi.getShopThemeActiveVersion returns null
     */
    editorApi.getApp.and.returnValue(of(appMock));
    editorApi.getShopThemeById.and.returnValue(throwError('test error'));
    editorApi.getShopThemeActiveVersion.and.returnValue(of(null));

    component.ngOnInit();

    expect(editorApi.getApp).toHaveBeenCalledWith('app-001');
    expect(appNextSpy).toHaveBeenCalledWith(appMock);
    expect(pictureNextSpy.calls.allArgs()).toEqual([[true], [false]]);
    expect(editorApi.getShopThemeById).toHaveBeenCalledWith(editorStore.theme.id);
    expect(themeNextSpy).not.toHaveBeenCalled();
    expect(editorApi.getShopThemeActiveVersion).toHaveBeenCalledWith(editorStore.theme.id);
    expect(versionNextSpy).toHaveBeenCalledWith(null);
    expect(component.tags).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith('test error');
    expect(srcNextSpy).toHaveBeenCalledWith(null);

    /**
     * editorApi.getShopThemeById returns mocked data
     * editorApi.getShopThemeActiveVersion returns mocked data
     * theme.picture is set
     */
    editorApi.getShopThemeById.and.returnValue(of(themeMock) as any);
    editorApi.getShopThemeActiveVersion.and.returnValue(of(versionMock) as any);
    versionNextSpy.calls.reset();
    errorSpy.calls.reset();
    srcNextSpy.calls.reset();

    component.ngOnInit();

    expect(versionNextSpy).toHaveBeenCalledWith(versionMock as any);
    expect(component.tags).toEqual(versionMock.tags);
    expect(editorStore.getPage).not.toHaveBeenCalled();
    expect(pagePreviewService.renderPreview).not.toHaveBeenCalled();
    expect(editorStore.updatePagePreview).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(srcNextSpy).toHaveBeenCalledWith(themeMock.picture);

    /**
     * theme.picture is null
     * editorStore.snapshot.pages is []
     * editorStore.pages is {}
     * pagePreviewService.renderPreview throws error
     * page.data is null
     */
    themeMock.picture = null;
    editorStore.getPage.and.returnValue(of(pageMock) as any);
    pagePreviewService.renderPreview.and.returnValue(throwError('render preview error') as any);
    errorSpy.calls.reset();
    srcNextSpy.calls.reset();

    component.ngOnInit();

    expect(editorStore.getPage).toHaveBeenCalledWith(editorStore.activePageId);
    expect(pagePreviewService.renderPreview).toHaveBeenCalledWith({
      element: pageMock.template,
      stylesheet: pageMock.stylesheets[PebScreen.Desktop],
      context: {},
      screen: PebScreen.Desktop,
      locale: PebLanguage.English,
      scale: 1,
    } as any);
    expect(editorStore.updatePagePreview).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('render preview error');
    expect(srcNextSpy).toHaveBeenCalledWith(null);

    /**
     * page.data.preview is null
     */
    pageMock.data = { preview: null };
    errorSpy.calls.reset();
    srcNextSpy.calls.reset();

    component.ngOnInit();

    expect(editorStore.updatePagePreview).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('render preview error');
    expect(srcNextSpy).toHaveBeenCalledWith(null);

    /**
     * page.data.preview is set
     */
    pageMock.data.preview = {
      [PebScreen.Desktop]: 'preview-desktop.jpg',
    };
    errorSpy.calls.reset();
    srcNextSpy.calls.reset();

    component.ngOnInit();

    expect(editorStore.updatePagePreview).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('render preview error');
    expect(srcNextSpy).toHaveBeenCalledWith(pageMock.data.preview[PebScreen.Desktop]);

    /**
     * editorStore.snapshot.pages is set
     * editorStore.pages is set
     * editorStore.updatePagePreview throws error
     * pagePreviewService.renderPreview returns mocked data
     */
    editorStore.updatePagePreview.and.returnValue(throwError('test error'));
    pagePreviewService.renderPreview.calls.reset();
    pagePreviewService.renderPreview.and.returnValue(of({ blobName: 'blob' }) as any);
    editorStore.snapshot.pages = [{
      id: 'p-001',
      variant: PebPageVariant.Front,
    }] as any[];
    pageMock.id = 'p-001';
    pagesSpy.and.returnValue({
      'p-001': pageMock,
    });
    errorSpy.calls.reset();
    srcNextSpy.calls.reset();

    component.ngOnInit();

    expect(pagePreviewService.renderPreview).toHaveBeenCalledWith({
      element: pageMock.template,
      stylesheet: pageMock.stylesheets[PebScreen.Desktop],
      context: {},
      screen: PebScreen.Desktop,
      locale: PebLanguage.English,
      scale: 1,
    } as any);
    expect(editorStore.updatePagePreview).toHaveBeenCalledWith({
      [pageMock.id]: {
        [PebScreen.Desktop]: 'blob',
      },
    });
    expect(errorSpy).toHaveBeenCalledWith('test error');
    expect(srcNextSpy).toHaveBeenCalledWith(pageMock.data.preview[PebScreen.Desktop]);

    /**
     * editorStore.updatePagePreview returns mocked data
     */
    editorStore.updatePagePreview.and.returnValue(of(null));
    errorSpy.calls.reset();
    srcNextSpy.calls.reset();

    component.ngOnInit();

    expect(errorSpy).not.toHaveBeenCalled();
    expect(srcNextSpy).toHaveBeenCalledWith('blob');

  });

  it('should handle close click', () => {

    component.onCloseClick();

    expect(dialogRef.close).toHaveBeenCalled();

  });

  it('should handle img load', () => {

    const nextSpy = spyOn(component.pictureLoading$, 'next');

    component.onImgLoad();

    expect(nextSpy).toHaveBeenCalledWith(false);

  });

  it('should update theme name', () => {

    const nextSpy = spyOn(component.theme$, 'next').and.callThrough();
    const themeMock = {
      id: 't-001',
      name: 'Theme 1',
    };

    editorStore.updateThemeName.and.returnValue(of(null));
    component.theme$.next(themeMock as any);
    nextSpy.calls.reset();

    component.updateThemeName('test');

    expect(editorStore.updateThemeName).toHaveBeenCalledWith('test');
    expect(nextSpy).toHaveBeenCalledWith({
      ...themeMock,
      name: 'test',
    } as any);

  });

  it('should handle publish', () => {

    const publishingNextSpy = spyOn(component.publishing$, 'next');
    const execSpy = spyOn<any>(component, 'execCommand');
    const reviewableSpy = spyOnProperty(component, 'reviewable');
    const errorSpy = spyOn(console, 'error');
    const currentMock = {
      id: 'curr-001',
      pages: [
        {
          id: 'p-001',
          type: PebPageType.Master,
          updatedAt: new Date().toString(),
        },
        {
          id: 'p-002',
          type: PebPageType.Replica,
          updatedAt: new Date().toString(),
        },
        {
          id: 'p-003',
          type: PebPageType.Replica,
          updatedAt: new Date().toString(),
        },
        {
          id: 'p-004',
          type: PebPageType.Replica,
          updatedAt: new Date(2020, 3, 10).toString(),
        },
      ],
    };
    const publishedMock = {
      id: 'pub-001',
      pages: [
        {
          id: 'p-002',
          type: PebPageType.Replica,
          updatedAt: new Date().toString(),
        },
        {
          id: 'p-004',
          type: PebPageType.Replica,
          updatedAt: new Date().toString(),
        },
        {
          id: 'p-005',
          type: PebPageType.Replica,
          updatedAt: new Date().toString(),
        },
      ],
    };

    /**
     * component.reviewable is FALSE
     */
    reviewableSpy.and.returnValue(false);

    component.onPublish();

    expect(publishingNextSpy).toHaveBeenCalledOnceWith(true);
    expect(editorApi.getCurrentShopPreview).not.toHaveBeenCalled();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(dialogRef.backdropClick).not.toHaveBeenCalled();
    expect(dialogRef.beforeClosed).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(execSpy).toHaveBeenCalledWith({ type: 'publish' });

    /**
     * component.reviewable is TRUE
     * editorApi.getCurrentShopPreview throws error
     */
    reviewableSpy.and.returnValue(true);
    editorApi.getCurrentShopPreview.and.returnValue(throwError('test error'));
    execSpy.calls.reset();
    dialogRef.close.calls.reset();

    component.onPublish();

    expect(editorApi.getCurrentShopPreview).toHaveBeenCalledWith('app-001', true);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(dialogRef.backdropClick).not.toHaveBeenCalled();
    expect(dialogRef.beforeClosed).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('test error');
    expect(execSpy).not.toHaveBeenCalled();

    /**
     * editorApi.getCurrentShopPreview returns mocked data
     */
    editorApi.getCurrentShopPreview.and.returnValue(of({
      current: currentMock,
      published: publishedMock,
    }) as any);
    dialogRef.close.calls.reset();

    component.onPublish();

    expect(dialog.open).toHaveBeenCalledWith(PublishDialogMock, {
      height: '82.3vh',
      maxHeight: '82.3vh',
      maxWidth: '78.77vw',
      width: '78.77vw',
      panelClass: ['review-publish-dialog', AppThemeEnum.default],
      data: {
        published: publishedMock,
        totalPages: [
          {
            id: 'p-003',
            type: PebPageType.Replica,
            updatedAt: new Date().toString(),
          },
          {
            id: 'p-004',
            type: PebPageType.Replica,
            updatedAt: new Date(2020, 3, 10).toString(),
          },
          {
            id: 'p-005',
            type: PebPageType.Replica,
            updatedAt: new Date().toString(),
          },
        ],
        current: {
          snapshot: currentMock,
          pages: currentMock.pages,
        },
      },
    });
    expect(dialogRef.backdropClick).toHaveBeenCalled();
    expect(dialogRef.beforeClosed).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
    expect(execSpy).toHaveBeenCalledWith({ type: 'publish' });

  });

  it('should handle view url', () => {

    const appMock = { id: 'app-001' };

    component.app$.next(appMock);
    component.onViewUrl();

    expect(messageBus.emit).toHaveBeenCalledWith(`${AppType.Pos}.open`, appMock);

  });

  it('should add tag', () => {

    const tags = ['test', 'test1'];
    const inputEventMock = {
      input: null,
      value: null,
    };
    const themeMock = { id: 't-001' };
    const versionMock = { id: 'tv-001' };

    editorApi.updateThemeVersion.and.returnValue(of(null));

    /**
     * inputEvent.input & value are null
     * component.activeThemeVersion is null
     */
    component.tags = tags;
    component.theme$.next(themeMock as any);
    component.addTag(inputEventMock);

    expect(component.tags).toEqual(tags);
    expect(editorApi.updateThemeVersion).toHaveBeenCalledWith(themeMock.id, undefined, { tags });

    /**
     * inputEvent.input & value are both set
     * component.activeThemeVersion is set
     */
    inputEventMock.input = { value: 'test2' };
    inputEventMock.value = 'test2';

    component.activeThemeVersion$.next(versionMock as any);
    component.addTag(inputEventMock);

    expect(component.tags).toEqual([...tags, 'test2']);
    expect(editorApi.updateThemeVersion)
      .toHaveBeenCalledWith(themeMock.id, versionMock.id, { tags: [...tags, 'test2'] });
    expect(inputEventMock.input.value).toEqual('');

  });

  it('should remove tag', () => {

    const tags = ['test', 'test1', 'test2'];
    const themeMock = { id: 't-001' };
    const versionMock = { id: 'tv-001' };

    editorApi.updateThemeVersion.and.returnValue(of(null));

    /**
     * argument index is -1
     */
    component.tags = tags;
    component.theme$.next(themeMock as any);
    component.removeTag(-1);

    expect(component.tags).toEqual(tags);
    expect(editorApi.updateThemeVersion).not.toHaveBeenCalled();

    /**
     * argument index is set
     * component.activeThemeVersion is null
     */
    component.removeTag(1);

    expect(tags).toEqual(['test', 'test2']);
    expect(component.tags).toEqual(tags);
    expect(editorApi.updateThemeVersion).toHaveBeenCalledWith(themeMock.id, undefined, { tags });

    /**
     * component.activeThemeVersion is set
     */
    component.activeThemeVersion$.next(versionMock as any);
    component.removeTag(0);

    expect(tags).toEqual(['test2']);
    expect(component.tags).toEqual(tags);
    expect(editorApi.updateThemeVersion).toHaveBeenCalledWith(themeMock.id, versionMock.id, { tags });

  });

  it('should handle image upload', () => {

    const pictureNextSpy = spyOn(component.pictureLoading$, 'next');
    const progressNextSpy = spyOn(component.uploadProgress$, 'next');
    const srcNextSpy = spyOn(component.pictureSrc$, 'next');
    const eventMock = {
      target: {
        files: [],
      },
    };
    const file = new File(['test.jpg'], 'test.jpg', { type: 'image/jpg' });
    const fileReaderMock = {
      readAsDataURL: jasmine.createSpy('readAsDataUrl'),
      onload: null as Function,
    };
    const themeMock = {
      id: 't-001',
      picture: null,
    };
    const eventSubject = new Subject();

    component.fileInput = { nativeElement: { value: null } } as any;
    component.theme$.next(themeMock as any);
    const themeNextSpy = spyOn(component.theme$, 'next');

    spyOn(window, 'FileReader').and.returnValue(fileReaderMock as any);
    editorApi.uploadImageWithProgress.and.returnValue(eventSubject);
    editorStore.updateThemePreview.and.returnValue(of(null));

    /**
     * event.target.files is []
     */
    component.onImageUpload(eventMock);

    expect(pictureNextSpy).not.toHaveBeenCalled();
    expect(editorApi.uploadImageWithProgress).not.toHaveBeenCalled();
    expect(progressNextSpy).not.toHaveBeenCalled();
    expect(editorStore.updateThemePreview).not.toHaveBeenCalled();
    expect(themeNextSpy).not.toHaveBeenCalled();
    expect(srcNextSpy).not.toHaveBeenCalled();

    /**
     * event.target.files is set
     */
    eventMock.target.files.push(file);

    component.onImageUpload(eventMock);
    fileReaderMock.onload();

    expect(fileReaderMock.readAsDataURL).toHaveBeenCalledWith(file);

    /**
     * run fileReader.onload
     * event.type is HttpEventType.Sent
     */
    eventSubject.next({ type: HttpEventType.Sent });

    expect(pictureNextSpy).toHaveBeenCalledOnceWith(true);
    expect(editorApi.uploadImageWithProgress).toHaveBeenCalledWith(PebShopContainer.Images, file);
    expect(progressNextSpy).not.toHaveBeenCalled();
    expect(editorStore.updateThemePreview).not.toHaveBeenCalled();
    expect(themeNextSpy).not.toHaveBeenCalled();
    expect(srcNextSpy).not.toHaveBeenCalled();

    /**
     * event.type is HttpEventType.UploadProgress
     */
    eventSubject.next({
      type: HttpEventType.UploadProgress,
      loaded: 35,
    });

    expect(pictureNextSpy).not.toHaveBeenCalledWith(false);
    expect(progressNextSpy).toHaveBeenCalledWith(35);
    expect(editorStore.updateThemePreview).not.toHaveBeenCalled();
    expect(themeNextSpy).not.toHaveBeenCalled();
    expect(srcNextSpy).not.toHaveBeenCalled();

    /**
     * event.type is HttpEventType.Response
     * event.body is null
     */
    eventSubject.next({
      type: HttpEventType.Response,
      body: null,
    });

    expect(pictureNextSpy).not.toHaveBeenCalledWith(false);
    expect(progressNextSpy).toHaveBeenCalledWith(100);
    expect(editorStore.updateThemePreview).not.toHaveBeenCalled();
    expect(themeNextSpy).not.toHaveBeenCalled();
    expect(srcNextSpy).not.toHaveBeenCalled();

    /**
     * event.body is set
     */
    eventSubject.next({
      type: HttpEventType.Response,
      body: {
        blobName: 'blob',
      },
    });
    eventSubject.complete();

    expect(pictureNextSpy).toHaveBeenCalledWith(false);
    expect(editorStore.updateThemePreview).toHaveBeenCalledWith('blob');
    expect(themeNextSpy).toHaveBeenCalledWith({
      ...themeMock,
      picture: 'blob',
    } as any);
    expect(srcNextSpy).toHaveBeenCalledWith('blob');

  });

  it('should exec command', () => {

    const command = {
      type: 'test.command',
      params: { test: 'params' },
    };

    component[`execCommand`](command);

    expect(editorComponent.commands$.next).toHaveBeenCalledWith(command);

  });

});
