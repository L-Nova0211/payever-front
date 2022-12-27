import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { MessageBus, PebEditorState, PebEnvService, PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes } from '@pe/builder-services';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import { AppThemeEnum } from '@pe/common';

import { OPTIONS } from '../../constants';

import { PebShopEditorComponent } from './shop-editor.component';

describe('PebShopEditorComponent', () => {

  let fixture: ComponentFixture<PebShopEditorComponent>;
  let component: PebShopEditorComponent;
  let dialog: jasmine.SpyObj<MatDialog>;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let editorApi: jasmine.SpyObj<PebEditorApi>;
  let route: any;
  let state: jasmine.SpyObj<PebEditorState>;
  let envService: jasmine.SpyObj<PebEnvService>;

  const theme = { id: 'theme-001' };
  const snapshot = { id: 'snap-001' };

  beforeEach(waitForAsync(() => {

    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', [
      'listen',
      'emit',
    ]);

    const editorApiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', [
      'getShopThemeById',
      'getSnapshot',
      'getShopActiveTheme',
      'getPage',
    ]);
    editorApiSpy.getShopThemeById.and.returnValue(of(theme) as any);
    editorApiSpy.getSnapshot.and.returnValue(of(snapshot) as any);

    const routeMock = {
      snapshot: {
        params: {
          shopId: 'shop-001',
          themeId: 'theme-001',
        },
      },
    };

    const stateMock = {
      sidebarsActivity$: of({
        [EditorSidebarTypes.Navigator]: true,
        [EditorSidebarTypes.Inspector]: true,
        [EditorSidebarTypes.Layers]: true,
      }),
      sidebarsActivity: {
        [EditorSidebarTypes.Navigator]: true,
        [EditorSidebarTypes.Inspector]: true,
        [EditorSidebarTypes.Layers]: true,
      },
      pagesView$: of(PebPageType.Master),
    };

    const envServiceMock = {
      businessData: undefined,
    };

    TestBed.configureTestingModule({
      declarations: [
        PebShopEditorComponent,
      ],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: PebEditorApi, useValue: editorApiSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEnvService, useValue: envServiceMock },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebShopEditorComponent);
      component = fixture.componentInstance;

      dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      editorApi = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;
      route = TestBed.inject(ActivatedRoute);
      state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;
      envService = TestBed.inject(PebEnvService);

      messageBus.listen.and.returnValue(of(EditorSidebarTypes.Layers));

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    // w/o businessData
    expect(component).toBeDefined();
    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/o businessData.themeSettings
    envService.businessData = {
      themeSettings: undefined,
    } as any;

    component = new PebShopEditorComponent(
      dialog,
      messageBus,
      editorApi,
      route,
      state,
      envService,
    );

    expect(component.theme).toEqual(AppThemeEnum.default);

    // w/ themeSettings
    envService.businessData.themeSettings = {
      theme: AppThemeEnum.light,
    };

    component = new PebShopEditorComponent(
      dialog,
      messageBus,
      editorApi,
      route,
      state,
      envService,
    );

    expect(component.theme).toEqual(AppThemeEnum.light);

  });

  it('should get data$', () => {

    // w/ themeId
    component.data$.subscribe(result => expect(result).toEqual({ theme, snapshot } as any)).unsubscribe();

    expect(editorApi.getShopThemeById).toHaveBeenCalled();
    expect(editorApi.getSnapshot).toHaveBeenCalled();
    expect(editorApi.getShopActiveTheme).not.toHaveBeenCalled();

    // w/o themeId
    // w/o error
    route.snapshot.params.themeId = undefined;
    editorApi.getShopActiveTheme.and.returnValue(of(theme) as any);

    component = new PebShopEditorComponent(
      dialog,
      messageBus,
      editorApi,
      route,
      state,
      envService,
    );

    component.data$.subscribe(result => expect(result).toEqual({ theme, snapshot } as any)).unsubscribe();

    // w/ error
    editorApi.getShopActiveTheme.and.returnValue(throwError('test error'));

    component = new PebShopEditorComponent(
      dialog,
      messageBus,
      editorApi,
      route,
      state,
      envService,
    );

    component.data$.subscribe(result => expect(result).toEqual({ theme, snapshot } as any)).unsubscribe();

  });

  it('should set options active on init', () => {

    const setValueSpy = spyOn(component, 'setValue');

    state.pagesView$ = of(PebPageType.Replica);

    component.ngOnInit();

    expect(messageBus.emit).toHaveBeenCalledWith('shop.builder.init', {
      shop: 'shop-001',
      theme: 'theme-001',
    });
    expect(setValueSpy).toHaveBeenCalledWith(EditorSidebarTypes.Layers);
    OPTIONS.forEach((option) => {
      if (!['edit-master-pages', 'preview'].includes(option.option)) {
        expect(option.active).toBe(true);
      }
    });
    expect(document.body.classList).toContain('pe-builder-styles');

  });

  it('should remove class from body on destroy', () => {

    component.ngOnInit();

    expect(document.body.classList).toContain('pe-builder-styles');

    component.ngOnDestroy();

    expect(document.body.classList).not.toContain('pe-builder-styles');

  });

  it('should set value', () => {

    const value = ShopEditorSidebarTypes.EditMasterPages;
    const openSpy = spyOn<any>(component, 'onOpenPreview');

    // value = prview
    component.setValue('preview');

    expect(openSpy).toHaveBeenCalledWith(theme.id);

    // pagesView = replica
    state.pagesView = PebPageType.Replica;

    component.setValue(value);

    expect(state.pagesView).toEqual(PebPageType.Master);

    // pagesView = master
    state.pagesView = PebPageType.Master;

    component.setValue(value);

    expect(state.pagesView).toEqual(PebPageType.Replica);

    // options.disabled = FALSE
    // pagesView is the same
    OPTIONS.find(option => option.option === value).disabled = true;

    component.setValue(value);

    expect(state.pagesView).toEqual(PebPageType.Replica);

  });

  it('should handle open preview', () => {

    const snapshot = {
      id: 'snap-001',
      pages: [{ id: 'p-001' }],
    };
    const page = { id: 'p-001' };

    editorApi.getSnapshot.and.returnValue(of(snapshot) as any);
    editorApi.getPage.and.returnValue(of(page) as any);

    component[`onOpenPreview`](theme.id);

    expect(editorApi.getSnapshot).toHaveBeenCalledWith(theme.id);
    expect(editorApi.getPage).toHaveBeenCalledWith(theme.id, page.id);
    expect(dialog.open).toHaveBeenCalledWith(
      PebViewerPreviewDialog,
      {
        position: {
          top: '0',
          left: '0',
        },
        height: '100vh',
        maxWidth: '100vw',
        width: '100vw',
        panelClass: 'themes-preview-dialog',
        data: {
          themeSnapshot: {
            snapshot,
            pages: [page],
          },
        },
      },
    );

  });

});
