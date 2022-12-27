import { Overlay } from '@angular/cdk/overlay';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { PebEditorState, PebScreen } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { PebDeviceService } from '@pe/common';

import { PEB_PREVIEW_TOOL_DIALOG } from './preview.constant';
import { PebEditorPreviewTool } from './preview.tool';

class MockClass { }

describe('PebEditorPreviewTool', () => {

  let fixture: ComponentFixture<PebEditorPreviewTool>;
  let component: PebEditorPreviewTool;
  let store: jasmine.SpyObj<PebEditorStore>;
  let dialogRef: { afterClosed: jasmine.Spy };
  let dialog: jasmine.SpyObj<MatDialog>;
  let location: jasmine.SpyObj<Location>;

  beforeEach(waitForAsync(() => {

    const storeMock = {
      page: { id: 'p-001' },
      snapshot: { id: 'snap-001' },
    };

    const stateMock = {
      screen: PebScreen.Desktop,
    };

    dialogRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of(null)),
    };
    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', {
      open: dialogRef as any,
    });

    const locationSpy = jasmine.createSpyObj<Location>('Location', [
      'replaceState',
      'path',
    ]);

    TestBed.configureTestingModule({
      declarations: [PebEditorPreviewTool],
      providers: [
        { provide: PebEditorStore, useValue: storeMock },
        { provide: PebEditorState, useValue: stateMock },
        { provide: Overlay, useValue: {} },
        { provide: PebDeviceService, useValue: {} },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Location, useValue: locationSpy },
        { provide: PEB_PREVIEW_TOOL_DIALOG, useValue: MockClass },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorPreviewTool);
      component = fixture.componentInstance;

      store = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
      dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
      location = TestBed.inject(Location) as jasmine.SpyObj<Location>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should open preview', () => {

    const path = 'path/test';

    location.path.and.returnValue(path);

    component.openPreview();

    expect(location.path).toHaveBeenCalledWith(true);
    expect(dialog.open).toHaveBeenCalledWith(MockClass, {
      position: {
        top: '0',
        left: '0',
      },
      height: '100vh',
      maxWidth: '100vw',
      width: '100vw',
      panelClass: 'themes-preview-dialog',
      data: {
        themeSnapshot: { pages: [store.page], snapshot: store.snapshot },
        screen: PebScreen.Desktop,
      },
    });
    expect(dialogRef.afterClosed).toHaveBeenCalled();
    expect(location.replaceState).toHaveBeenCalledWith(path);

  });

});
