import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { EditorImageAdjustmentForm } from './image-adjustment.form';

describe('EditorImageAdjustmentForm', () => {

  let fixture: ComponentFixture<EditorImageAdjustmentForm>;
  let component: EditorImageAdjustmentForm;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [EditorImageAdjustmentForm],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorImageAdjustmentForm);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({
        exposure: new FormControl(50),
        saturation: new FormControl(50),
      });

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

});
