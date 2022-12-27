import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorState, PebScreen } from '@pe/builder-core';
// import { PebEditor } from '@pe/builder-editor';
// import { PebEditorAccessorService } from '@pe/builder-services';

import { PebCopyChangesForm } from './copy-changes.form';
import { EditorCopyChangesDetailForm } from './detail/copy-changes-detail.form';

describe('EditorCopyChangesForm', () => {

  let fixture: ComponentFixture<PebCopyChangesForm>;
  let component: PebCopyChangesForm;
  let editor: jasmine.SpyObj<PebEditor>;

  beforeEach(waitForAsync(() => {

    const editorSpy = jasmine.createSpyObj<PebEditor>('PebEditor', [
      'backTo',
      'insertToSlot',
    ]);

    const editorAccessorServiceMock = {
      editorComponent: editorSpy,
    };

    TestBed.configureTestingModule({
      declarations: [PebCopyChangesForm],
      providers: [
        { provide: PebEditorState, useValue: {} },
        { provide: PebEditor, useValue: editorSpy },
        { provide: PebEditorAccessorService, useValue: editorAccessorServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebCopyChangesForm);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({
        test: new FormControl('test'),
      });

      editor = TestBed.inject(PebEditor) as jasmine.SpyObj<PebEditor>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get editor', () => {

    expect(component[`editor`]).toEqual(editor);

  });

  it('should show detail', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        selected: of(PebScreen.Tablet),
        destroy$: new Subject(),
      },
    };
    const emitSpy = spyOn(component.selected, 'emit');

    editor.insertToSlot.and.returnValue(sidebarCmpRef as any);

    component.showDetail();

    expect(editor.insertToSlot).toHaveBeenCalledWith(EditorCopyChangesDetailForm, PebEditorSlot.sidebarDetail);
    expect(editor.detail).toEqual({ back: 'Section', title: 'Select view' });
    expect(sidebarCmpRef.instance.formGroup).toEqual(component.formGroup);
    expect(emitSpy).toHaveBeenCalledWith(PebScreen.Tablet);
    expect(editor.backTo).toHaveBeenCalledWith('main');

  });

});
