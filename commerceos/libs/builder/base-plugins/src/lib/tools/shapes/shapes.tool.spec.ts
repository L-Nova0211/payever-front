import { Overlay } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { PebEditorState } from '@pe/builder-core';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorShapesTool } from './shapes.tool';

describe('PebEditorShapesTool', () => {

  let fixture: ComponentFixture<PebEditorShapesTool>;
  let component: PebEditorShapesTool;

  const deviceService = { isMobile: true };

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorShapesTool],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
        { provide: Overlay, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: PebDeviceService, useValue: deviceService },
        { provide: PebEditorAccessorService, useValue: {} },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorShapesTool);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();
    expect(component.isMobile).toBe(deviceService.isMobile);

  });

  it('should open shapes', () => {

    const emitSpy = spyOn(component.execCommand, 'emit');

    component.openShapes();

    expect(emitSpy).toHaveBeenCalledWith({ type: 'openShapesDialog' });

  });

});
