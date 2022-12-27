import { Overlay } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorState } from '@pe/builder-core';
import { EditorSidebarTypes, PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorBrushTool } from './brush.tool';

describe('PebEditorBrushTool', () => {

  let fixture: ComponentFixture<PebEditorBrushTool>;
  let component: PebEditorBrushTool;
  let state: {
    sidebarsActivity: {
      navigator: boolean;
      inspector: boolean;
    };
  };

  beforeEach(waitForAsync(() => {

    state = {
      sidebarsActivity: {
        [EditorSidebarTypes.Navigator]: true,
        [EditorSidebarTypes.Inspector]: false,
      },
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorBrushTool],
      providers: [
        { provide: PebEditorState, useValue: state },
        { provide: PebEditorStore, useValue: {} },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorBrushTool);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should open shapes', () => {

    component.openShapes();

    expect(state.sidebarsActivity).toEqual({
      [EditorSidebarTypes.Navigator]: true,
      [EditorSidebarTypes.Inspector]: true,
    });

  });

});
