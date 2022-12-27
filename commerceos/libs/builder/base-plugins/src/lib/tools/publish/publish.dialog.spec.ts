import { HttpEventType } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { PebEditorApi, PEB_STORAGE_PATH } from '@pe/builder-api';
import { PebPageVariant, PebShopContainer } from '@pe/builder-core';
import { BackgroundActivityService, PebEditorStore, SnackbarErrorService } from '@pe/builder-shared';

import { OVERLAY_DATA } from '../../misc/overlay.data';

import { PebEditorPublishToolDialogComponent } from './publish.dialog';

describe('PebEditorPublishDialogComponent', () => {

  let fixture: ComponentFixture<PebEditorPublishToolDialogComponent>;
  let component: PebEditorPublishToolDialogComponent;
  let api: jasmine.SpyObj<PebEditorApi>;
  let store: jasmine.SpyObj<PebEditorStore>;
  let data: any;
  let versionsMock: {
    id: string;
    name: string;
    published: boolean;
    isActive: boolean;
    createdAt: Date;
  }[];
  let themeMock: {
    id: string;
    name: string;
    picture: string;
  };

  const storagePath = 'url/test/storage';

  beforeEach(waitForAsync(() => {

    data = {
      data: {
        theme$: new Subject(),
        snapshot: {
          application: {
            routing: [],
          },
          pages: [
            { id: 'p-001' },
            { id: 'p-002' },
          ],
        },
        lastActivePages: {
          replica: 'p-002',
        },
        versionUpdatedSubject$: new Subject(),
        updatePagesWithShopRouting: jasmine.createSpy('updatePagesWithShopRouting'),
        openTheme: jasmine.createSpy('openTheme'),
        updateThemeName: jasmine.createSpy('updateThemeName'),
        updateThemePreview: jasmine.createSpy('updateThemePreview'),
      },
      emitter: {
        next: jasmine.createSpy('next'),
      },
    };
    themeMock = {
      id: 'theme-001',
      name: null,
      picture: null,
    };
    versionsMock = [
      {
        id: 'v-001',
        name: '1',
        published: false,
        isActive: false,
        createdAt: new Date(2020, 11, 1, 22, 44, 0),
      },
      {
        id: 'v-002',
        name: 'Version 2',
        published: false,
        isActive: false,
        createdAt: new Date(2020, 11, 3, 10, 23, 56),
      },
    ];

    const apiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', [
      'getShopThemeVersions',
      'activateShopThemeVersion',
      'getShopThemeById',
      'getThemeDetail',
      'publishShopThemeVersion',
      'deleteShopThemeVersion',
      'uploadImageWithProgress',
    ]);

    const backgroundActivityServiceMock = {
      hasActiveTasks$: of(false),
    };

    TestBed.configureTestingModule({
      imports: [MatMenuModule],
      declarations: [PebEditorPublishToolDialogComponent],
      providers: [
        { provide: OVERLAY_DATA, useValue: data },
        { provide: PEB_STORAGE_PATH, useValue: storagePath },
        { provide: PebEditorApi, useValue: apiSpy },
        { provide: BackgroundActivityService, useValue: backgroundActivityServiceMock },
        { provide: SnackbarErrorService, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: PebEditorStore, useValue: data.data },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorPublishToolDialogComponent);
      component = fixture.componentInstance;

      store = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
      api = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set hasActiveBackgroundTasks$ on construct', () => {

    component.hasActiveBackgroundTasks$.subscribe(has => expect(has).toBe(false));

  });

  it('should get activated version id', () => {

    component.activatedVersionId$.pipe(skip(1)).subscribe((id) => {
      expect(id).toEqual('p-013');
    });
    component[`activatedVersionIdSubject$`].next('p-013');

  });

  it('should handle ng init', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const versionsNextSpy = spyOn(component.versions$, 'next').and.callThrough();
    const shopNameNextSpy = spyOn(component.currentShopName$, 'next').and.callThrough();

    api.getShopThemeVersions.and.returnValue(of(versionsMock) as any);

    /**
     * emit editorStore.theme$
     * theme.name & picture are null
     */
    component.shopNameValue = null;
    component.shopPicture = null;
    component.versionName = null;
    component.ngOnInit();

    data.data.theme$.next(themeMock);

    expect(shopNameNextSpy).not.toHaveBeenCalled();
    expect(component.shopNameValue).toBeNull();
    expect(component.shopPicture).toBeNull();
    expect(api.getShopThemeVersions).toHaveBeenCalledWith(themeMock.id);
    expect(versionsNextSpy).toHaveBeenCalledWith(versionsMock as any[]);
    expect(detectSpy).toHaveBeenCalled();
    expect(component.versionName).toEqual('2');

    /**
     * theme.name & picture are set
     */
    themeMock.name = 'Theme 1';
    themeMock.picture = 'theme1.jpg';

    data.data.theme$.next(themeMock);

    expect(component.shopNameValue).toEqual(themeMock.name);
    expect(component.shopPicture).toEqual(`${storagePath}${themeMock.picture}`);
    expect(shopNameNextSpy).toHaveBeenCalledWith(themeMock.name);

  });

  it('should handle create version', () => {

    component.onCreateVersion('test');

    expect(data.emitter.next).toHaveBeenCalledWith({ type: 'publish' });

  });

  it('should get pages payload', () => {

    const activePage = {
      id: 'active',
    };

    /**
     * store.snapshot.pages has a page with variant PebPageVariant.Front
     * argument value is TRUE
     */
    store.snapshot.pages['p-010'] = {
      id: 'p-010',
      variant: PebPageVariant.Front,
    } as any;

    expect(component[`getPagesPayload`](true, activePage as any)).toEqual([
      { id: 'p-010', variant: PebPageVariant.Default },
      { id: 'active', variant: PebPageVariant.Front },
    ]);

    /**
     * store.snapshot.pages does NOT have a page with variant PebPageVariant.Front
     * argument value is FALSE
     */
    delete store.snapshot.pages['p-010'];

    expect(component[`getPagesPayload`](false, null)).toEqual([]);

  });

  it('should get routing payload', () => {

    const pages = [
      {
        id: 'p-001',
        name: 'main page 1',
        variant: PebPageVariant.Front,
      },
      {
        id: 'p-002',
        name: 'inner page 1',
        variant: PebPageVariant.Default,
      },
    ];

    store.snapshot.application.routing = [
      { pageId: 'p-001', routeId: '0', url: 'pages/p-001' },
      { pageId: 'p-002', routeId: '1', url: 'pages/p-002' },
    ];

    expect(component[`getRoutingPayload`](pages)[0].url).toEqual('/');
    expect(component[`getRoutingPayload`](pages)[1].url).toContain('/inner-page-1');

  });

  it('should handle select version', () => {

    const detailsMock = {
      id: 'theme-001',
      pages: [{ id: 'p-001' }],
    };

    api.activateShopThemeVersion.and.returnValue(of({ theme: themeMock }) as any);
    api.getShopThemeById.and.returnValue(of(themeMock) as any);
    api.getThemeDetail.and.returnValue(of(detailsMock) as any);

    component.versions$.next(versionsMock as any[]);
    component.onSelectVersion('v-002');
    data.data.theme$.next(themeMock);

    expect(component.versions$.value[1].isActive).toBe(true);
    expect(api.activateShopThemeVersion).toHaveBeenCalledWith(themeMock.id, 'v-002');

  });

  it('should publish version', () => {

    api.publishShopThemeVersion.and.returnValue(of({ id: 'v-001' }));

    component.versions$.next(versionsMock as any[]);
    component.onPublishVersion('v-001');
    data.data.theme$.next(themeMock);

    expect(api.publishShopThemeVersion).toHaveBeenCalledWith(themeMock.id, 'v-001');
    expect(component.versions$.value[0].published).toBe(true);

  });

  it('should delete version', () => {

    api.deleteShopThemeVersion.and.returnValue(of({ deleted: true }));

    component.versions$.next(versionsMock as any[]);
    component.onDeleteVersion('v-002');
    data.data.theme$.next(themeMock);

    expect(api.deleteShopThemeVersion).toHaveBeenCalledWith(themeMock.id, 'v-002');
    expect(component.versions$.value).toEqual([versionsMock[0]] as any[]);

  });

  it('should change shop name', () => {

    store.updateThemeName.and.returnValue(of(null));

    component.shopNameValue = 'Test';
    component.onChangeShopName();
    data.data.theme$.next(themeMock);

    expect(component.currentShopName$.value).toEqual('Test');
    expect(store.updateThemeName).toHaveBeenCalledWith('Test');

  });

  it('should upload logo', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const event = {
      target: {
        files: [],
      },
    };
    const file = new File(['test.jpg'], 'test.jpg', { type: 'image/jpeg' });
    const uploadEvent$ = new BehaviorSubject<any>({ type: HttpEventType.Sent });

    api.uploadImageWithProgress.and.returnValue(uploadEvent$);
    store.updateThemePreview.and.returnValue(of(null));

    component.uploadProgress = null;
    component.shopPicture = null;
    component.logoFileInput = {
      nativeElement: {
        value: file,
      },
    };

    /**
     * event.target.files is []
     */
    component.onLogoUpload(event as any);

    expect(component.uploadProgress).toBeNull();
    expect(component.shopPicture).toBeNull();
    expect(component.logoFileInput.nativeElement.value).toEqual(file);
    expect(api.uploadImageWithProgress).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();
    expect(store.updateThemePreview).not.toHaveBeenCalled();

    /**
     * event.target.files is set
     * api.uploadImageWithProgress returns event with type HttpEventType.Sent
     */
    event.target.files.push(file);

    component.onLogoUpload(event as any);

    expect(component.logoFileInput.nativeElement.value).toEqual('');
    expect(api.uploadImageWithProgress).toHaveBeenCalledWith(PebShopContainer.Builder, file, true);
    expect(detectSpy).not.toHaveBeenCalled();
    expect(store.updateThemePreview).not.toHaveBeenCalled();

    /**
     * emit event with type HttpEventType.UploadProgress
     */
    uploadEvent$.next({
      type: HttpEventType.UploadProgress,
      loaded: 30,
    });

    expect(detectSpy).toHaveBeenCalledTimes(1);
    expect(component.uploadProgress).toBe(30);
    expect(component.shopPicture).toBeNull();
    expect(component.isLoading).toBe(true);
    expect(store.updateThemePreview).not.toHaveBeenCalled();

    /**
     * emit event with type HttpEventType.Response
     */
    uploadEvent$.next({
      type: HttpEventType.Response,
      body: {
        blobName: 'blob',
      },
    });

    expect(detectSpy).toHaveBeenCalledTimes(2);
    expect(component.isLoading).toBe(false);
    expect(component.uploadProgress).toBe(0);
    expect(component.shopPicture).toEqual(`${storagePath}blob`);
    expect(store.updateThemePreview).toHaveBeenCalledWith('blob');

  });

  it('should handle logo load', () => {

    component.logoEl = {
      nativeElement: {
        width: 100,
        height: 100,
      },
    };
    component.logoWrapperEl = {
      nativeElement: {
        clientWidth: 150,
        clientHeight: 90,
      },
    };

    component.onLogoLoad();

    expect(component.isLargeThenParent).toBe(true);

  });

});
