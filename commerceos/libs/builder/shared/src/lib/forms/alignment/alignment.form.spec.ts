import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { PebEditorState } from '@pe/builder-core';

import { EditorAlignmentForm } from './alignment.form';

describe('EditorAlignmentForm', () => {

  let fixture: ComponentFixture<EditorAlignmentForm>;
  let component: EditorAlignmentForm;
  let el: DebugElement;

  beforeEach(waitForAsync(() => {

    const stateMock = {
      makerActive$: of(true),
    };

    TestBed.configureTestingModule({
      declarations: [EditorAlignmentForm],
      providers: [
        { provide: PebEditorState, useValue: stateMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorAlignmentForm);
      component = fixture.componentInstance;
      el = fixture.debugElement;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

});
