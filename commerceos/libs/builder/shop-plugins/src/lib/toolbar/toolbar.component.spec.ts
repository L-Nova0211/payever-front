import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  PebEditorMediaToolDialogComponent,
  PebEditorObjectsToolDialogComponent,
  PebEditorZoomDialogComponent,
} from '@pe/builder-base-plugins';
import { PebEditorState, PebElementType } from '@pe/builder-core';
import { EditorSidebarTypes, PebEditorInterlayerState, PebEditorStore } from '@pe/builder-editor';
import { PebDeviceService } from '@pe/common';
import { Observable, of, Subject } from 'rxjs';
import { PebEditorShopToolbarComponent } from './toolbar.component';

describe('PebEditorShopToolbarComponent', () => {

  let fixture: ComponentFixture<PebEditorShopToolbarComponent>;
  let component: PebEditorShopToolbarComponent;
  let state: {
    misc$: Observable<{ seoSidebarOpened: boolean }>;
    textEditorActive: any;
    scale: number;
    sidebarsActivity: { [key: string]: boolean };
  };
  let overlay: jasmine.SpyObj<Overlay>;
  let overlayRef: {
    attach: jasmine.Spy;
    hasAttached: jasmine.Spy;
    detach: jasmine.Spy;
    backdropClick: jasmine.Spy;
    dispose: jasmine.Spy;
  };
  let backdropSubject: Subject<void>;
  let interlayerState: { closeZoom$: Subject<boolean>; };

  const deviceService = { isMobile: false };

  beforeEach(waitForAsync(() => {

    state = {
      misc$: of({ seoSidebarOpened: true }),
      textEditorActive: null,
      scale: 1,
      sidebarsActivity: { test: true },
    };

    backdropSubject = new Subject<void>();
    overlayRef = {
      attach: jasmine.createSpy('attach'),
      hasAttached: jasmine.createSpy('hasAttached').and.returnValue(true),
      detach: jasmine.createSpy('detach'),
      backdropClick: jasmine.createSpy('backdropClick').and.returnValue(backdropSubject),
      dispose: jasmine.createSpy('dispose'),
    };
    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', {
      create: overlayRef as any,
      position: {
        flexibleConnectedTo: () => ({
          withFlexibleDimensions: () => ({
            withViewportMargin: () => ({
              withPositions: () => 'position.strategy',
            }),
          }),
        }),
      } as any,
    });

    interlayerState = { closeZoom$: new Subject() };

    TestBed.configureTestingModule({
      declarations: [PebEditorShopToolbarComponent],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebDeviceService, useValue: deviceService },
        { provide: PebEditorState, useValue: state },
        { provide: Overlay, useValue: overlaySpy },
        { provide: PebEditorInterlayerState, useValue: interlayerState },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorShopToolbarComponent);
      component = fixture.componentInstance;

      overlay = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set seo dialog opened observable on construct', () => {

    component.seoDialogOpened$.subscribe(opened => expect(opened).toBe(true));

  });

  it('should get host skeleton class', () => {

    expect(component.hostSkeletonClass).toBe(false);

    component.loading = true;
    expect(component.hostSkeletonClass).toBe(true);

  });

  it('should get native element', () => {

    expect(component.nativeElement).toEqual(fixture.nativeElement);

  });

  it('should open media', () => {

    const overlayMock = of({ test: true });
    const elemMock: any = { id: 'elem' };
    const openOverlaySpy = spyOn<any>(component, 'openOverlay').and.returnValue(overlayMock);
    const createElementAfterCloseSpy = spyOn<any>(component, 'createElementAfterClose');

    component.openMedia(elemMock);

    expect(openOverlaySpy).toHaveBeenCalledWith(
      PebEditorMediaToolDialogComponent,
      elemMock,
      null,
      'dialog-media-panel',
    );
    expect(createElementAfterCloseSpy).toHaveBeenCalledWith(overlayMock);

  });

  it('should open objects', () => {

    const overlayMock = of({ test: true });
    const elemMock: any = { id: 'elem' };
    const openOverlaySpy = spyOn<any>(component, 'openOverlay').and.returnValue(overlayMock);
    const createElementAfterCloseSpy = spyOn<any>(component, 'createElementAfterClose');

    component.openObjects(elemMock);

    expect(openOverlaySpy).toHaveBeenCalledWith(
      PebEditorObjectsToolDialogComponent,
      elemMock,
      null,
      'dialog-objects-panel',
    );
    expect(createElementAfterCloseSpy).toHaveBeenCalledWith(overlayMock);

  });

  it('should open zoom', () => {

    const openOverlaySpy = spyOn<any>(component, 'openOverlay').and.returnValue(of(150));
    const detachSpy = spyOn<any>(component, 'detachOverlay');
    const elemMock: any = { id: 'elem' };

    /**
     * state.textEditorActive is set
     */
    state.textEditorActive = { test: 'active' };

    component.openZoom(elemMock);

    expect(openOverlaySpy).not.toHaveBeenCalled();
    expect(detachSpy).not.toHaveBeenCalled();
    expect(state.scale).toBe(1);

    /**
     * state.textEditorActive is null
     */
    state.textEditorActive = null;

    component.openZoom(elemMock);

    expect(openOverlaySpy).toHaveBeenCalledWith(
      PebEditorZoomDialogComponent,
      elemMock,
      { scale: 1 },
    );
    expect(detachSpy).toHaveBeenCalledTimes(1);
    expect(state.scale).toBe(1.5);

    /**
     * emit interlayerState.closeZoom$ as FALSE
     */
    detachSpy.calls.reset();
    interlayerState.closeZoom$.next(false);
    expect(detachSpy).not.toHaveBeenCalled();

    /**
     * emit interlayerState.closeZoom$ as TRUE
     */
    interlayerState.closeZoom$.next(true);
    expect(detachSpy).toHaveBeenCalled();

  });

  it('should create text element', () => {

    const emitSpy = spyOn(component.execCommand, 'emit');

    component.createTextElement();

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'createElement',
      params: {
        type: PebElementType.Text,
        data: { text: '<span>Your text</span>' },
        style: { width: '100%' },
      },
    });

  });

  it('should open overlay', () => {

    const element = document.createElement('div');
    const attachedSpy = spyOn<any>(component, 'hasOverlayAttached').and.callThrough();
    const detachSpy = spyOn<any>(component, 'detachOverlay');

    class MockClass { }

    /**
     * arguments data & panelClass are null
     * overlay is not attached
     */
    component[`openOverlay`](MockClass, element);
    backdropSubject.next();

    expect(attachedSpy).toHaveBeenCalled();
    expect(overlay.create).toHaveBeenCalled();
    expect(overlay.position).toHaveBeenCalled();
    expect(overlayRef.attach).toHaveBeenCalled();
    expect(overlayRef.backdropClick).toHaveBeenCalled();
    expect(detachSpy).toHaveBeenCalled();

    /**
     * argument panelClass is set
     */
    component[`overlayRef`] = null;
    component[`openOverlay`](MockClass, element, null, 'panelClass');

    expect(overlay.create).toHaveBeenCalledTimes(2);
    expect(overlay.position).toHaveBeenCalledTimes(2);

    /**
     * overlay is attached
     */
    overlay.create.calls.reset();
    overlay.position.calls.reset();

    component[`openOverlay`](MockClass, element);

    expect(overlay.create).not.toHaveBeenCalled();
    expect(overlay.position).not.toHaveBeenCalled();

  });

  it('should create element after close', () => {

    const element = { id: 'elem', type: null };
    const overlayMock = of(element);
    const detachSpy = spyOn<any>(component, 'detachOverlay');
    const emitSpy = spyOn(component.execCommand, 'emit');

    /**
     * element.type is null
     */
    component[`createElementAfterClose`](overlayMock);

    expect(detachSpy).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();

    /**
     * element.type is PebElementType.Section
     */
    element.type = PebElementType.Section;

    component[`createElementAfterClose`](overlayMock);

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'createElement',
      params: element,
    });

  });

  it('should detach overlay', () => {

    const attachedSpy = spyOn<any>(component, 'hasOverlayAttached').and.callThrough();

    /**
     * component.overlayRef is null
     */
    component[`overlayRef`] = null;
    component[`detachOverlay`]();

    expect(attachedSpy).toHaveBeenCalled();
    expect(overlayRef.detach).not.toHaveBeenCalled();

    /**
     * component.overlayRef is set
     */
    component[`overlayRef`] = overlayRef as any;
    component[`detachOverlay`]();

    expect(overlayRef.detach).toHaveBeenCalled();

  });

  it('should open page navigation', () => {

    state.sidebarsActivity[EditorSidebarTypes.Navigator] = false;

    component.openPageNavigation();

    expect(state.sidebarsActivity).toEqual({
      test: true,
      [EditorSidebarTypes.Navigator]: true,
    });

  });

});
