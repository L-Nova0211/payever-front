import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import {
  PebActionAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebMotionType,
} from '@pe/builder-core';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebMotionDetailForm } from './detail/motion-detail.form';
import { EditorMotionForm } from './motion.form';

describe('EditorMotionForm', () => {

  let fixture: ComponentFixture<EditorMotionForm>;
  let component: EditorMotionForm;
  let editorComponent: {
    backTo: jasmine.Spy;
    insertToSlot: jasmine.Spy;
    detail: any;
  };

  beforeEach(waitForAsync(() => {

    editorComponent = {
      backTo: jasmine.createSpy('backTo'),
      insertToSlot: jasmine.createSpy('insertToSlot'),
      detail: null,
    };

    TestBed.configureTestingModule({
      declarations: [EditorMotionForm],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorMotionForm);
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

  it('should handle form value changes after ng init', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    component.ngOnInit();
    component.formGroup.patchValue({
      type: PebMotionType.Action,
    });

    expect(editorComponent.backTo).toHaveBeenCalledWith('main');
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should set motionTypes on init', () => {

    /**
     * component.motionType is PebMotionType.BuildIn
     */
    component.motionType = PebMotionType.BuildIn;
    component.ngOnInit();

    expect(component.motionTypes).toEqual(Object.values(PebBuildInAnimationType));

    /**
     * component.motiontType is PebMotionType.BuildOut
     */
    component.motionType = PebMotionType.BuildOut;
    component.ngOnInit();

    expect(component.motionTypes).toEqual(Object.values(PebBuildOutAnimationType));

    /**
     * component.motionType is PebMotionType.Action
     */
    component.motionType = PebMotionType.Action;
    component.ngOnInit();

    expect(component.motionTypes).toEqual(Object.values(PebActionAnimationType));

  });

  it('should get motion type', () => {

    /**
     * component.formGroup.value.type.name is set
     */
    component.formGroup.patchValue({
      type: { name: PebMotionType.Action },
    });

    expect(component.getMotionType()).toEqual(PebMotionType.Action);

    /**
     * component.formGroup.value.type is set
     */
    component.formGroup.patchValue({
      type: PebMotionType.BuildOut,
    });

    expect(component.getMotionType()).toEqual(PebMotionType.BuildOut);

  });

  it('should show detail', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        motionType: null,
      },
    };

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.motionType = PebMotionType.Action;
    component.showDetail();

    expect(editorComponent.detail).toEqual({ back: 'Motion', title: PebMotionType.Action });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebMotionDetailForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance.formGroup).toEqual(component.formGroup);
    expect(sidebarCmpRef.instance.motionType).toEqual(PebMotionType.Action);

  });

});
