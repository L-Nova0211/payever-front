import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import { PebEditorState, PebMediaService } from '@pe/builder-core';
import { PebEditorAccessorService, PebEditorRenderer, PebEditorStore, SnackbarErrorService } from '@pe/builder-shared';
import { SnackbarService } from '@pe/snackbar';

import { PebEditorTextPlugin } from './text.plugin';

describe('PebEditorTextPlugin', () => {

  let plugin: PebEditorTextPlugin;
  let state: jasmine.SpyObj<PebEditorState>;
  let logger: { log: jasmine.Spy; };

  beforeEach(() => {

    const editorStoreSpy = jasmine.createSpyObj<PebEditorStore>('PebEditorStore', {
      updateElement: of(null),
    });

    logger = {
      log: jasmine.createSpy('log'),
    };

    TestBed.configureTestingModule({
      providers: [
        PebEditorTextPlugin,
        FormBuilder,
        { provide: PebEditorAccessorService, useValue: {} },
        { provide: PebEditorRenderer, useValue: {} },
        { provide: PebEditorStore, useValue: editorStoreSpy },
        { provide: SnackbarService, useValue: {} },
        { provide: SnackbarErrorService, useValue: {} },
        { provide: PebEditorApi, useValue: {} },
        { provide: PebMediaService, useValue: {} },
        { provide: 'PEB_ENTITY_NAME', useValue: 'test.entity' },
      ],
    });

    plugin = TestBed.inject(PebEditorTextPlugin);
    state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;

    plugin.logger = logger;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should handle after global init', () => {

    const elCmp = {
      definition: { id: 'elem' },
    };
    const sidebarRef = { test: 'sidebar' };
    const ngZone = {
      onStable: of(true),
    };
    const singleSelectedSpy = spyOn<any>(plugin, 'singleElementOfTypeSelected')
      .and.returnValue(of(elCmp));
    const initSidebarSpy = spyOn<any>(plugin, 'initSidebar').and.returnValue(sidebarRef);
    const spies = {
      initElementForms: spyOn<any>(plugin, 'initElementForms'),
      initAlignmentForm: spyOn<any>(plugin, 'initAlignmentForm'),
      handleAlignmentForm: spyOn<any>(plugin, 'handleAlignmentForm').and.returnValue(of(null)),
      handleForms: spyOn<any>(plugin, 'handleForms').and.returnValue(of(null)),
      finalizeForms: spyOn<any>(plugin, 'finalizeForms'),
    };
    const errorSpy = spyOn(console, 'error');

    plugin[`ngZone` as any] = ngZone;
    plugin.afterGlobalInit().subscribe();

    expect(singleSelectedSpy).toHaveBeenCalled();
    expect(initSidebarSpy).toHaveBeenCalledWith(elCmp);
    expect(spies.initElementForms).toHaveBeenCalledWith(elCmp);
    expect(spies.initAlignmentForm).toHaveBeenCalledWith(sidebarRef);
    expect(spies.handleAlignmentForm).toHaveBeenCalledWith(elCmp, sidebarRef);
    expect(spies.handleForms).toHaveBeenCalledWith(elCmp, sidebarRef);
    expect(spies.finalizeForms).toHaveBeenCalledWith(elCmp, sidebarRef);
    expect(errorSpy).not.toHaveBeenCalled();

  });

  it('should init element forms', () => {

    const elCmp: any = {
      definition: { id: 'elem' },
    };
    const spies = [
      spyOn<any>(plugin, 'initPositionForm'),
      spyOn<any>(plugin, 'initDimensionsForm'),
      spyOn<any>(plugin, 'initBackgroundForm'),
    ];

    expect(plugin.initElementForms(elCmp)).toEqual(elCmp);
    spies.forEach(spy => expect(spy).toHaveBeenCalledWith(elCmp));

  });

  it('should handle forms', () => {

    const elCmp: any = {
      definition: { id: 'elem' },
    };
    const sidebarRef: any = { test: 'sidebar' };
    const spies = [
      spyOn<any>(plugin, 'handlePositionForm'),
      spyOn<any>(plugin, 'handleDimensionsForm'),
      spyOn<any>(plugin, 'handleBackgroundForm'),
    ];

    spies.forEach(spy => spy.and.returnValue(of(null)));

    plugin.handleForms(elCmp, sidebarRef).subscribe();

    spies.filter(spy => spy.length === 1).forEach(spy => expect(spy).toHaveBeenCalledWith(elCmp));
    spies.filter(spy => spy.length === 2).forEach(spy => expect(spy).toHaveBeenCalledWith(elCmp, sidebarRef));

  });

  it('should finalize forms', () => {

    const sidebarRef = {
      destroy: jasmine.createSpy('destroy'),
    };

    plugin.finalizeForms(null, sidebarRef as any)();

    expect(sidebarRef.destroy).toHaveBeenCalled();

  });

});
