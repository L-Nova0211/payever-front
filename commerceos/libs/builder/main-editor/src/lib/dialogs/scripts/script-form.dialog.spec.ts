import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { clone } from 'lodash';
import { of } from 'rxjs';

import * as pebCore from '@pe/builder-core';
import { DEFAULT_TRIGGER_POINT, PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';
import { PebEditorStore } from '@pe/builder-services';

import { PebEditorScriptFormDialog } from './script-form.dialog';

describe('PebEditorScriptFormDialog', () => {

  let fixture: ComponentFixture<PebEditorScriptFormDialog>;
  let component: PebEditorScriptFormDialog;
  let dialogRef: { close: jasmine.Spy };
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let generateIdSpy: jasmine.Spy;
  let envService: PebEnvService;

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');

    dialogRef = { close: jasmine.createSpy('close') };

    const editorStoreMock = {
      page: null,
      snapshot: {
        application: {
          data: {
            test: 'app data',
            scripts: null,
          },
        },
        pages: [
          {
            id: 'p-001',
            name: 'First',
            data: null,
          },
          {
            id: 'p-002',
            name: 'Second',
            data: null,
          },
        ],
      },
      updateShop: jasmine.createSpy('updateShop'),
      updatePage: jasmine.createSpy('updatePage'),
    };

    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [PebEditorScriptFormDialog],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: PebEnvService, useValue: { businessData: null } },
        { provide: PebEditorStore, useValue: editorStoreMock },
        { provide: MatDialog, useValue: dialogSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorScriptFormDialog);
      component = fixture.componentInstance;

      envService = TestBed.inject(PebEnvService);
      editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
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
    fixture = TestBed.createComponent(PebEditorScriptFormDialog);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.default);

    /**
     * component.envService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null } as any;

    fixture = TestBed.createComponent(PebEditorScriptFormDialog);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.default);

    /**
     * component.envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: AppThemeEnum.light };

    fixture = TestBed.createComponent(PebEditorScriptFormDialog);
    component = fixture.componentInstance;

    expect(component.theming).toEqual(AppThemeEnum.light);

  });

  it('shuld create form on construct', () => {

    expect(component.form).toBeDefined();
    expect(component.form.value).toEqual({
      id: 'gid-001',
      name: '',
      content: '',
      page: '',
      triggerPoint: '',
    });
    expect(generateIdSpy).toHaveBeenCalled();

  });

  it('should set page options on construct', () => {

    expect(component.pageOptions).toEqual([
      { name: 'Global', value: '' },
      { name: 'Page: "First"', value: 'p-001' },
      { name: 'Page: "Second"', value: 'p-002' },
    ]);

  });

  it('should handle ng init', () => {

    const dataMock = {
      script: {
        name: 'Script 1',
        content: 'console.log("test")',
      },
      page: null,
    };

    /**
     * component.data is null
     * editorStore.page is null
     */
    component.ngOnInit();

    expect(component.form.value).toEqual({
      id: 'gid-001',
      name: '',
      content: '',
      page: '',
      triggerPoint: DEFAULT_TRIGGER_POINT,
    });

    /**
     * component.data is set
     * data.page is null
     * editorStore.page is set
     */
    editorStore[`page` as any] = { id: 'p-013' };
    component.data = dataMock as any;
    component.ngOnInit();

    expect(component.form.value).toEqual({
      id: 'gid-001',
      name: dataMock.script.name,
      content: dataMock.script.content,
      page: editorStore.page.id,
      triggerPoint: DEFAULT_TRIGGER_POINT,
    });

    /**
     * data.page is set
     */
    dataMock.page = 'p-007';
    component.ngOnInit();

    expect(component.form.value).toEqual({
      id: 'gid-001',
      name: dataMock.script.name,
      content: dataMock.script.content,
      page: dataMock.page,
      triggerPoint: DEFAULT_TRIGGER_POINT,
    });

  });

  it('should submit form', () => {

    const confirmDialogRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(null)),
    };
    const tplMock: any = { test: 'confirmDialogTpl' };

    dialog.open.and.returnValue(confirmDialogRef as any);

    /**
     * argument emit is TRUE
     * component.form is INVALID
     */
    component.confirmDialogTpl = tplMock;
    component.submitForm(true);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();

    /**
     * component.form is VALID
     */
    component.form.patchValue({
      name: 'Script 1',
      content: 'console.log("test")',
      page: 'p-001',
    });
    component.submitForm(true);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(component.form.value);

    /**
     * argument emit is FALSE as default
     * this.confirmDialogRef.afterClosed returns null
     */
    dialogRef.close.calls.reset();

    component.submitForm();

    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(tplMock, {
      panelClass: ['scripts-dialog__panel', AppThemeEnum.default],
      maxWidth: '300px',
    });
    expect(confirmDialogRef.afterClosed).toHaveBeenCalled();
    expect(component.confirmDialogRef).toBeUndefined();

    /**
     * this.confirmDialogRef.afterClosed returns true
     */
    confirmDialogRef.afterClosed.and.returnValue(of(true));

    component.submitForm();

    expect(dialogRef.close).toHaveBeenCalled();

  });

  it('should remove script', () => {

    const pageMock = editorStore.snapshot.pages[0];
    const dataMock = { page: pageMock.id };
    const scriptsMock = [
      { id: 'gid-001', name: 'Script 1', content: 'console.log(1)' },
      { id: 'gid-002', name: 'Script 2', content: 'console.log(2)' },
    ];

    editorStore.updateShop.and.returnValue(of(null));
    editorStore.updatePage.and.returnValue(of(null));

    /**
     * component.data is null
     * editorStore.snapshot.application.data.scripts is null
     */
    component.removeScript();

    expect(editorStore.updateShop).toHaveBeenCalledWith({
      test: 'app data',
      scripts: [],
    } as any);
    expect(editorStore.updatePage).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();

    /**
     * editorStore.snapshot.application.data.scripts is set
     */
    editorStore.snapshot.application.data.scripts = clone(scriptsMock) as any;

    component.removeScript();

    expect(editorStore.updateShop).toHaveBeenCalledWith({
      test: 'app data',
      scripts: [scriptsMock[1]],
    } as any);
    expect(editorStore.updatePage).not.toHaveBeenCalled();

    /**
     * component.data is set
     * page.data is null
     */
    editorStore.updateShop.calls.reset();

    component.data = dataMock;
    component.removeScript();

    expect(editorStore.updatePage).toHaveBeenCalledWith(pageMock, {
      data: {
        scripts: [],
      },
    });
    expect(editorStore.updateShop).not.toHaveBeenCalled();

    /**
     * page.data.scripts is set
     */
    pageMock.data = { scripts: clone(scriptsMock) } as any;

    component.removeScript();

    expect(editorStore.updatePage).toHaveBeenCalledWith(pageMock, {
      data: {
        scripts: [scriptsMock[1]],
      },
    });
    expect(editorStore.updateShop).not.toHaveBeenCalled();

  });

});
