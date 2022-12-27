import { Overlay } from '@angular/cdk/overlay';
import { InjectionToken, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PebEditorApi, PebEditorWs, PebEditorWsEvents } from '@pe/builder-api';
import * as pebCore from '@pe/builder-core';
import {
  PebEditorState,
  PebElementType,
  PebLanguage,
  PebScreen,
  pebScreenMainWidthList,
  PebShapesShape,
  PebShopContainer,
  PEB_DESKTOP_CONTENT_WIDTH,
} from '@pe/builder-core';
import { PeDataGridSidebarService } from '@pe/data-grid';
import * as peDomToImage from '@pe/dom-to-image';
import { PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import { omit, pick } from 'lodash';
import Delta from 'quill-delta';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { filter, skip } from 'rxjs/operators';
import { SHAPES_CONTEXT_DATA } from './shapes.common';
import { PebShapesComponent } from './shapes.component';
import { PebShapesService } from './shapes.service';

describe('PebShapesComponent', () => {

  let fixture: ComponentFixture<PebShapesComponent>;
  let component: PebShapesComponent;
  let api: jasmine.SpyObj<PebEditorApi>;
  let platformHeader: jasmine.SpyObj<PePlatformHeaderService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;
  let snackbarService: jasmine.SpyObj<SnackbarService>;
  let editorWs: jasmine.SpyObj<PebEditorWs>;
  let overlay: jasmine.SpyObj<Overlay>;
  let dialogData: {
    screen: PebScreen;
    contextBuilder: any;
    elementKit: any;
  };

  const shapesServiceMock = {
    baseShape: {
      data: {
        text: null,
        variant: PebShapeVariant.Square,
      },
      type: PebElementType.Shape,
      style: { borderRadius: 0, fontFamily: 'Roboto', fontSize: 13 },
    },
  };

  beforeAll(() => {

    Object.defineProperties(pebCore, {
      shapeMigrations: {
        value: pebCore.shapeMigrations,
        writable: true,
      },
      pebGenerateId: {
        value: pebCore.pebGenerateId,
        writable: true,
      },
      getElementKitTransformationDeep: {
        value: pebCore.getElementKitTransformationDeep,
        writable: true,
      },
    });

    Object.defineProperty(peDomToImage, 'toBlob', {
      value: peDomToImage.toBlob,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    dialogData = {
      screen: null,
      contextBuilder: { test: 'context.builder' },
      elementKit: null,
    };

    const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any>>('MatDialogRef', ['close']);

    const apiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', [
      'getShape',
      'deleteShapeAlbum',
      'uploadImage',
      'postShape',
      'deleteShape',
      'patchShapeAlbum',
      'postShapeAlbum',
      'postShape',
      'patchShape',
    ]);

    const platformHeaderSpy = jasmine.createSpyObj<PePlatformHeaderService>('PePlatformHeaderService', [
      'setConfig',
    ]);

    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', {
      create: undefined,
      position: {
        flexibleConnectedTo: () => ({
          withFlexibleDimensions: () => ({
            withViewportMargin: () => ({
              withPositions: () => ({ test: 'position.strategy' }),
            }),
          }),
        }),
      } as any,
    }, {
      scrollStrategies: {
        reposition: () => ({ test: 'scroll.strategy' }),
      } as any,
    });

    const editorWsSpy = jasmine.createSpyObj<PebEditorWs>('PebEditorWs', [
      'on',
      'getShapes',
      'getShapeAlbums',
    ]);
    editorWsSpy.on.and.returnValue(EMPTY);

    const snackbarServiceSpy = jasmine.createSpyObj<SnackbarService>('SnackbarService', ['toggle']);

    TestBed.configureTestingModule({
      declarations: [PebShapesComponent],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: PebEditorState, useValue: {} },
        { provide: PebEditorApi, useValue: apiSpy },
        { provide: PeDataGridSidebarService, useValue: {} },
        { provide: PePlatformHeaderService, useValue: platformHeaderSpy },
        { provide: PebShapesService, useValue: shapesServiceMock },
        { provide: Overlay, useValue: overlaySpy },
        { provide: PebEditorWs, useValue: editorWsSpy },
        { provide: SnackbarService, useValue: snackbarServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebShapesComponent);
      component = fixture.componentInstance;

      api = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;
      platformHeader = TestBed.inject(PePlatformHeaderService) as jasmine.SpyObj<PePlatformHeaderService>;
      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<any>>;
      snackbarService = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
      editorWs = TestBed.inject(PebEditorWs) as jasmine.SpyObj<PebEditorWs>;
      overlay = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set/get shapes', () => {

    const shapes = [{ id: 'shape-001' }];
    const nextSpy = spyOn(component[`shapesSubject$`], 'next').and.callThrough();

    component.shapes$.pipe(skip(1)).subscribe(res => expect(res).toEqual(shapes));
    expect(component.shapes).toEqual([]);

    component.shapes = shapes;
    expect(nextSpy).toHaveBeenCalledWith(shapes);
    expect(component.shapes).toEqual(shapes);

  });

  it('should set/get shape albums', () => {

    const shapeAlbums: any[] = [{ id: 'album-001' }];
    const nextSpy = spyOn(component[`shapeAlbumsSubject$`], 'next').and.callThrough();

    component.shapeAlbums$.pipe(skip(1)).subscribe(res => expect(res).toEqual(shapeAlbums));
    expect(component.shapeAlbums).toEqual([]);

    component.shapeAlbums = shapeAlbums;
    expect(nextSpy).toHaveBeenCalledWith(shapeAlbums);
    expect(component.shapeAlbums).toEqual(shapeAlbums);

  });

  it('should set/get shape items', () => {

    const shapeItems = [{ id: 'si-001' }];
    const nextSpy = spyOn(component[`shapeItemsSubject$`], 'next').and.callThrough();

    component.shapeItems$.pipe(skip(1)).subscribe(res => expect(res).toEqual(shapeItems));
    expect(component.shapeItems).toEqual([]);

    component.shapeItems = shapeItems;
    expect(nextSpy).toHaveBeenCalledWith(shapeItems);
    expect(component.shapeItems).toEqual(shapeItems);

  });

  it('should set/get shape album id', () => {

    const refreshNextSpy = spyOn(component[`refreshSubject$`], 'next');
    const albumTreeFilter = {
      nodeToggle: jasmine.createSpy('nodeToggle'),
    };
    const treeControl = {
      expand: jasmine.createSpy('expand'),
    };
    const treeData = {
      'album-001': {
        id: 'album-001',
        parentId: null,
      },
      'album-002': {
        id: 'album-002',
        parentId: 'album-001',
      },
    };

    /**
     * treeData['album-013'] is undefined
     */
    component.albumTreeFilter = albumTreeFilter as any;
    component[`treeControl`] = treeControl as any;
    component[`treeDataStore$`].next(treeData as any);
    component.formGroup.patchValue({ tree: null });
    expect(component.shapeAlbumId).toBeNull();

    component.shapeAlbumId = 'album-013';
    expect(component.shapeAlbumId).toBeNull();
    expect(albumTreeFilter.nodeToggle).toHaveBeenCalledWith(undefined);
    expect(treeControl.expand).not.toHaveBeenCalled();
    expect(refreshNextSpy).toHaveBeenCalled();

    /**
     * treeData['album-002'] is set
     */
    component.shapeAlbumId$.subscribe(id => expect(id).toEqual('album-002'));
    component.formGroup.patchValue({ tree: Object.values(treeData).reverse() });
    component.shapeAlbumId = 'album-002';
    expect(component.shapeAlbumId).toEqual('album-002');
    expect(albumTreeFilter.nodeToggle).toHaveBeenCalledWith(treeData['album-002']);
    expect(treeControl.expand.calls.allArgs()).toEqual(Object.values(treeData).map(album => [album]));

  });

  it('should get tree data', () => {

    const treeData: any[] = [
      {
        id: 'album-001',
        parentId: null,
      },
      {
        id: 'album-002',
        parentId: 'album-001',
      },
    ];

    component.treeData$.pipe(skip(1)).subscribe(res => expect(res).toEqual(treeData));
    expect(component.treeData).toEqual([]);

    component[`treeDataSubject$`].next(treeData);
    expect(component.treeData).toEqual(treeData);

  });

  it('should handle single shape select selected action', () => {

    const closeDialogSpy = spyOn<any>(component, 'closeDialog');
    const shapeMigrationsSpy = spyOn(pebCore, 'shapeMigrations');
    const shape: PebShapesShape = {
      id: 'shape',
      basic: false,
      screen: PebScreen.Desktop,
      elementKit: {
        element: {
          id: 'elem',
          type: PebElementType.Section,
          data: null,
          children: [{
            id: 'child-001',
            type: PebElementType.Button,
            data: {
              text: { [PebScreen.Desktop]: null },
            },
            children: [],
          }],
        },
        children: [{
          element: {
            id: 'child-002',
            type: PebElementType.Button,
            data: {
              text: {
                [PebScreen.Desktop]: {
                  [PebLanguage.English]: new Delta([{ insert: 'test.english' }]),
                },
              },
            },
            children: [],
          },
        }],
      } as any,
    };

    api.getShape.and.returnValue(of(shape));
    shapeMigrationsSpy.and.returnValue(shape as any);

    component.screen = PebScreen.Mobile;
    expect(component.shapeSingleSelectedAction.label).toEqual('Add');
    const callback = component.shapeSingleSelectedAction.callback;

    /**
     * test callback of the action
     * shape.basic is FALSE
     * shape.elementKit.element is set
     * shape.screen is NOT equal to component.screen
     */
    callback(shape.id);

    expect(api.getShape).toHaveBeenCalledWith(shape.id);
    expect(shapeMigrationsSpy).toHaveBeenCalledWith(shape as any);
    expect(closeDialogSpy).not.toHaveBeenCalled();

    /**
     * shape.basic is TRUE
     */
    shape.basic = true;
    callback(shape.id);

    expect(shape.elementKit.element.data).toBeNull();
    expect(shape.elementKit.element.children[0].data.text).toEqual({ [PebScreen.Desktop]: null });
    expect(shape.elementKit.children[0].element.data.text).toEqual({
      ...shape.elementKit.children[0].element.data.text,
      [component.screen]: shape.elementKit.children[0].element.data.text[PebScreen.Desktop],
    })
    expect(closeDialogSpy).not.toHaveBeenCalled();

    /**
     * shape.basic is FALSE
     * shape.elementKit.element is null
     */
    shape.basic = false;
    shape.elementKit.element = null;
    callback(shape.id);

    expect(closeDialogSpy).toHaveBeenCalledWith({
      type: 'appendElement',
      payload: shape,
    });

  });

  it('should handle single selected album action', () => {

    const setSpy = spyOnProperty(component, 'shapeAlbumId', 'set');

    expect(component.albumSingleSelectedAction.label).toEqual('Open');
    component.albumSingleSelectedAction.callback('album');
    expect(setSpy).toHaveBeenCalledWith('album');

  });

  it('should handle delete album action', () => {

    const treeData = { album: { id: 'album' } };
    const getShapeAlbumsSpy = spyOn(component, 'getShapeAlbums');

    api.deleteShapeAlbum.and.returnValue(of(null));

    component[`treeDataStore$`].next(treeData as any);
    expect(component.albumDeleteAction.label).toEqual('Remove');
    const callback = component.albumDeleteAction.callback;

    /**
     * album does NOT exist in treeData
     */
    callback('album-001');

    expect(api.deleteShapeAlbum).not.toHaveBeenCalled();
    expect(getShapeAlbumsSpy).not.toHaveBeenCalled();

    /**
     * album exists in treeData
     */
    callback('album');

    expect(api.deleteShapeAlbum).toHaveBeenCalledWith('album');
    expect(getShapeAlbumsSpy).toHaveBeenCalled();

  });

  it('should handle single selected new shape action', fakeAsync(() => {

    const blob = new Blob(['test']);
    const toBlobSpy = spyOn(peDomToImage, 'toBlob').and.resolveTo(blob);
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    const getShapesSpy = spyOn(component, 'getShapes');
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const newItem = {
      id: 'shape',
      title: 'New Shape',
      description: 'desc',
      data: null,
    };
    const newShapeRendererTpl = {
      nativeElement: {
        clientWidth: 1200,
        clientHeight: 720,
      },
    };

    spyOnProperty(component, 'shapeAlbumId').and.returnValue('album-001');
    api.postShape.and.returnValue(of(null));

    component.screen = PebScreen.Mobile;
    expect(component.newShapeSingleSelectedAction.label).toEqual('Save');
    const callback = component.newShapeSingleSelectedAction.callback;

    /**
     * component.newShapeRendererTpl is null
     */
    component.newShapeRendererTpl = null;
    callback();

    expect(toBlobSpy).not.toHaveBeenCalled();
    expect(generateIdSpy).not.toHaveBeenCalled();
    expect(api.uploadImage).not.toHaveBeenCalled();
    expect(api.postShape).not.toHaveBeenCalled();
    expect(getShapesSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    /**
     * component.newShapeRendererTpl is set
     * component.newItem.data is null
     * api.uploadImage throws error
     */
    api.uploadImage.and.returnValue(throwError('test error'));

    component.newShapeRendererTpl = newShapeRendererTpl;
    component.newItem = newItem;
    callback();

    flushMicrotasks();

    expect(toBlobSpy).toHaveBeenCalledWith(
      newShapeRendererTpl.nativeElement as any,
      {
        width: newShapeRendererTpl.nativeElement.clientWidth,
        height: newShapeRendererTpl.nativeElement.clientHeight,
        cacheBust: true,
        skipFonts: true,
      },
    );
    expect(generateIdSpy).toHaveBeenCalled();
    expect(api.uploadImage).toHaveBeenCalledWith(
      PebShopContainer.Images,
      new File([blob], 'shape-preview-gid-001'),
    );
    expect(api.postShape).toHaveBeenCalledWith({
      elementKit: undefined,
      id: newItem.id,
      title: newItem.title,
      description: newItem.description,
      album: 'album-001',
      screen: PebScreen.Mobile,
      image: null,
    });
    expect(component.newItem).toBeUndefined();
    expect(getShapesSpy).toHaveBeenCalledWith('album-001');
    expect(markSpy).toHaveBeenCalled();

    /**
     * api.uploadImage returns mocked data
     * component.newItem.data is set
     */
    api.uploadImage.and.returnValue(of({ blobName: 'test.blob' }) as any);
    newItem.data = {
      elementKit: {
        element: { id: 'elem' },
      },
    };

    component.newItem = newItem;
    callback();

    flushMicrotasks();

    expect(api.postShape).toHaveBeenCalledWith({
      elementKit: newItem.data.elementKit,
      id: newItem.id,
      title: newItem.title,
      description: newItem.description,
      album: 'album-001',
      screen: PebScreen.Mobile,
      image: 'test.blob',
    });

  }));

  it('should handle new single selected action', () => {

    const treeItem = {
      data: { type: PebElementType.Grid },
    };

    expect(component.newSingleSelectedAction.label).toEqual('Add New');
    const callback = component.newSingleSelectedAction.callback;

    /**
     * component.formGroup.value.tree is null
     */
    component.formGroup.patchValue({ tree: null });
    callback();

    expect(dialogRef.close).toHaveBeenCalledWith({
      type: 'createElement',
      payload: shapesServiceMock.baseShape,
    });

    /**
     * component.formGroup.value.tree[0].data is null
     */
    dialogRef.close.calls.reset();

    component.formGroup.patchValue({ tree: [{ data: null }] });
    callback();

    expect(dialogRef.close).toHaveBeenCalledWith({
      type: 'createElement',
      payload: shapesServiceMock.baseShape,
    });

    /**
     * component.formGroup.value.tree[0].data.type is PebElementType.Grid
     */
    dialogRef.close.calls.reset();

    component.formGroup.patchValue({ tree: [treeItem] });
    callback();

    expect(dialogRef.close).toHaveBeenCalledWith({
      type: 'createElement',
      payload: {
        data: {},
        type: PebElementType.Grid,
      },
    });

    /**
     * component.formGroup.value.tree[0].data.type is PebElement.Text
     */
    dialogRef.close.calls.reset();

    treeItem.data.type = PebElementType.Text;
    callback();

    expect(dialogRef.close).toHaveBeenCalledWith({
      type: 'createElement',
      payload: {
        type: PebElementType.Text,
        data: { text: '<span>Your text</span>' },
        style: { width: '100%' },
      },
    });

  });

  it('should handle callback of sidebar footer data menu items', () => {

    const treeNode = {
      children: [],
    };
    const treeData = [{
      id: 'album-001',
      name: 'Album 1',
      parentId: 'album',
      children: [],
    }];
    const treeStore = {
      'album': { data: null },
    };
    const albumTreeFilter = {
      treeControl: {
        expand: jasmine.createSpy('expand'),
      },
    };
    const refreshNextSpy = spyOn(component[`refreshSubject$`], 'next');

    spyOnProperty(component, 'shapeAlbumId').and.returnValue('album');
    spyOnProperty(component, 'treeData').and.returnValue(treeData);

    expect(component.sidebarFooterData.menuItems.length).toBe(1);
    const menuItem = component.sidebarFooterData.menuItems[0];
    expect(menuItem.title).toEqual('Add New Folder');

    /**
     * parent.data is null
     */
    component[`treeDataStore$`].next(treeStore as any);
    component.albumTreeFilter = albumTreeFilter as any;
    menuItem.onClick();

    expect(snackbarService.toggle).toHaveBeenCalledWith(
      true,
      {
        content: 'Cannot add folder for template folder',
        duration: 2000,
      },
    );
    expect(albumTreeFilter.treeControl.expand).not.toHaveBeenCalled();
    expect(refreshNextSpy).not.toHaveBeenCalled();

    /**
     * parent.data.application is set
     * component.formGroup.value.tree is null
     */
    treeStore.album.data = { application: { id: 'app-001' } };
    treeData.length = 0;
    snackbarService.toggle.calls.reset();

    component.formGroup.patchValue({ tree: null });
    menuItem.onClick();

    expect(snackbarService.toggle).not.toHaveBeenCalled();
    expect(treeData).toEqual([{
      name: '',
      parentId: 'album',
      children: [],
    }] as any[]);
    expect(albumTreeFilter.treeControl.expand).toHaveBeenCalledWith(treeData);
    expect(refreshNextSpy).toHaveBeenCalledWith(true);

    /**
     * component.formGroup.value.tree is set
     */
    component.formGroup.patchValue({ tree: [treeNode] });
    menuItem.onClick();

    expect(snackbarService.toggle).not.toHaveBeenCalled();
    expect(treeNode.children).toEqual([{
      name: '',
      parentId: 'album',
      children: [],
    }]);
    expect(albumTreeFilter.treeControl.expand).toHaveBeenCalledWith(treeNode.children);

  });

  it('should handle shape delete action', () => {

    const getShapesSpy = spyOn(component, 'getShapes');

    spyOnProperty(component, 'shapeAlbumId').and.returnValue('album-001');
    api.deleteShape.and.returnValue(of(null));

    expect(component.shapeDeleteAction.label).toEqual('Remove');
    component.shapeDeleteAction.callback('album');

    expect(api.deleteShape).toHaveBeenCalledWith('album');
    expect(getShapesSpy).toHaveBeenCalledWith('album-001');

  });

  it('should set get item transformation', () => {

    const elemTransformation = {
      definition: {
        id: 'elem',
        type: PebElementType.Shape,
      },
    };
    const nextSpy = spyOn(component[`itemTransformationsStore$`], 'next').and.callThrough();

    expect(component.getItemTransformation('elem')).toBeNull();

    component.setItemTransformation('elem', elemTransformation);
    expect(nextSpy).toHaveBeenCalledWith({
      elem: elemTransformation,
    });
    expect(component.getItemTransformation('elem')).toEqual(elemTransformation);

  });

  it('should handle ng init', () => {

    const createHeaderSpy = spyOn<any>(component, 'createHeader');
    const shapeMigrationsSpy = spyOn(pebCore, 'shapeMigrations');
    const getShapesSpy = spyOn(component, 'getShapes');
    const getShapeAlbumsSpy = spyOn(component, 'getShapeAlbums');
    const nextSpies = {
      shapeAlbumsWS: spyOn(component[`shapeAlbumsWSSubject$`], 'next').and.callThrough(),
      shapeAlbums: spyOn(component[`shapeAlbumsSubject$`], 'next').and.callThrough(),
      shapesWS: spyOn(component[`shapesWSSubject$`], 'next').and.callThrough(),
      shapes: spyOn(component[`shapesSubject$`], 'next').and.callThrough(),
      shapeItems: spyOn(component[`shapeItemsSubject$`], 'next').and.callThrough(),
      albumDictByParent: spyOn(component[`albumDictByParent$`], 'next').and.callThrough(),
      albumDictById: spyOn(component[`albumDictById$`], 'next').and.callThrough(),
      shapeAlbumItems: spyOn(component[`shapeAlbumItemsSubject$`], 'next').and.callThrough(),
      treeDataStore: spyOn(component[`treeDataStore$`], 'next').and.callThrough(),
      treeData: spyOn(component[`treeDataSubject$`], 'next').and.callThrough(),
    };
    const setShapeAlbumIdSpy = spyOnProperty(component, 'shapeAlbumId', 'set');
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    const wsEvents$ = new Subject<any>();
    const shapeMock = {
      id: 'shape-001',
      title: 'Shape 1',
      description: 'desc',
      screen: PebScreen.Mobile,
    };
    const shapeAlbumsMock = [
      {
        id: 'album-001',
        name: 'Album 1',
        parent: null,
        image: null,
      },
      {
        id: 'album-002',
        name: 'Album 2',
        parent: null,
        image: null,
      },
      {
        id: 'album-003',
        name: 'Album 3',
        parent: 'album-001',
        image: 'images/album.svg',
      },
    ];

    function checkNotCalled(keys: string[]): void {
      Object.keys(nextSpies)
        .filter(key => !keys.includes(key))
        .forEach(key => expect(nextSpies[key]).not.toHaveBeenCalled());
    }

    editorWs.on.and.callFake((type: PebEditorWsEvents) => {
      return wsEvents$.pipe(filter(e => e.type === type));
    });
    shapeMigrationsSpy.and.callFake((shape: any) => shape);

    /**
     * dialogData.screen & elementKit are null
     */
    component.ngOnInit();

    expect(createHeaderSpy).toHaveBeenCalled();
    expect(component.screen).toEqual(PebScreen.Desktop);
    expect(component[`contextBuilder`]).toEqual(dialogData.contextBuilder);
    expect(component.newItem).toBeUndefined();
    expect(generateIdSpy).not.toHaveBeenCalled();
    expect(getShapesSpy).not.toHaveBeenCalled();
    expect(shapeMigrationsSpy).not.toHaveBeenCalled();
    expect(setShapeAlbumIdSpy).not.toHaveBeenCalled();
    expect(nextSpies.shapeItems).toHaveBeenCalledWith([]);
    expect(nextSpies.treeDataStore).toHaveBeenCalledWith({});
    expect(nextSpies.treeData).toHaveBeenCalledWith([]);
    checkNotCalled(['shapeItems', 'treeDataStore', 'treeData']);
    expect(getShapeAlbumsSpy).toHaveBeenCalled();
    expect(editorWs.on.calls.allArgs()).toEqual([
      [PebEditorWsEvents.GetShape],
      [PebEditorWsEvents.GetShapeAlbum],
    ]);

    /**
     * emit PebEditorWsEvents.GetShape on editorWs
     * message.data.shapes is null
     */
    Object.values(nextSpies).forEach(spy => spy.calls.reset());
    wsEvents$.next({
      type: PebEditorWsEvents.GetShape,
      data: {
        shapes: null,
      },
    });

    expect(shapeMigrationsSpy).toHaveBeenCalledWith([]);
    expect(nextSpies.shapesWS).toHaveBeenCalledWith([]);
    expect(nextSpies.shapes).toHaveBeenCalledWith([]);
    expect(nextSpies.shapeItems).toHaveBeenCalledWith([]);
    checkNotCalled(['shapesWS', 'shapes', 'shapeItems']);

    /**
     * message.data.shapes is set as [null]
     */
    Object.values(nextSpies).forEach(spy => spy.calls.reset());
    wsEvents$.next({
      type: PebEditorWsEvents.GetShape,
      data: {
        shapes: [null],
      },
    });

    expect(shapeMigrationsSpy).toHaveBeenCalledWith([null]);
    expect(nextSpies.shapesWS).toHaveBeenCalledWith([null]);
    expect(nextSpies.shapes).toHaveBeenCalledWith([null]);
    expect(nextSpies.shapeItems).toHaveBeenCalledWith([{
      id: '',
      title: undefined,
      description: undefined,
      actions: [component.shapeSingleSelectedAction],
      image: null,
      data: {
        shape: null,
        screen: PebScreen.Desktop,
      },
    }]);
    checkNotCalled(['shapesWS', 'shapes', 'shapeItems']);

    /**
     * message.data.shapes is mocked
     */
    Object.values(nextSpies).forEach(spy => spy.calls.reset());
    wsEvents$.next({
      type: PebEditorWsEvents.GetShape,
      data: {
        shapes: [shapeMock],
      },
    });

    expect(shapeMigrationsSpy).toHaveBeenCalledWith([shapeMock]);
    expect(nextSpies.shapesWS).toHaveBeenCalledWith([shapeMock]);
    expect(nextSpies.shapes).toHaveBeenCalledWith([null, shapeMock]);
    expect(nextSpies.shapeItems).toHaveBeenCalledWith([
      {
        id: '',
        title: undefined,
        description: undefined,
        actions: [component.shapeSingleSelectedAction],
        image: null,
        data: {
          shape: null,
          screen: PebScreen.Desktop,
        },
      },
      {
        id: shapeMock.id,
        title: shapeMock.title,
        description: shapeMock.description,
        actions: [component.shapeSingleSelectedAction],
        image: null,
        data: {
          shape: shapeMock,
          screen: shapeMock.screen,
        },
      },
    ]);
    checkNotCalled(['shapesWS', 'shapes', 'shapeItems']);

    /**
     * set component.searchControl.value to 'test search'
     */
    component.searchControl.setValue('test search');

    expect(nextSpies.shapeItems).toHaveBeenCalledWith([]);

    /**
     * emit PebEditorWsEvents.GetShapeAlbum on editorWs
     * message.data.shapeAlbums is null
     */
    Object.values(nextSpies).forEach(spy => spy.calls.reset());
    wsEvents$.next({
      type: PebEditorWsEvents.GetShapeAlbum,
      data: {
        shapeAlbums: null,
      },
    });

    expect(nextSpies.shapeAlbumsWS).toHaveBeenCalledWith([]);
    expect(nextSpies.shapeAlbums).toHaveBeenCalledWith([]);
    expect(nextSpies.albumDictByParent).toHaveBeenCalledWith({});
    expect(nextSpies.albumDictById).toHaveBeenCalledWith({});
    expect(nextSpies.treeDataStore.calls.allArgs().map(([a]) => a)).toEqual(Array(2).fill({}));
    expect(nextSpies.treeData.calls.allArgs().map(([a]) => a)).toEqual(Array(2).fill([]));
    checkNotCalled([
      'shapeAlbumsWS',
      'shapeAlbums',
      'albumDictByParent',
      'albumDictById',
      'treeDataStore',
      'treeData',
    ]);

    /**
     * message.data.shapeAlbums is mocked
     */
    Object.values(nextSpies).forEach(spy => spy.calls.reset());
    wsEvents$.next({
      type: PebEditorWsEvents.GetShapeAlbum,
      data: {
        shapeAlbums: shapeAlbumsMock,
      },
    });

    expect(nextSpies.shapeAlbumsWS).toHaveBeenCalledWith(shapeAlbumsMock as any);
    expect(nextSpies.shapeAlbums).toHaveBeenCalledWith(shapeAlbumsMock as any);
    Object.entries(nextSpies.albumDictByParent.calls.argsFor(0)[0]).forEach(([key, value]) => {
      if (key === 'album-001') {
        expect(value).toEqual(shapeAlbumsMock.slice(-1) as any[]);
        return;
      }
      expect(value).toEqual(shapeAlbumsMock.slice(0, 2) as any[]);
    });
    expect(nextSpies.albumDictById).toHaveBeenCalledWith(shapeAlbumsMock.reduce((acc, shapeAlbum) => {
      return { ...acc, [shapeAlbum.id]: shapeAlbum };
    }, {}));
    expect(nextSpies.treeDataStore).toHaveBeenCalledWith(shapeAlbumsMock.reduce((acc, shapeAlbum) => {
      return {
        ...acc,
        [shapeAlbum.id]: {
          id: shapeAlbum.id,
          parentId: shapeAlbum.parent,
          name: shapeAlbum.name,
          data: shapeAlbum,
          image: shapeAlbum.image ?? '/assets/shapes/album.svg',
          children: shapeAlbum.id === 'album-001' ? [{
            id: shapeAlbumsMock[2].id,
            parentId: shapeAlbumsMock[2].parent,
            name: shapeAlbumsMock[2].name,
            data: shapeAlbumsMock[2],
            image: shapeAlbumsMock[2].image,
            children: [],
          }] : [],
        },
      };
    }, {}));
    expect(nextSpies.treeData).toHaveBeenCalledWith(shapeAlbumsMock.slice(0, 2).map(shapeAlbum => ({
      id: shapeAlbum.id,
      parentId: shapeAlbum.parent,
      name: shapeAlbum.name,
      data: shapeAlbum,
      image: shapeAlbum.image ?? '/assets/shapes/album.svg',
      children: shapeAlbum.id === 'album-001' ? [{
        id: shapeAlbumsMock[2].id,
        parentId: shapeAlbumsMock[2].parent,
        name: shapeAlbumsMock[2].name,
        data: shapeAlbumsMock[2],
        image: shapeAlbumsMock[2].image,
        children: [],
      }] : [],
    })) as any);
    checkNotCalled([
      'shapeAlbumsWS',
      'shapeAlbums',
      'albumDictByParent',
      'albumDictById',
      'treeDataStore',
      'treeData',
    ]);

    /**
     * emit component.shapeAlbumId$
     */
    Object.values(nextSpies).forEach(spy => spy.calls.reset());
    component.formGroup.patchValue({ tree: shapeAlbumsMock });

    expect(component.searchControl.value).toEqual('');
    expect(getShapesSpy).toHaveBeenCalledWith(shapeAlbumsMock[0].id);
    expect(nextSpies.shapeAlbumItems).toHaveBeenCalledWith([{
      id: shapeAlbumsMock[2].id,
      title: shapeAlbumsMock[2].name,
      data: shapeAlbumsMock[2],
      actions: [component.albumSingleSelectedAction],
    }]);

    /**
     * emit component.albumDictByParent$ as {}
     */
    component[`albumDictByParent$`].next({});

    expect(nextSpies.shapeAlbumItems).toHaveBeenCalledWith([]);

    /**
     * dialogData.screen & elementKit are set
     */
    dialogData.screen = PebScreen.Tablet;
    dialogData.elementKit = {
      element: { id: 'elem' },
    };

    component.ngOnInit();
    expect(component.screen).toEqual(dialogData.screen);
    expect(component.newItem).toEqual({
      id: 'gid-001',
      actions: [component.newShapeSingleSelectedAction],
      data: {
        elementKit: dialogData.elementKit,
        title: 'Untitled',
        description: 'No tag',
      },
    });

  });

  it('should handle ng destroy', () => {

    const config: any = { test: 'config' };
    const spies = [
      spyOn(component[`destroyed$`], 'next'),
      spyOn(component[`destroyed$`], 'complete'),
    ];

    /**
     * component.headerConfig is null
     */
    component[`headerConfig`] = null;
    component.ngOnDestroy();

    expect(platformHeader.setConfig).not.toHaveBeenCalled();
    spies.forEach(spy => expect(spy).toHaveBeenCalled());

    /**
     * component.headerConfig is set
     */
    component[`headerConfig`] = config;
    component.ngOnDestroy();

    expect(platformHeader.setConfig).toHaveBeenCalledWith(config);

  });

  it('should close dialog', () => {

    component[`closeDialog`]('test');

    expect(dialogRef.close).toHaveBeenCalledWith('test');

  });

  it('should get shapes', () => {

    const shapeItemsSpy = spyOnProperty(component, 'shapeItems').and.returnValue(null);
    const shapesSetSpy = spyOnProperty(component, 'shapes', 'set');

    /**
     * argument albumId is undefined as default
     * argument append is FALSE as default
     * component.shapeItems is null
     */
    component.getShapes();

    expect(shapesSetSpy).toHaveBeenCalledWith([]);
    expect(editorWs.getShapes).toHaveBeenCalledWith({
      album: null,
      pagination: {
        offset: 0,
        limit: component.pagination.pageSize,
      },
    });

    /**
     * component.shapeItems is set
     * argument albumId is set
     * argument append is TRUE
     */
    shapeItemsSpy.and.returnValue(Array.from({ length: 5 }, (_, index) => ({ id: `shape-00${index}` })));
    shapesSetSpy.calls.reset();

    component.getShapes('album', true);

    expect(shapesSetSpy).not.toHaveBeenCalled();
    expect(editorWs.getShapes).toHaveBeenCalledWith({
      album: 'album',
      pagination: {
        offset: 5,
        limit: component.pagination.pageSize,
      },
    });

  });

  it('should get shape albums', () => {

    component.getShapeAlbums();

    expect(editorWs.getShapeAlbums).toHaveBeenCalled();

  });

  it('should create header', () => {

    const config: any = { test: 'config' };
    const closeSpy = spyOn<any>(component, 'closeDialog');

    platformHeader[`config` as any] = config;

    component[`headerConfig`] = null;
    component[`createHeader`]();

    expect(component[`headerConfig`]).toEqual(config);
    const setConfig = platformHeader.setConfig.calls.first().args[0];
    expect(omit(setConfig, 'closeItem')).toEqual({
      mainDashboardUrl: null,
      currentMicroBaseUrl: null,
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      isShowCloseItem: true,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
    });
    expect(setConfig.closeItem.title).toEqual('Close');
    expect(closeSpy).not.toHaveBeenCalled();

    setConfig.closeItem.onClick();
    expect(closeSpy).toHaveBeenCalledWith(null);

  });

  it('should track grid item by id', () => {

    expect(component.gridItemTrackBy({ id: 'test' })).toEqual('test');

  });

  it('should check if transformation has context', () => {

    const elemTransformation = {
      contextSchema: null,
    };

    expect(component.transformationHasContext(elemTransformation)).toBe(false);

    elemTransformation.contextSchema = { test: 'context.schema' };
    expect(component.transformationHasContext(elemTransformation)).toBe(true);

  });

  it('should get transformation', () => {

    const getItemTransformationSpy = spyOn(component, 'getItemTransformation');
    const setItemTransformationSpy = spyOn(component, 'setItemTransformation');
    const getElementKitTransformationSpy = spyOn(pebCore, 'getElementKitTransformationDeep');
    const ctx = { test: 'context' };
    const ctxBuilder = {
      buildSchema: jasmine.createSpy('buildSchema').and.returnValue(of(ctx)),
    };
    const elementKit = {
      element: {
        id: 'elem',
        type: PebElementType.Shape,
      },
    };
    const transformation: any = {
      elementKit,
      contextSchema: { test: 'context.schema' },
    };

    getElementKitTransformationSpy.and.returnValue(transformation);

    /**
     * component.getItemTransformation returns mocked data
     * argument elementKit is null
     */
    getItemTransformationSpy.and.returnValue(transformation);

    expect(getItemTransformationSpy).toHaveBeenCalledWith('elem');
    expect(setItemTransformationSpy).not.toHaveBeenCalled();
    expect(getElementKitTransformationSpy).not.toHaveBeenCalled();

    /**
     * component.getItemTransformation returns null
     */
    getItemTransformationSpy.and.returnValue(null);

    expect(setItemTransformationSpy).toHaveBeenCalledWith('elem', null);
    expect(getElementKitTransformationSpy).not.toHaveBeenCalled();

    /**
     * argument elementKit is set
     * component.contextBuilder is null
     */
    setItemTransformationSpy.calls.reset();

    component[`contextBuilder`] = null;

    expect(setItemTransformationSpy).toHaveBeenCalledWith('elem', {
      ...transformation,
      context: {},
    });
    expect(getElementKitTransformationSpy).toHaveBeenCalledWith(elementKit as any);

    /**
     * component.contextBuilder is set
     */
    component[`contextBuilder`] = ctxBuilder;

    expect(setItemTransformationSpy).toHaveBeenCalledWith('elem', {
      ...transformation,
      context: ctx,
    });
    expect(ctxBuilder.buildSchema).toHaveBeenCalledWith(transformation.contextSchema);

  });

  it('should get stylesheet', () => {

    const transformation = {
      definition: { id: 'elem' },
      styles: {
        [PebScreen.Desktop]: null,
        [PebScreen.Mobile]: {
          elem: { backgroundColor: '#cccccc' },
        },
      },
    };

    /**
     * argument screen is component.screen as default
     * component.screen is PebScreen.Desktop
     */
    component.screen = PebScreen.Desktop;
    expect(component.getStylesheet(transformation as any)).toEqual({
      [transformation.definition.id]: undefined,
    });

    /**
     * argument screen is set
     */
    expect(component.getStylesheet(transformation as any, PebScreen.Mobile)).toEqual({
      elem: { backgroundColor: '#cccccc' },
    });

  });

  it('should get scale', () => {

    const elementKit = {
      styles: null,
    };

    /**
     * argument elementKit is null
     * argument screen is component.screen
     * component.screen is PebScreen.Desktop
     */
    component.screen = PebScreen.Desktop;
    expect(component.getScale(null)).toBe(1 / (PEB_DESKTOP_CONTENT_WIDTH / 70));

    /**
     * argument elementKit is set
     * argument screen is PebScreen.Mobile
     * elementKit.styles is null
     */
    expect(component.getScale(elementKit as any, PebScreen.Mobile))
      .toBe(1 / (pebScreenMainWidthList[PebScreen.Mobile] / 70));

    /**
     * elementKit.styles[PebScreen.Mobile] is set
     * width & height are null
     * minWidth & minHeight are set
     */
    elementKit.styles = {
      [PebScreen.Mobile]: {
        width: null,
        height: null,
        minWidth: 15,
        minHeight: 30,
      },
    };

    expect(component.getScale(elementKit as any, PebScreen.Mobile)).toBe(1);

    /**
     * width & height are set
     */
    elementKit.styles[PebScreen.Mobile].width = 700;
    elementKit.styles[PebScreen.Mobile].height = 500;

    expect(component.getScale(elementKit as any, PebScreen.Mobile)).toEqual(0.1);

  });

  it('should get renderer dimensions', () => {

    const getScaleSpy = spyOn(component, 'getScale').and.callThrough();
    const elementKit = {
      styles: null,
    };

    /**
     * argument elementKit is null
     * argument screen is component.screen
     * component.screen is PebScreen.Desktop
     */
    component.screen = PebScreen.Desktop;

    expect(getScaleSpy).toHaveBeenCalledWith(null, PebScreen.Desktop);

    /**
     * argument elementKit is set
     * elementKit.styles is null
     */
    expect(getScaleSpy).toHaveBeenCalledWith(elementKit as any, PebScreen.Desktop);

    /**
     * elementKit.styles[PebScreen.Desktop] is null
     */
    elementKit.styles = { [PebScreen.Desktop]: null };

    /**
     * argument screen is PebScreen.Mobile
     * elementKit.styles[PebScreen.Mobile] is set
     */
    elementKit.styles = {
      [PebScreen.Mobile]: {
        width: 1400,
        height: 300,
      },
    };

    expect(getScaleSpy).toHaveBeenCalledWith(elementKit as any, PebScreen.Mobile);

  });

  it('should handle tree control create', () => {

    const treeControl: any = { test: 'tree' };

    component.onCreateTreeControl(treeControl);
    expect(component[`treeControl`]).toEqual(treeControl);

  });

  it('should handle node rename', () => {

    const getShapeAlbumsSpy = spyOn(component, 'getShapeAlbums');
    const node = {
      id: 'album-001',
      name: 'Album 1',
      type: 'test.type',
      parentId: 'parent-001',
    };

    api.patchShapeAlbum.and.returnValue(of(null));

    component.onRenameNode(node);

    expect(api.patchShapeAlbum).toHaveBeenCalledWith(node.id, {
      name: node.name,
      type: node.type,
      parent: node.parentId,
    });
    expect(getShapeAlbumsSpy).toHaveBeenCalled();

  });

  it('should handle create node', () => {

    const node = {
      id: null,
      name: null,
      type: null,
      data: null,
      parentId: 'album-001',
    };
    const parent = {
      id: 'album-001',
      name: 'Album 1',
      children: [node],
    };
    const treeData = [node];
    const getShapeAlbumsSpy = spyOn(component, 'getShapeAlbums');
    const refreshNextSpy = spyOn(component[`refreshSubject$`], 'next');
    const setShapeAlbumIdSpy = spyOnProperty(component, 'shapeAlbumId', 'set');

    spyOnProperty(component, 'treeData').and.returnValue(treeData);

    /**
     * name in argument node is null
     * component.treeDataStore.value is {}
     */
    component.onCreateNode(node);

    expect(treeData).toEqual([]);
    expect(api.postShapeAlbum).not.toHaveBeenCalled();
    expect(getShapeAlbumsSpy).not.toHaveBeenCalled();
    expect(setShapeAlbumIdSpy).not.toHaveBeenCalled();
    expect(refreshNextSpy).not.toHaveBeenCalled();

    /**
     * component.treeDataStore.value is set
     */
    component[`treeDataStore$`].next({
      [parent.id]: parent,
    });
    component.onCreateNode(node);

    expect(parent.children).toEqual([]);
    expect(api.postShapeAlbum).not.toHaveBeenCalled();
    expect(getShapeAlbumsSpy).not.toHaveBeenCalled();
    expect(setShapeAlbumIdSpy).not.toHaveBeenCalled();
    expect(refreshNextSpy).not.toHaveBeenCalled();

    /**
     * name in argument node is set
     * type in argument node is null
     * component.treeDataStore.value is {}
     * api.postShapeAlbum throws error
     */
    api.postShapeAlbum.and.returnValue(throwError('test error'));
    node.name = 'Album 13';
    treeData.push(node);

    component[`treeDataStore$`].next({});
    component.onCreateNode(node);

    expect(api.postShapeAlbum).toHaveBeenCalledWith({
      name: node.name,
      type: null,
      parent: node.parentId,
    });
    expect(node.id).toBeNull();
    expect(node.data).toBeNull();
    expect(getShapeAlbumsSpy).not.toHaveBeenCalled();
    expect(setShapeAlbumIdSpy).not.toHaveBeenCalled();
    expect(snackbarService.toggle).toHaveBeenCalledWith(true, {
      content: `Cannot add album with name "${node.name}"`,
      duration: 2000,
    });
    expect(treeData).toEqual([]);
    expect(refreshNextSpy).toHaveBeenCalled();

    /**
     * type in argument node is set
     * component.treeDataStore.value is set
     */
    node.type = 'node.type';
    parent.children.push(node);

    component[`treeDataStore$`].next({
      [parent.id]: parent,
    });
    component.onCreateNode(node);

    expect(api.postShapeAlbum).toHaveBeenCalledWith({
      name: node.name,
      type: node.type,
      parent: node.parentId,
    });
    expect(getShapeAlbumsSpy).not.toHaveBeenCalled();
    expect(setShapeAlbumIdSpy).not.toHaveBeenCalled();
    expect(parent.children).toEqual([]);
    expect(refreshNextSpy).toHaveBeenCalled();

    /**
     * api.postShapeAlbum returns mocked data
     */
    api.postShapeAlbum.and.returnValue(of({
      ...node,
      id: 'album-013',
    }));
    parent.children.push(node);
    refreshNextSpy.calls.reset();
    snackbarService.toggle.calls.reset();

    component[`treeDataStore$`].next({
      [parent.id]: parent,
      'album-013': node,
    });
    component.onCreateNode(node);
    component[`treeDataSubject$`].next([]);

    expect(node.id).toEqual('album-013');
    expect(node.data).toEqual({
      id: 'album-013',
      name: 'Album 13',
      type: 'node.type',
      data: null,
      parentId: 'album-001',
    });
    expect(getShapeAlbumsSpy).toHaveBeenCalled();
    expect(setShapeAlbumIdSpy).toHaveBeenCalledWith(node.id);
    expect(snackbarService.toggle).not.toHaveBeenCalled();
    expect(refreshNextSpy).not.toHaveBeenCalled();
    expect(parent.children).toEqual([node]);

  });

  it('should handle header click', () => {

    component.onHeaderClick();

    expect().nothing();

  });

  it('should handle scroll bottom', () => {

    const getShapesSpy = spyOn(component, 'getShapes');
    const treeItem = {
      data: {
        id: 'album-001',
        count: 2,
      },
    };
    const event = {
      target: {
        scrollTop: 200,
        scrollHeight: 1200,
        clientHeight: 1000,
      },
    };

    spyOnProperty(component, 'shapeItems').and.returnValue(Array.from(
      { length: 3 },
      (_, index) => ({ id: `shape-00${index}` }),
    ));

    /**
     * component.formGroup.value.tree is null
     */
    component.formGroup.patchValue({ tree: null });
    component.scrollOnBottom(event);

    expect(getShapesSpy).toHaveBeenCalledWith(null, true);

    /**
     * component.formGroup.value.tree is []
     */
    getShapesSpy.calls.reset();

    component.formGroup.patchValue({ tree: [] });
    component.scrollOnBottom(event);

    expect(getShapesSpy).toHaveBeenCalledWith(null, true);

    /**
     * component.formGroup.value.tree is set
     */
    getShapesSpy.calls.reset();

    component.formGroup.patchValue({
      tree: [treeItem],
    });
    component.scrollOnBottom(event);

    expect(getShapesSpy).toHaveBeenCalledWith(treeItem.data.id, true);

    /**
     * album.count is equal to component.shapeItems.length
     */
    treeItem.data.count = 3;
    getShapesSpy.calls.reset();

    component.scrollOnBottom(event);

    expect(getShapesSpy).not.toHaveBeenCalled();

  });

  it('should handle title change', () => {

    const event = {
      target: { value: 'test title' },
    };

    component.newItem = {};
    component.onTitleChange(event);

    expect(component.newItem.title).toEqual(event.target.value);

  });

  it('should handle description change', () => {

    const event = {
      target: { value: 'test desc' },
    };

    component.newItem = {};
    component.onDescriptionChange(event);

    expect(component.newItem.description).toEqual(event.target.value);

  });

  it('should open folder menu', () => {

    const overlayRef = {
      detach: jasmine.createSpy('detach'),
    };
    const openSpy = spyOn<any>(component, 'openMenu').and.returnValue(overlayRef);
    const attachSpy = spyOn<any>(component, 'attachOverlay');
    const getShapesSpy = spyOn(component, 'getShapes');
    const getShapeAlbumsSpy = spyOn(component, 'getShapeAlbums');
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const album = {
      id: 'album-001',
      basic: false,
      application: { id: 'app-001' },
    };
    const event = new MouseEvent('click');
    const buffer = {
      action: 'copy',
      value: {
        id: 'album-013',
        elementKit: { element: { id: 'elem' } },
        title: 'test.title',
        description: 'test.desc',
        album: null,
      },
    };
    let map: WeakMap<InjectionToken<any>, { options: any[] }>;

    api.postShape.and.returnValue(of(null));
    api.patchShape.and.returnValue(of(null));
    api.deleteShapeAlbum.and.returnValue(of(null));
    spyOnProperty(component, 'shapeAlbumId').and.returnValue('album-013');
    attachSpy.and.callFake((_, weakMap: typeof map) => map = weakMap);

    /**
     * component.albumDictById$.value is {}
     */
    component.albumDictById$.next({});
    component.openFolderMenu(event, album.id);

    expect(openSpy).toHaveBeenCalledWith(event);
    expect(attachSpy).not.toHaveBeenCalled();

    /**
     * component.albumDictById$.valus is set
     * component.buffer.action is 'copy'
     */
    component.albumDictById$.next({
      [album.id]: album,
    } as any);
    component[`buffer`] = buffer;
    component.openFolderMenu(event, album.id);

    expect(attachSpy).toHaveBeenCalled();
    expect(attachSpy.calls.mostRecent().args[0]).toEqual(overlayRef);
    const { options } = map.get(SHAPES_CONTEXT_DATA);
    expect(options.length).toBe(2);

    /**
     * test paste option
     * component.buffer.action is 'copy'
     */
    const pasteOption = options.find(o => o.title === 'Paste');
    pasteOption.onClick();

    expect(api.postShape).toHaveBeenCalledWith({
      ...pick(buffer.value, ['elementKit', 'title', 'description']),
      album: album.id,
    } as any);
    expect(getShapesSpy).toHaveBeenCalledWith('album-013');
    expect(overlayRef.detach).toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();
    expect(api.patchShape).not.toHaveBeenCalled();
    expect(api.deleteShapeAlbum).not.toHaveBeenCalled();
    expect(getShapeAlbumsSpy).not.toHaveBeenCalled();

    /**
     * component.buffer.action is 'move'
     */
    api.postShape.calls.reset();
    getShapesSpy.calls.reset();
    markSpy.calls.reset();
    overlayRef.detach.calls.reset();
    buffer.action = 'move';
    pasteOption.onClick();

    expect(api.patchShape).toHaveBeenCalledWith(
      buffer.value.id,
      { album: album.id },
    );
    expect(buffer.value.album).toEqual(album.id);
    expect(component[`buffer`]).toBeNull();
    expect(getShapesSpy).toHaveBeenCalledWith('album-013');
    expect(overlayRef.detach).toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();
    expect(api.postShape).not.toHaveBeenCalled();
    expect(api.deleteShapeAlbum).not.toHaveBeenCalled();
    expect(getShapeAlbumsSpy).not.toHaveBeenCalled();

    /**
     * test delete option
     */
    api.patchShape.calls.reset();
    getShapesSpy.calls.reset();
    markSpy.calls.reset();
    overlayRef.detach.calls.reset();

    const deleteOption = options.find(o => o.title === 'Delete');
    deleteOption.onClick();

    expect(api.deleteShapeAlbum).toHaveBeenCalledWith(album.id);
    expect(getShapeAlbumsSpy).toHaveBeenCalled();
    expect(overlayRef.detach).toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();
    expect(api.postShape).not.toHaveBeenCalled();
    expect(api.patchShape).not.toHaveBeenCalled();
    expect(getShapesSpy).not.toHaveBeenCalled();

    /**
     * component.buffer.action is 'move'
     */
    component[`buffer`] = buffer;
    component.openFolderMenu(event, album.id);

    expect(map.get(SHAPES_CONTEXT_DATA).options[0].title).toEqual('Move here');

  });

  it('should open shape menu', () => {

    const overlayRef = {
      detach: jasmine.createSpy('detach'),
    };
    const openSpy = spyOn<any>(component, 'openMenu').and.returnValue(overlayRef);
    const getShapesSpy = spyOn(component, 'getShapes');
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const attachSpy = spyOn<any>(component, 'attachOverlay');
    const shape = {
      id: 'shape-001',
      basic: false,
    };
    const event = new MouseEvent('click');
    const item = {
      id: shape.id,
      data: { shape },
    };
    let map: WeakMap<InjectionToken<any>, { options: any[] }>;

    api.deleteShape.and.returnValue(of(null));
    attachSpy.and.callFake((_, weakMap: typeof map) => map = weakMap);
    spyOnProperty(component, 'shapeAlbumId').and.returnValue('album-013');

    /**
     * item.data.shape is null
     */
    component.openShapeMenu(event, { data: { shape: null } });

    expect(openSpy).not.toHaveBeenCalled();
    expect(attachSpy).not.toHaveBeenCalled();
    expect(component[`buffer`]).toBeUndefined();

    /**
     * item.data.shape is set
     */
    component.openShapeMenu(event, item);

    expect(openSpy).toHaveBeenCalledWith(event);
    expect(attachSpy).toHaveBeenCalled();
    expect(attachSpy.calls.mostRecent().args[0]).toEqual(overlayRef);
    const { options } = map.get(SHAPES_CONTEXT_DATA);
    expect(options.length).toBe(3);

    /**
     * test copy option
     */
    const copyOption = options.find(o => o.title === 'Copy');
    copyOption.onClick();

    expect(component[`buffer`]).toEqual({
      action: 'copy',
      value: shape,
    });
    expect(overlayRef.detach).toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();
    expect(api.deleteShape).not.toHaveBeenCalled();
    expect(getShapesSpy).not.toHaveBeenCalled();

    /**
     * test move option
     */
    component[`buffer`] = null;
    overlayRef.detach.calls.reset();
    markSpy.calls.reset();

    const moveOption = options.find(o => o.title === 'Move to');
    moveOption.onClick();

    expect(component[`buffer`]).toEqual({
      action: 'move',
      value: shape,
    });
    expect(overlayRef.detach).toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();
    expect(api.deleteShape).not.toHaveBeenCalled();
    expect(getShapesSpy).not.toHaveBeenCalled();

    /**
     * test delete option
     */
    component[`buffer`] = null;
    overlayRef.detach.calls.reset();
    markSpy.calls.reset();

    const deleteOption = options.find(o => o.title === 'Delete');
    deleteOption.onClick();

    expect(api.deleteShape).toHaveBeenCalledWith(item.id);
    expect(getShapesSpy).toHaveBeenCalledWith('album-013');
    expect(overlayRef.detach).toHaveBeenCalled();
    expect(markSpy).toHaveBeenCalled();

  });

  it('should handle node context menu', () => {

    const event = new MouseEvent('click');
    const node: any = { id: 'album-001' };
    const openSpy = spyOn(component, 'openFolderMenu');

    component.nodeContextMenu({ event, node });

    expect(openSpy).toHaveBeenCalledWith(event, node.id);

  });

  it('should handle grid context menu', () => {

    const openSpy = spyOn(component, 'openFolderMenu');
    const event = {
      composedPath: jasmine.createSpy('composedPath').and.returnValue([]),
    };
    const elem = document.createElement('div');
    const treeItem = { id: 'album-001' };

    /**
     * event.composedPath returns []
     */
    component.gridContextMenu(event as any);

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * event.composedPath returns mocked data
     * el.id is undefined
     * el.classList does not contain 'scrollbar'
     */
    event.composedPath.and.returnValue([elem]);

    component.gridContextMenu(event as any);

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * el.classList contains 'scrollbar'
     * component.formGroup.value.tree is null
     */
    elem.classList.add('scrollbar');

    component.formGroup.patchValue({ tree: null });
    component.gridContextMenu(event as any);

    expect(openSpy).toHaveBeenCalledWith(event as any, null);

    /**
     * component.formGroup.value.tree is set
     */
    component.formGroup.patchValue({ tree: [treeItem] });
    component.gridContextMenu(event as any);

    expect(openSpy).toHaveBeenCalledWith(event as any, treeItem.id);

  });

  it('should open menu', () => {

    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
    };
    const backdrop$ = new Subject<void>();
    const overlayRef = {
      backdropClick: jasmine.createSpy('backdropClick').and.returnValue(backdrop$),
      detach: jasmine.createSpy('detach'),
    };

    overlay.create.and.returnValue(overlayRef as any);

    expect(component[`openMenu`](event as any)).toEqual(overlayRef as any);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(overlay.create).toHaveBeenCalledWith({
      hasBackdrop: true,
      scrollStrategy: { test: 'scroll.strategy' },
      positionStrategy: { test: 'position.strategy' },
    } as any);
    expect(overlay.position).toHaveBeenCalled();
    expect(overlayRef.backdropClick).toHaveBeenCalled();
    expect(overlayRef.detach).not.toHaveBeenCalled();

    backdrop$.next();
    expect(overlayRef.detach).toHaveBeenCalled();

  });

  it('should attach overlay', () => {

    const cmp = {
      instance: {
        onClose: new Subject<void>(),
      },
    };
    const overlayRef = {
      attach: jasmine.createSpy('attach').and.returnValue(cmp),
      detach: jasmine.createSpy('detach'),
    };
    const overlayData = new WeakMap([
      [{ test: 'value' }, 'test'],
    ]);

    component[`attachOverlay`](overlayRef as any, overlayData);

    expect(overlayRef.attach).toHaveBeenCalled();
    expect(overlayRef.detach).not.toHaveBeenCalled();

    cmp.instance.onClose.next();
    expect(overlayRef.detach).toHaveBeenCalled();

  });

});
