import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { omit } from 'lodash';
import { BehaviorSubject, of } from 'rxjs';

import * as pebCore from '@pe/builder-core';
import {
  DEFAULT_TRIGGER_POINT,
  PebEffectTarget,
  PebEnvService,
  PebPageEffect,
  PebScript,
  PebScriptTrigger,
  PebShopEffect,
} from '@pe/builder-core';

import { EditorIcons } from '../../editor-icons';

import { PebEditorScriptFormDialog } from './script-form.dialog';
import { PebEditorScriptsDialog } from './scripts.dialog';
import { PebEditorStore } from '@pe/builder-services';
import { AppThemeEnum } from '@pe/common';

describe('PebEditorScriptsDialog', () => {

  let fixture: ComponentFixture<PebEditorScriptsDialog>;
  let component: PebEditorScriptsDialog;
  let dialogRef: { close: jasmine.Spy };
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let iconRegistry: jasmine.SpyObj<MatIconRegistry>;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let envService: PebEnvService;
  let snapshotSubject: BehaviorSubject<any>;

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    dialogRef = {
      close: jasmine.createSpy('close'),
    };

    snapshotSubject = new BehaviorSubject({
      application: {
        data: null,
      },
      pages: [],
    });
    const editorStoreMock = {
      snapshot$: snapshotSubject,
      snapshot: {
        application: {
          data: {
            test: 'app data',
            scripts: null,
          },
        },
        pages: [],
      },
      commitAction: jasmine.createSpy('commitAction'),
      updateShop: jasmine.createSpy('updateShop').and.returnValue(of(null)),
      updatePage: jasmine.createSpy('updatePage').and.returnValue(of(null)),
    };

    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    const iconRegistrySpy = jasmine.createSpyObj<MatIconRegistry>('MatIconRegistry', ['addSvgIcon']);

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    sanitizerSpy.bypassSecurityTrustResourceUrl.and.callFake((value: string) => `${value}.bypassed`);

    TestBed.configureTestingModule({
      declarations: [PebEditorScriptsDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: PebEnvService, useValue: { businessData: null } },
        { provide: PebEditorStore, useValue: editorStoreMock },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatIconRegistry, useValue: iconRegistrySpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorScriptsDialog);
      component = fixture.componentInstance;

      envService = TestBed.inject(PebEnvService);
      editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
      iconRegistry = TestBed.inject(MatIconRegistry) as jasmine.SpyObj<MatIconRegistry>;
      sanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
      dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

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
    fixture = TestBed.createComponent(PebEditorScriptsDialog);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.default);

    /**
     * component.envService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null } as any;

    fixture = TestBed.createComponent(PebEditorScriptsDialog);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.default);

    /**
     * component.envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: AppThemeEnum.light };

    fixture = TestBed.createComponent(PebEditorScriptsDialog);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.light);

  });

  it('should add icons on construct', () => {

    expect(iconRegistry.addSvgIcon.calls.allArgs())
      .toEqual(Object.entries(EditorIcons).map(([name, path]) => {
        return [name, `assets/icons/${path}.bypassed`];
      }));
    expect(sanitizer.bypassSecurityTrustResourceUrl.calls.allArgs())
      .toEqual(Object.values(EditorIcons).map(path => [`assets/icons/${path}`]));

  });

  it('should set pagesScripts$ on construct', () => {

    const scriptsMock = [
      {
        id: 's-001',
        name: 'Script 1',
        content: 'console.log(1)',
        enabled: true,
      },
      {
        id: 's-002',
        name: 'Script 2',
        content: 'console.log(2)',
        enabled: false,
      },
    ];
    const pagesMock = [
      {
        id: 'p-001',
        name: 'Page 1',
        data: null,
      },
      {
        id: 'p-002',
        name: 'Page 2',
        data: {
          scripts: [{
            id: 's-003',
            name: 'Script 3',
            content: 'console.log(3)',
            enabled: true,
          }],
        },
      },
    ];

    /**
     * editorStore.snapshot$.application.data is null
     * editorStore.snapshot$.pages is []
     */
    component.pagesScripts$.subscribe(scripts => expect(scripts).toEqual([])).unsubscribe();

    /**
     * editorStore.snapshot$.application.data is set
     * editorStore.snapshot$.pages is set
     */
    snapshotSubject.next({
      application: {
        data: {
          scripts: scriptsMock,
        },
      },
      pages: pagesMock,
    });
    component.pagesScripts$.subscribe(scripts => expect(scripts).toEqual([
      {
        id: '',
        name: 'Global',
        scripts: scriptsMock,
      },
      {
        id: 'p-002',
        name: 'Page 2',
        scripts: pagesMock[1].data.scripts,
      },
    ] as any)).unsubscribe();

  });

  it('should handle ng after view init', fakeAsync(() => {

    expect(component.disableAnimation).toBe(true);
    component.ngAfterViewInit();

    tick();

    expect(component.disableAnimation).toBe(false);

  }));

  it('should open script', () => {

    const formValue = {
      id: 's-003',
      name: 'Script 3',
      content: 'console.log(3)',
      page: 'p-001',
      enabled: false,
      triggerPoint: DEFAULT_TRIGGER_POINT,
    };
    const scriptDialog = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(formValue)),
    };
    const scriptsMock: PebScript[] = [
      {
        id: 's-001',
        name: 'Script 1',
        content: 'console.log(1)',
        enabled: false,
        triggerPoint: PebScriptTrigger.PageView,
      },
      {
        id: 's-002',
        name: 'Script 2',
        content: 'console.log(2)',
        enabled: true,
        triggerPoint: PebScriptTrigger.PageView,
      },
    ];
    const script = scriptsMock[0];
    const pageMock = {
      id: 'p-001',
      name: 'Page 1',
      data: {
        scripts: null,
      },
    };
    const removeEffect = {
      type: PebShopEffect.UpdateData,
      target: PebEffectTarget.Shop,
      payload: {
        scripts: [],
      },
    };
    const openSpy = spyOn(component, 'openScriptFormDialog').and.returnValue(scriptDialog as any);
    const removeSpy = spyOn<any>(component, 'removePreviousScriptEffect').and.returnValue(removeEffect);
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');

    editorStore.commitAction.and.returnValue(of(null));

    /**
     * argument is {} as default
     * editorStore.snapshot.application.data.scripts is null
     */
    component.openScript();

    expect(openSpy).toHaveBeenCalledWith({
      script: null,
      pageId: '',
    });
    expect(scriptDialog.afterClosed).toHaveBeenCalled();
    expect(generateIdSpy).toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(editorStore.commitAction).toHaveBeenCalled();
    expect(omit(editorStore.commitAction.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: [],
      effects: [{
        type: PebShopEffect.UpdateData,
        target: PebEffectTarget.Shop,
        payload: {
          test: 'app data',
          scripts: [{
            ...omit(formValue, 'page'),
            enabled: true,
            triggerPoint: DEFAULT_TRIGGER_POINT,
          }],
        },
      }],
    });
    expect(editorStore.commitAction.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);

    /**
     * argument script is set
     */
    openSpy.calls.reset();

    component.openScript({ script });

    expect(openSpy).toHaveBeenCalledWith({
      script,
      pageId: '',
    });
    expect(omit(editorStore.commitAction.calls.argsFor(1)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: [],
      effects: [{
        type: PebShopEffect.UpdateData,
        target: PebEffectTarget.Shop,
        payload: {
          test: 'app data',
          scripts: [],
        },
      }],
    });

    /**
     * editorStore.snapshot.application.data.scripts is set
     */
    editorStore.snapshot.application.data.scripts = scriptsMock;
    component.openScript({ script });

    expect(omit(editorStore.commitAction.calls.argsFor(2)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: [],
      effects: [
        {
          type: PebShopEffect.UpdateData,
          target: PebEffectTarget.Shop,
          payload: {
            test: 'app data',
            scripts: [
              omit(formValue, 'page'),
              scriptsMock[1],
            ],
          },
        },
      ],
    });

    /**
     * argument pageId is set
     */
    openSpy.calls.reset();

    component.openScript({ script, pageId: 'p-001' });

    expect(openSpy).toHaveBeenCalledWith({
      script,
      pageId: 'p-001',
    });
    expect(omit(editorStore.commitAction.calls.argsFor(3)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: ['p-001'],
      effects: [
        {
          type: PebShopEffect.UpdateData,
          target: PebEffectTarget.Shop,
          payload: {
            scripts: [],
          },
        },
        {
          type: PebShopEffect.UpdateData,
          target: PebEffectTarget.Shop,
          payload: {
            test: 'app data',
            scripts: [
              ...scriptsMock,
              omit(formValue, 'page'),
            ],
          },
        },
      ],
    });

    /**
     * argument pageId is null
     * editorStore.snapshot.pages is set
     * page.data.scripts is null
     */
    openSpy.calls.reset();
    editorStore.snapshot.pages = [pageMock] as any;

    component.openScript({ script });

    expect(openSpy).toHaveBeenCalledWith({
      script,
      pageId: '',
    });
    expect(omit(editorStore.commitAction.calls.argsFor(4)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: ['p-001'],
      effects: [
        {
          type: PebShopEffect.UpdateData,
          target: PebEffectTarget.Shop,
          payload: {
            scripts: [],
          },
        },
        {
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:${pageMock.id}`,
          payload: {
            data: {
              scripts: [omit(formValue, 'page')],
            },
          },
        },
      ],
    });

    /**
     * argument pageId is set
     */
    openSpy.calls.reset();

    component.openScript({ script, pageId: 'p-001' });

    expect(openSpy).toHaveBeenCalledWith({
      script,
      pageId: 'p-001',
    });
    expect(omit(editorStore.commitAction.calls.argsFor(5)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: ['p-001'],
      effects: [
        {
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:${pageMock.id}`,
          payload: {
            data: {
              scripts: [],
            },
          },
        },
      ],
    });

    /**
     * page.data.scripts is set
     */
    pageMock.data.scripts = scriptsMock;

    component.openScript({ script, pageId: 'p-001' });

    expect(omit(editorStore.commitAction.calls.argsFor(6)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: ['p-001'],
      effects: [
        {
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:${pageMock.id}`,
          payload: {
            data: {
              scripts: [
                omit(formValue, 'page'),
                scriptsMock[1],
              ],
            },
          },
        },
      ],
    });

    /**
     * argument script is null
     */
    openSpy.calls.reset();

    component.openScript({ pageId: 'p-001' });

    expect(openSpy).toHaveBeenCalledWith({
      script: null,
      pageId: 'p-001',
    });
    expect(omit(editorStore.commitAction.calls.argsFor(7)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: ['p-001'],
      effects: [
        {
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:${pageMock.id}`,
          payload: {
            data: {
              scripts: [
                ...scriptsMock,
                {
                  ...omit(formValue, 'page'),
                  enabled: true,
                },
              ],
            },
          },
        },
      ],
    });

  });

  it('should make remove previous script effect', () => {

    const scriptsMock: PebScript[] = [
      {
        id: 's-001',
        name: 'Script 1',
        content: 'console.log(1)',
        enabled: false,
        triggerPoint: PebScriptTrigger.DOMReady,
      },
      {
        id: 's-002',
        name: 'Script 2',
        content: 'console.log(2)',
        enabled: true,
        triggerPoint: PebScriptTrigger.DOMReady,
      },
    ];
    const pageMock = {
      id: 'p-001',
      name: 'Page 1',
      data: null,
    };

    /**
     * editorStore.snapshot.pages is []
     * editorStore.snapshot.application.data.scripts is null
     */
    expect(component[`removePreviousScriptEffect`](scriptsMock[0].id, pageMock.id)).toEqual({
      type: PebShopEffect.UpdateData,
      target: PebEffectTarget.Shop,
      payload: {
        test: 'app data',
        scripts: [],
      },
    });

    /**
     * editorStore.snapshot.application.data.scripts is set
     */
    editorStore.snapshot.application.data.scripts = scriptsMock;

    expect(component[`removePreviousScriptEffect`](scriptsMock[0].id, pageMock.id)).toEqual({
      type: PebShopEffect.UpdateData,
      target: PebEffectTarget.Shop,
      payload: {
        test: 'app data',
        scripts: [scriptsMock[1]],
      },
    });

    /**
     * editorStore.snapshot.pages is set
     * page.data is null
     */
    editorStore.snapshot.pages.push(pageMock as any);

    expect(component[`removePreviousScriptEffect`](scriptsMock[0].id, pageMock.id)).toEqual({
      type: PebPageEffect.Update,
      target: `${PebEffectTarget.Pages}:${pageMock.id}`,
      payload: {
        data: {
          scripts: [],
        },
      },
    });

    /**
     * page.data.scripts is set
     */
    pageMock.data = { scripts: scriptsMock };

    expect(component[`removePreviousScriptEffect`](scriptsMock[0].id, pageMock.id)).toEqual({
      type: PebPageEffect.Update,
      target: `${PebEffectTarget.Pages}:${pageMock.id}`,
      payload: {
        data: {
          scripts: [scriptsMock[1]],
        },
      },
    });

  });

  it('should open script form dialog', () => {

    const script: any = { id: 's-001' };
    const pageId = 'p-001';

    /**
     * argument is {} as default
     */
    component.openScriptFormDialog();

    expect(dialog.open).toHaveBeenCalledWith(PebEditorScriptFormDialog, {
      data: {
        script: null,
        page: '',
      },
      panelClass: ['script-dialog__panel', AppThemeEnum.default],
      width: '436px',
      disableClose: true,
    });

    /**
     * arguments script & pageId are set
     */
    component.openScriptFormDialog({ script, pageId });

    expect(dialog.open).toHaveBeenCalledWith(PebEditorScriptFormDialog, {
      data: {
        script,
        page: pageId,
      },
      panelClass: ['script-dialog__panel', AppThemeEnum.default],
      width: '436px',
      disableClose: true,
    });

  });

  it('should toggle script', () => {

    const scriptsMock: PebScript[] = [
      {
        id: 's-001',
        name: 'Script 1',
        content: 'console.log(1)',
        enabled: false,
        triggerPoint: PebScriptTrigger.DOMReady,
      },
      {
        id: 's-002',
        name: 'Script 2',
        content: 'console.log(2)',
        enabled: true,
        triggerPoint: PebScriptTrigger.DOMReady,
      },
    ];
    const script = scriptsMock[0];
    const pageMock = {
      id: 'p-001',
      name: 'Page 1',
      data: null,
    };

    /**
     * editorStore.snapshot.pages is []
     * editorStore.snapshot.application.data.scripts is null
     */
    component.toggleScript(script, pageMock.id);

    expect(editorStore.updateShop).toHaveBeenCalledWith({
      test: 'app data',
      scripts: [],
    } as any);
    expect(editorStore.updatePage).not.toHaveBeenCalled();

    /**
     * editorStore.snapshot.application.data.scripts is set
     */
    editorStore.snapshot.application.data.scripts = scriptsMock;

    component.toggleScript(script, pageMock.id);

    expect(editorStore.updateShop).toHaveBeenCalledWith({
      test: 'app data',
      scripts: scriptsMock.map((s) => {
        if (s.id === script.id) {
          s.enabled = !s.enabled;
        }

        return s;
      }),
    } as any);
    expect(editorStore.updatePage).not.toHaveBeenCalled();

    /**
     * editorStore.snapshot.pages is set
     * page.data is null
     */
    editorStore.updateShop.calls.reset();
    editorStore.snapshot.pages.push(pageMock as any);

    component.toggleScript(script, pageMock.id);

    expect(editorStore.updatePage).toHaveBeenCalledWith(pageMock as any, {
      data: {
        scripts: [],
      },
    });
    expect(editorStore.updateShop).not.toHaveBeenCalled();

    /**
     * page.data.scripts is set
     */
    pageMock.data = { scripts: scriptsMock };

    component.toggleScript(script, pageMock.id);

    expect(editorStore.updatePage).toHaveBeenCalledWith(pageMock as any, {
      data: {
        scripts: scriptsMock.map((s) => {
          if (s.id === script.id) {
            s.enabled = !s.enabled;
          }

          return s;
        }),
      },
    });
    expect(editorStore.updateShop).not.toHaveBeenCalled();

  });

  it('should close', () => {

    component.close();

    expect(dialogRef.close).toHaveBeenCalled();

  });

  it('should track by id', () => {

    expect(component.trackById(0, null)).toBeUndefined();
    expect(component.trackById(0, { id: 'id-001' })).toEqual('id-001');

  });

});
