import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PebEditorState, PebPageType } from '@pe/builder-core';
import { EditorSidebarTypes, PebEditorStore } from '@pe/builder-editor';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { PebDeviceService } from '@pe/common';
import { Observable, of, Subject } from 'rxjs';
import { PebEditorViewTool } from './view.tool';

describe('PebEditorViewTool', () => {

  let fixture: ComponentFixture<PebEditorViewTool>;
  let component: PebEditorViewTool;
  let state: jasmine.SpyObj<PebEditorState>;
  let overlayRef: {
    attach: jasmine.Spy;
    hasAttached: jasmine.Spy;
    detach: jasmine.Spy;
    backdropClick: jasmine.Spy;
    dispose: jasmine.Spy;
  };
  let backdropSubject: Subject<void>;

  beforeEach(waitForAsync(() => {

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

    const stateMock = {
      makerActive$: of(true),
      scale$: of(1),
      misc$: of({
        seoSidebarOpened: true,
      }),
      pagesView: PebPageType.Master,
      sidebarsActivity: {},
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorViewTool],
      providers: [
        { provide: Overlay, useValue: overlaySpy },
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebDeviceService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorViewTool);
      component = fixture.componentInstance;

      state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should open view', () => {

    let overlay$: Observable<any> = of(ShopEditorSidebarTypes.EditMasterPages);
    const openOverlaySpy = spyOn<any>(component, 'openOverlay').and.returnValue(overlay$);
    const detachSpy = spyOn<any>(component, 'detachOverlay');
    const element = document.createElement('div');

    // EditMasterPages
    // PebPageType.Master
    component.openView(element);

    expect(openOverlaySpy).toHaveBeenCalled();
    expect(detachSpy).toHaveBeenCalled();
    expect(state.pagesView).toEqual(PebPageType.Replica);

    // PebPageType.Replica
    component.openView(element);

    expect(state.pagesView).toEqual(PebPageType.Master);

    // Layers
    overlay$ = of(EditorSidebarTypes.Layers);
    openOverlaySpy.and.returnValue(overlay$);

    component.openView(element);

    expect(state.sidebarsActivity[`layers`]).toBe(true);

  });

});
