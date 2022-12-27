import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorMediaTool } from './media.tool';

describe('PebEditorMediaTool', () => {

  let fixture: ComponentFixture<PebEditorMediaTool>;
  let component: PebEditorMediaTool;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorMediaTool],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorMediaTool);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should openMedia', () => {

    const element = document.createElement('div');
    const overlay = of({ test: true });
    const openSpy = spyOn<any>(component, 'openOverlay').and.returnValue(overlay);
    const createSpy = spyOn<any>(component, 'createElementAfterClose');

    component.openMedia(element);

    expect(openSpy).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalled();

  });

});
