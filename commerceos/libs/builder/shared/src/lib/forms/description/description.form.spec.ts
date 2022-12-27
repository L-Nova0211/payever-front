import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditorDescriptionForm } from './description.form';

describe('EditorDescriptionForm', () => {

  let fixture: ComponentFixture<EditorDescriptionForm>;
  let component: EditorDescriptionForm;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [EditorDescriptionForm],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorDescriptionForm);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {


    fixture.detectChanges();
    expect(component).toBeDefined();

  });

  it('should blur', () => {

    const emitSpy = spyOn(component.blurred, 'emit').and.callThrough();

    component.ngOnDestroy();

    expect(emitSpy).toHaveBeenCalled();

  });

});
