import { Overlay } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorZoomDialogComponent } from './zoom.dialog';
import { PebEditorZoomTool } from './zoom.tool';

describe('PebEditorZoomTool', () => {

  let fixture: ComponentFixture<PebEditorZoomTool>;
  let component: PebEditorZoomTool;

  const deviceService = { isMobile: false };
  const state = {
    scale: 1,
    scale$: of(1),
  };

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorZoomTool],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: state },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: deviceService },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorZoomTool);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();
    expect(component.isMobile).toBe(deviceService.isMobile);

  });

  it('should open zoom', () => {

    const element = document.createElement('div');
    const overlay = of(200);
    const openSpy = spyOn<any>(component, 'openOverlay').and.returnValue(overlay);
    const detachSpy = spyOn<any>(component, 'detachOverlay');

    component.openZoom(element);

    expect(openSpy).toHaveBeenCalledWith(
      PebEditorZoomDialogComponent,
      element,
      { scale: 1 },
    );
    expect(detachSpy).toHaveBeenCalled();
    expect(state.scale).toEqual(2);

  });

});
