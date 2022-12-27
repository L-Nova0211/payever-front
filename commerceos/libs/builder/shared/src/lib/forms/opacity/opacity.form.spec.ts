import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditorOpacityForm } from './opacity.form';

describe('EditorOpacityForm', () => {

  let fixture: ComponentFixture<EditorOpacityForm>;
  let component: EditorOpacityForm;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [EditorOpacityForm],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorOpacityForm);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

});
