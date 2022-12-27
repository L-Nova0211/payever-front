import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorState, PebEnvService } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PebEditorPublishTool } from './publish.tool';

describe('PebEditorPublishTool', () => {

  let fixture: ComponentFixture<PebEditorPublishTool>;
  let component: PebEditorPublishTool;

  const envService = { shopId: 'shop-001' };

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebEditorPublishTool],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
        { provide: PebEnvService, useValue: envService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorPublishTool);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should open publish', () => {

    const element = document.createElement('div');
    const emitSpy = spyOn(component.execCommand, 'emit');

    component.openPublish(element);

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'openPublishDialogUnderElement',
      params: {
        element,
        appId: envService.shopId,
      },
    });

  });

});
