import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-editor';
import { PebDeviceService } from '@pe/common';
import { of } from 'rxjs';
import { PebEditorSeoTool } from './seo.tool';

describe('PebEditorSeoTool', () => {

  let fixture: ComponentFixture<PebEditorSeoTool>;
  let component: PebEditorSeoTool;

  beforeEach(waitForAsync(() => {

    const stateMock = {
      misc$: of({ seoSidebarOpened: true }),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorSeoTool],
      providers: [
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorStore, useValue: {} },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorSeoTool);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set dialog opened observable on construct', () => {

    component.seoDialogOpened$.subscribe(opened => expect(opened).toEqual(true));

  });

});
