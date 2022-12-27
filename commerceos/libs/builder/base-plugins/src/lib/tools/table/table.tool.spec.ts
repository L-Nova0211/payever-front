import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorState, PebElementType } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorTableTool } from './table.tool';

describe('PebEditorTableTool', () => {

  let fixture: ComponentFixture<PebEditorTableTool>;
  let component: PebEditorTableTool;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorTableTool],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorTableTool);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should create grid element', () => {

    const emitSpy = spyOn(component.execCommand, 'emit');

    component.createGridElement();

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'createElement',
      params: {
        type: PebElementType.Grid,
        data: { variant: PebElementType.Grid },
        style: {},
      },
    });

  });

});
