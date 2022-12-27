import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { MediaService, PebEditorApi } from '@pe/builder-api';
import * as pebCore from '@pe/builder-core';
import { PebPageVariant } from '@pe/builder-core';
import { PageTypes, PebEditorAccessorService, PebEditorStore } from '@pe/builder-shared';

import { PebEditorPageSidebarComponent } from './page.sidebar';

describe('PebEditorPageSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorPageSidebarComponent>;
  let component: PebEditorPageSidebarComponent;
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let editorComponent: {
    commands$: { next: jasmine.Spy; };
  };
  let nameInputElem: HTMLInputElement;

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    const editorStoreMock = {
      snapshot: {
        application: {
          routing: [
            { routeId: 'r-001', pageId: 'p-001' },
            { routeId: 'r-002', pageId: 'p-002' },
          ],
        },
      },
      versionUpdated$: of(false),
    };

    editorComponent = {
      commands$: { next: jasmine.createSpy('next') },
    };

    nameInputElem = document.createElement('input');

    TestBed.configureTestingModule({
      declarations: [PebEditorPageSidebarComponent],
      providers: [
        FormBuilder,
        { provide: PebEditorApi, useValue: {} },
        { provide: MediaService, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: PebEditorStore, useValue: editorStoreMock },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorPageSidebarComponent);
      component = fixture.componentInstance;
      component.page = {
        id: 'p-001',
        name: 'Page 001',
        variant: PebPageVariant.Default,
      } as any;
      component.nameInput = new ElementRef(nameInputElem);

      editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get route', () => {

    expect(component[`route`]).toEqual(editorStore.snapshot.application.routing[0]);

  });

  it('should handle ng init', () => {

    const initFormSpy = spyOn<any>(component, 'initForm');
    const watchOnChangesSpy = spyOn<any>(component, 'watchOnChanges');

    component.ngOnInit();

    expect(initFormSpy).toHaveBeenCalled();
    expect(watchOnChangesSpy).toHaveBeenCalled();

  });

  it('should handle name input Enter event', () => {

    const event = {
      target: {
        value: ' test ',
      },
      preventDefault: jasmine.createSpy('preventDefault'),
    };
    const emitSpy = spyOn(component.changePageName, 'emit');

    component.pageNameInputEnterHandler(event as any);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith('test');

  });

  it('should handle link input Enter event', () => {

    const event = {
      target: {
        value: ' test ',
      },
      preventDefault: jasmine.createSpy('preventDefault'),
    };
    const formMock = new FormGroup({
      link: new FormControl(),
    });

    component.form = formMock;
    component.pageLinkInputEnterHandler(event as any);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(formMock.value.link).toEqual('test');

  });

  it('should set page name before destroy', () => {

    const emitSpy = spyOn(component.changePageName, 'emit');

    component.setPageNameBeforeDestroy(' test ');

    expect(emitSpy).toHaveBeenCalledWith('test');

  });

  it('should add section', () => {

    const emitSpy = spyOn(component.createNewSection, 'emit');

    component.addSection();
    expect(emitSpy).toHaveBeenCalledWith(undefined);

    component.addSection(true);
    expect(emitSpy).toHaveBeenCalledWith(true);

  });

  it('should init form', () => {

    const routeMock = {
      url: null,
    };
    const routeSpy = spyOnProperty<any>(component, 'route').and.returnValue(null);

    /**
     * component.route is null
     */
    component.form = null;
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.form.value).toEqual({
      name: component.page.name,
      type: PageTypes[0].value,
      link: '',
      root: false,
    });
    expect(component.form.controls.link.getError('link')).toBe(true);

    /**
     * component.route.url is null
     */
    routeSpy.and.returnValue(routeMock);

    component.ngOnInit();

    expect(component.form.value.link).toEqual('');
    expect(component.form.controls.link.getError('link')).toBe(true);

    /**
     * component.route.url is set
     */
    routeMock.url = '/url=test';

    component.ngOnInit();

    expect(component.form.value.link).toEqual(routeMock.url);
    expect(component.form.controls.link.getError('link')).toBeNull();

  });

  it('should watch changes', () => {

    const setPageSpy = spyOn(component, 'setPageNameBeforeDestroy');
    const rootEmitSpy = spyOn(component.changeRootPage, 'emit');
    const typeEmitSpy = spyOn(component.changePageType, 'emit');
    const linkEmitSpy = spyOn(component.changePageLink, 'emit');
    const nameEmitSpy = spyOn(component.changePageName, 'emit');
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    const routeSpy = spyOnProperty<any>(component, 'route');
    const routeMock = {
      routeId: 'r-001',
      pageId: component.page.id,
      url: '/url=test',
    };
    let patchValueSpy: jasmine.Spy;

    /**
     * editorStore.versionUpdated$ is of(false)
     */
    component[`initForm`]();
    component[`watchOnChanges`]();

    patchValueSpy = spyOn(component.form, 'patchValue').and.callThrough();

    expect(rootEmitSpy).toHaveBeenCalledWith(false);
    expect(typeEmitSpy).not.toHaveBeenCalled();
    expect(linkEmitSpy).not.toHaveBeenCalled();
    expect(nameEmitSpy).not.toHaveBeenCalled();
    expect(generateIdSpy).not.toHaveBeenCalled();

    /**
     * change page type
     */
    component.form.patchValue({
      type: PageTypes[2],
    });

    expect(typeEmitSpy).toHaveBeenCalledWith(PageTypes[2]);

    /**
     * change page link
     * link is VALID
     * component.route is null
     */
    component.form.patchValue({
      link: routeMock.url,
    });

    expect(linkEmitSpy).toHaveBeenCalledWith({
      routeId: 'gid-001',
      pageId: component.page.id,
      url: routeMock.url,
    });
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * component.route is set
     */
    routeMock.url = '/url=test2';
    generateIdSpy.calls.reset();
    routeSpy.and.returnValue(routeMock);

    component.form.patchValue({
      link: routeMock.url,
    });

    expect(linkEmitSpy).toHaveBeenCalledWith({
      ...routeMock,
      url: routeMock.url,
    });
    expect(generateIdSpy).not.toHaveBeenCalled();

    /**
     * change page name to 'test'
     */
    component.form.patchValue({
      name: 'test',
    });

    expect(nameEmitSpy).toHaveBeenCalledWith('test');
    expect(patchValueSpy).not.toHaveBeenCalledWith({ name: component.page.name }, { emitEvent: false });

    /**
     * change page name to null
     */
    component.form.patchValue({
      name: null,
    });

    expect(patchValueSpy).toHaveBeenCalledWith({ name: component.page.name }, { emitEvent: false });

    expect(setPageSpy).not.toHaveBeenCalled();

    /**
     * component.changePageName.emit throws error
     */
    nameInputElem.value = 'page 123';
    nameEmitSpy.and.throwError('test error');

    component.form.patchValue({
      name: null,
    });

    expect(setPageSpy).toHaveBeenCalledWith(nameInputElem.value);

  });

  it('should open seo sidebar', () => {

    component.openSeoSidebar();

    expect(editorComponent.commands$.next).toHaveBeenCalledWith({ type: 'toggleSeoSidebar' });

  });

});
