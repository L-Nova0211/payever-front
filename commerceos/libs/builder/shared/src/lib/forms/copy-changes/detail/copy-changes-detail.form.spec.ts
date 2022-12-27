import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebEditorState, PebScreen } from '@pe/builder-core';

import { EditorCopyChangesDetailForm } from './copy-changes-detail.form';

describe('EditorCopyChangesDetailForm', () => {

  let fixture: ComponentFixture<EditorCopyChangesDetailForm>;
  let component: EditorCopyChangesDetailForm;

  beforeEach(waitForAsync(() => {

    const stateMock = {
      screen: PebScreen.Desktop,
    };

    TestBed.configureTestingModule({
      declarations: [EditorCopyChangesDetailForm],
      providers: [
        { provide: PebEditorState, useValue: stateMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorCopyChangesDetailForm);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should emit on select screen', () => {

    const emitSpy = spyOn(component.selected, 'emit');

    component.selectScreen(PebScreen.Mobile);

    expect(emitSpy).toHaveBeenCalledWith(PebScreen.Mobile);

  });

});
