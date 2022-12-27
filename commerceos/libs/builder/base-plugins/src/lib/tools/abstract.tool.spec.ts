import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { AbstractPebEditorTool } from './abstract.tool';

@Component({
  selector: '',
  template: '',
})
class TestComponent extends AbstractPebEditorTool {

  constructor(injector: Injector) {
    super(injector);
  }

}

class MockClass { }

describe('AbstractPebEditorTool', () => {

  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let overlay: jasmine.SpyObj<Overlay>;
  let overlayRef: any;
  let backdropSubject: Subject<void>;

  beforeEach(waitForAsync(() => {

    backdropSubject = new Subject<void>();
    const overlayRefMock = {
      attach: jasmine.createSpy('attach'),
      hasAttached: jasmine.createSpy('hasAttached').and.returnValue(true),
      detach: jasmine.createSpy('detach'),
      backdropClick: jasmine.createSpy('backdropClick').and.returnValue(backdropSubject),
      dispose: jasmine.createSpy('dispose'),
    };
    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', [
      'create',
      'position',
    ]);
    overlaySpy.position.and.returnValue({
      flexibleConnectedTo() {
        return {
          withFlexibleDimensions() {
            return {
              withViewportMargin() {
                return {
                  withPositions() {
                    return 'positionStrategy';
                  },
                };
              },
            };
          },
        };
      },
    } as any);
    overlaySpy.scrollStrategies = {
      reposition() { },
    } as any;

    overlayRef = overlayRefMock;
    overlaySpy.create.and.returnValue(overlayRef);

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
        { provide: Overlay, useValue: overlaySpy },
        { provide: PebDeviceService, useValue: {} },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;

      overlay = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should open overlay', () => {

    const element = document.createElement('div');
    const createInjectorSpy = spyOn<any>(component, 'createInjector').and.callThrough();

    // w/o data & w/o panelClass
    component[`openOverlay`](MockClass, element);
    backdropSubject.next();

    expect(overlay.create).toHaveBeenCalled();
    expect(overlay.create.calls.argsFor(0)[0].panelClass).toEqual('dialog-publish-panel');
    expect(overlay.position).toHaveBeenCalled();
    expect(createInjectorSpy).toHaveBeenCalled();
    expect(overlayRef.attach).toHaveBeenCalled();
    expect(overlayRef.backdropClick).toHaveBeenCalled();
    expect(overlayRef.detach).toHaveBeenCalled();

    // w/ panelClass
    // hasOverlayAttached = FALSE
    overlayRef.hasAttached.and.returnValue(false);

    component[`openOverlay`](MockClass, element, null, 'panel-class');

    expect(overlay.create.calls.argsFor(1)[0].panelClass).toEqual('panel-class');

    // hasOverlayAttached = TRUE
    overlay.create.calls.reset();

    overlayRef.hasAttached.and.returnValue(true);

    component[`openOverlay`](MockClass, element);

    expect(overlay.create).not.toHaveBeenCalled();

  });

  it('should detach overlay', () => {

    component[`overlayRef`] = overlayRef;

    // hasOverlayAttached = TRUE
    component[`detachOverlay`]();

    expect(overlayRef.detach).toHaveBeenCalled();

    // hasOverlayAttached = FALSE
    overlayRef.detach.calls.reset();
    overlayRef.hasAttached.and.returnValue(false);

    component[`detachOverlay`]();

    expect(overlayRef.detach).not.toHaveBeenCalled();

  });

  it('should create element after close', () => {

    let overlayMock = of({ type: MockClass });
    const detachSpy = spyOn<any>(component, 'detachOverlay');
    const emitSpy = spyOn(component.execCommand, 'emit');

    // w/ element type
    component[`createElementAfterClose`](overlayMock as any);

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'createElement',
      params: { type: MockClass },
    });
    expect(detachSpy).toHaveBeenCalled();

    // w/o element type
    emitSpy.calls.reset();
    overlayMock = of({ type: undefined });

    component[`createElementAfterClose`](overlayMock as any);

    expect(emitSpy).not.toHaveBeenCalled();

  });

});
