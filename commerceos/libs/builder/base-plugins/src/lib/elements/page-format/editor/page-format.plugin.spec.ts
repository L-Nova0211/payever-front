import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { PebMediaService } from '@pe/builder-core';
import { PebEditorAccessorService, PebEditorRenderer, PebEditorStore, SnackbarErrorService } from '@pe/builder-shared';
import { SnackbarService } from '@pe/snackbar';

import { PebEditorPageFormatPlugin } from './page-format.plugin';

describe('PebEditorPageFormatPlugin', () => {

  let plugin: PebEditorPageFormatPlugin;
  let renderer: jasmine.SpyObj<PebEditorRenderer>;
  let editorStore: {
    page$: Subject<any>;
    page: any;
    snapshot: {
      application: any;
    };
  };

  beforeEach(() => {

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', ['getElementComponent'], {
      rendered: of(null),
    });

    editorStore = {
      page$: new Subject(),
      page: { id: 'p-001' },
      snapshot: {
        application: { id: 'app-001' },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        PebEditorPageFormatPlugin,
        FormBuilder,
        { provide: PebEditorAccessorService, useValue: {} },
        { provide: PebEditorRenderer, useValue: rendererSpy },
        { provide: PebEditorStore, useValue: editorStore },
        { provide: SnackbarService, useValue: {} },
        { provide: SnackbarErrorService, useValue: {} },
        { provide: PebEditorApi, useValue: {} },
        { provide: PebMediaService, useValue: {} },
        { provide: 'PEB_ENTITY_NAME', useValue: 'entity' },
      ],
    });

    plugin = TestBed.inject(PebEditorPageFormatPlugin);
    renderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should call all funcs after global init', () => {

    const sidebarRef = { test: 'sidebar.ref' };
    const activePage = {
      id: 'p-001',
      template: { id: 'tpl-001' },
    };
    const initBGSpy = spyOn<any>(plugin, 'initBackgroundForm');
    const initVideoSpy = spyOn<any>(plugin, 'initVideoForm');
    const initSidebarSpy = spyOn<any>(plugin, 'initSidebar').and.returnValue(sidebarRef);
    const handleBGSpy = spyOn<any>(plugin, 'handleBackgroundForm').and.returnValue(throwError('test error'));
    const handleVideoSpy = spyOn<any>(plugin, 'handleVideoForm').and.returnValue(throwError('test error'));
    const errorSpy = spyOn(console, 'error');

    renderer.getElementComponent.and.returnValue(activePage.template as any);

    plugin.afterGlobalInit().subscribe();

    /**
     * emit active page
     */
    editorStore.page$.next(activePage);

    expect(renderer.getElementComponent).toHaveBeenCalledWith(activePage.template.id);
    expect(initBGSpy).not.toHaveBeenCalled();
    expect(initVideoSpy).not.toHaveBeenCalled();
    expect(initSidebarSpy).not.toHaveBeenCalled();
    expect(handleBGSpy).not.toHaveBeenCalled();
    expect(handleVideoSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * emit changed active page
     */
    activePage.id = 'p-001';
    editorStore.page$.next(activePage);

    expect(initBGSpy).toHaveBeenCalledWith(activePage.template);
    expect(initVideoSpy).toHaveBeenCalledWith(activePage.template);
    expect(initSidebarSpy).toHaveBeenCalledWith(activePage.template, {
      application: editorStore.snapshot.application,
      page: editorStore.page,
    });
    expect(handleBGSpy).toHaveBeenCalledWith(activePage.template, sidebarRef);
    expect(handleVideoSpy).toHaveBeenCalledWith(activePage.template, sidebarRef);
    expect(errorSpy).toHaveBeenCalledWith('test error');

  });

});
