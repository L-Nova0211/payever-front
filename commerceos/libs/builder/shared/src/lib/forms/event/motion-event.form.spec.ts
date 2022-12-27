import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

// import { MotionEffectType } from '@pe/builder-base-plugins';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorAccessorService } from '@pe/builder-services';

import { PebMotionEventDetailForm } from './detail/motion-event-detail.form';
import { PebMotionEventForm } from './motion-event.form';

describe('PebMotionEventForm', () => {

  let fixture: ComponentFixture<PebMotionEventForm>;
  let component: PebMotionEventForm;
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
      declarations: [PebMotionEventForm],
      providers: [
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebMotionEventForm);
      component = fixture.componentInstance;
      component.effectType = MotionEffectType.Delay;
      component.formGroup = new FormGroup({
        [MotionEffectType.Delay]: new FormControl('10'),
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
      [MotionEffectType.Delay]: '100',
    });

    expect(editorComponent.backTo).toHaveBeenCalledWith('main');
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should get event type', () => {

    /**
     * component.formGroup.value.Delay is set
     */
    expect(component.getEventType()).toEqual('10');

    /**
     * component.formGroup.value.Delay.name is set
     */
    component.formGroup.patchValue({
      [MotionEffectType.Delay]: { name: 'slow' },
    });

    expect(component.getEventType()).toEqual('slow');

  });

  it('should show detail', () => {

    const sidebarCmpRef = {
      instance: {
        formGroup: null,
        effectType: null,
        effectTypes: null,
      },
    };
    const effectTypes = [MotionEffectType.Delay, MotionEffectType.Duration];

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);

    component.title = 'test';
    component.effectType = effectTypes[0];
    component.effectTypes = effectTypes;
    component.showDetail();

    expect(editorComponent.detail).toEqual({ back: 'Motion', title: 'Test' });
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(PebMotionEventDetailForm, PebEditorSlot.sidebarDetail);
    expect(sidebarCmpRef.instance).toEqual({
      effectTypes,
      formGroup: component.formGroup,
      effectType: effectTypes[0],
    });

  });

});
