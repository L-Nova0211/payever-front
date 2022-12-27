import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import * as rxjsOps from 'rxjs/operators';

import { PebEditorState, PebScreen } from '@pe/builder-core';
import { PebEditorAccessorService } from '@pe/builder-shared';
import * as pebRenderer from '@pe/builder-renderer';

import { OVERLAY_DATA } from '../../misc/overlay.data';

import { PebEditorZoomDialogComponent } from './zoom.dialog';

describe('PebEditorZoomToolDialogComponent', () => {

  let fixture: ComponentFixture<PebEditorZoomDialogComponent>;
  let component: PebEditorZoomDialogComponent;
  let state: jasmine.SpyObj<PebEditorState>;
  let data: {
    data: {
      scale: number;
    };
    emitter: {
      next: jasmine.Spy;
    };
  };
  let editorComponent: {
    contentContainer: {
      nativeElement: HTMLDivElement;
    };
    renderer: {
      nativeElement: HTMLDivElement;
    };
  };

  beforeAll(() => {

    Object.defineProperty(pebRenderer, 'fromResizeObserver', {
      value: pebRenderer.fromResizeObserver,
      writable: true,
    });

    Object.defineProperty(rxjsOps, 'throttleTime', {
      value: rxjsOps.throttleTime,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    spyOn(pebRenderer, 'fromResizeObserver').and.returnValue(of({ width: 900 }));
    spyOn(rxjsOps, 'throttleTime').and.returnValue(value => value);

    data = {
      data: {
        scale: .75,
      },
      emitter: {
        next: jasmine.createSpy('next'),
      },
    };

    editorComponent = {
      contentContainer: {
        nativeElement: document.createElement('div'),
      },
      renderer: {
        nativeElement: document.createElement('div'),
      },
    };

    const stateMock = {
      screen$: of(PebScreen.Desktop),
      screen: PebScreen.Desktop,
      scale: .75,
      scaleToFit: jasmine.createSpy('scaleToFit'),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorZoomDialogComponent],
      providers: [
        { provide: OVERLAY_DATA, useValue: data },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorState, useValue: stateMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorZoomDialogComponent);
      component = fixture.componentInstance;
      state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set scale$ & toFit$ on construct', () => {

    component.scale$.subscribe(scale => expect(scale).toBe(0.75));
    component.toFit$.subscribe(toFit => expect(toFit).toBe(true));

  });

  it('should set scale on form value changes', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    expect(component.formGroup.value.scale).toBe(75);

    /**
     * chage scale to the same value in component.formGroup
     */
    component.formGroup.patchValue({ scale: 75 });

    expect(data.data.scale).toBe(.75);
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * chage scale to the new value in component.formGroup
     */
    component.formGroup.patchValue({ scale: 200 });

    expect(data.data.scale).toBe(2);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should set value', () => {

    const contentContainer = {
      nativeElement: {
        ownerDocument: {
          defaultView: {
            innerWidth: 300,
            innerHeight: 200,
          },
        },
        clientWidth: 500,
      },
    };
    const renderer = {
      nativeElement: {
        clientHeight: 200,
      },
    };

    editorComponent.contentContainer = contentContainer as any;
    editorComponent.renderer = renderer as any;

    /**
     * argument value is 10
     */
    component.setScale(10);

    expect(data.emitter.next).toHaveBeenCalledWith(10);

    /**
     * argument value is -1
     * scrollbarChanged is TRUE
     */
    component.fitToScale();

    expect(data.emitter.next).toHaveBeenCalledWith(25);

    /**
     * scrollbarChanged is FALSE
     */
    contentContainer.nativeElement.clientWidth = 300;
    component.fitToScale();

    expect(data.emitter.next).toHaveBeenCalledWith(75);

  });

  it('should set close zoom subject to true on close click', () => {

    component.close();

    expect(data.emitter.next).toHaveBeenCalled();

  });

});
