import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { PebEditorAccessorService } from '@pe/builder-services';

import { EditorBuildOrderForm } from './build-order.form';

describe('EditorBuildOrderForm', () => {

  let fixture: ComponentFixture<EditorBuildOrderForm>;
  let component: EditorBuildOrderForm;
  let editorComponent: { backTo: jasmine.Spy };

  beforeEach(waitForAsync(() => {

    editorComponent = { backTo: jasmine.createSpy('backTo') };

    TestBed.configureTestingModule({
      declarations: [EditorBuildOrderForm],
      providers: [
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorBuildOrderForm);
      component = fixture.componentInstance;
      component.formGroup = new FormGroup({
        type: new FormControl(),
      });

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get editor', () => {

    expect(component[`editor`]).toEqual(editorComponent as any);

  });

  it('should handle ng init', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    component.ngOnInit();
    component.formGroup.patchValue({
      type: true,
    });

    expect(editorComponent.backTo).toHaveBeenCalledWith('main');
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should get motion type', () => {

    /**
     * component.formGroup.value.type.name is set
     */
    component.formGroup.patchValue({
      type: { name: MotionActionType.AddAction },
    });

    expect(component.getMotionType()).toEqual(MotionActionType.AddAction);

    /**
     * component.formGroup.value.type is set
     */
    component.formGroup.patchValue({
      type: MotionActionType.BuildOrder,
    });

    expect(component.getMotionType()).toEqual(MotionActionType.BuildOrder);

  });

});
