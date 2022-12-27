import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorActionsHistoryTool } from './actions-history.tool';

describe('PebEditorActionsHistoryTool', () => {

  let fixture: ComponentFixture<PebEditorActionsHistoryTool>;
  let component: PebEditorActionsHistoryTool;
  let textEditorActive$: BehaviorSubject<any>;

  const deviceService = { isMobile: true };

  beforeEach(waitForAsync(() => {

    const storeMock = {
      canUndo$: of(true),
      canRedo$: of(false),
    };

    textEditorActive$ = new BehaviorSubject(null);
    const stateMock = { textEditorActive$ };

    TestBed.configureTestingModule({
      declarations: [PebEditorActionsHistoryTool],
      providers: [
        { provide: PebEditorStore, useValue: storeMock },
        { provide: PebEditorState, useValue: stateMock },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: deviceService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorActionsHistoryTool);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();
    expect(component.isMobile).toBe(deviceService.isMobile);

  });

  it('should get canUndo$', () => {

    const textEditor = {
      canUndo$: of(false),
    };

    /**
     * editorState.textEditorActive$ is NULL
     */
    component.canUndo$.subscribe(can => expect(can).toBe(true)).unsubscribe();

    /**
     * editorState.textEditorActive$ is set
     */
    textEditorActive$.next(textEditor);

    component.canUndo$.subscribe(can => expect(can).toBe(false)).unsubscribe();

  });

  it('should get canRedo$', () => {

    const textEditor = {
      canRedo$: of(true),
    };

    /**
     * editorState.textEditorActive$ is NULL
     */
    component.canRedo$.subscribe(can => expect(can).toBe(false)).unsubscribe();

    /**
     * editorState.textEditorActive$ is set
     */
    textEditorActive$.next(textEditor);

    component.canRedo$.subscribe(can => expect(can).toBe(true)).unsubscribe();

  });

});
