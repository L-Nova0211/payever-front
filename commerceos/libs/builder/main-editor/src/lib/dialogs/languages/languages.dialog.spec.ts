import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { PebEditorState, PebLanguage } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';

import { PebEditorLanguagesDialog } from './languages.dialog';

describe('PebEditorLanguagesDialog', () => {

  let fixture: ComponentFixture<PebEditorLanguagesDialog>;
  let component: PebEditorLanguagesDialog;
  let snapshotSubject: BehaviorSubject<any>;
  let afterClosedSubject: BehaviorSubject<any>;
  let state: {};
  let dialogRef: { afterClosed: jasmine.Spy, close: jasmine.Spy };

  beforeEach(waitForAsync(() => {

    snapshotSubject = new BehaviorSubject(null);
    const editorStoreMock = {
      snapshot$: snapshotSubject,
    };

    const stateMock = {
      language: PebLanguage.German,
    };

    afterClosedSubject = new BehaviorSubject('test');
    const dialogRefMock = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(afterClosedSubject),
      close: jasmine.createSpy('close'),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorLanguagesDialog],
      providers: [
        { provide: PebEditorStore, useValue: editorStoreMock },
        { provide: PebEditorState, useValue: stateMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorLanguagesDialog);
      component = fixture.componentInstance;

      state = TestBed.inject(PebEditorState);
      dialogRef = TestBed.inject(MatDialogRef) as any;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set active languages data on construct', () => {

    const snapshotMock = {
      application: null,
    };

    /**
     * snapshot.application is null
     */
    snapshotSubject.next(snapshotMock);

    /**
     * snapshot.application.data is null
     */
    snapshotMock.application = {
      data: null,
    };
    snapshotSubject.next(snapshotMock);

    /**
     * snapshot.application.data.languages is set
     */
    snapshotMock.application.data = {
      languages: [
        { language: PebLanguage.English, active: true },
        { language: PebLanguage.German, active: true },
        { language: PebLanguage.Chinese, active: false },
      ],
    };
    snapshotSubject.next(snapshotMock);

  });

  it('should handle ng init', () => {

    /**
     * dialogRef.afterClosed returns mocked data
     */
    component.ngOnInit();

    expect(dialogRef.afterClosed).toHaveBeenCalled();

    /**
     * dialofRef.afterClosed returns null
     */
    afterClosedSubject.next(null);

  });

  it('should set language', () => {

    component.setLanguage(PebLanguage.Chinese);

  });

  it('should close dialog on done', () => {

    component.done();
    expect(dialogRef.close).toHaveBeenCalled();

  });

  it('should close dialog on cancel', () => {

    component.cancel();
    expect(dialogRef.close).toHaveBeenCalled();

  });

});
