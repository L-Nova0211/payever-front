import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import {
  PebActionAnimationType,
  PebBuildInAnimationType,
  PebBuildOutAnimationType,
  PebMotionType,
} from '@pe/builder-core';

import { PebMotionDetailForm } from './motion-detail.form';

describe('PebMotionDetailForm', () => {

  let fixture: ComponentFixture<PebMotionDetailForm>;
  let component: PebMotionDetailForm;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebMotionDetailForm],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebMotionDetailForm);
      component = fixture.componentInstance;
      component.motionType = PebMotionType.BuildOut;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    const motionAnimationTypesMap = new Map<PebMotionType, any>([
      [PebMotionType.BuildOut, PebBuildOutAnimationType],
      [PebMotionType.Action, PebActionAnimationType],
      [PebMotionType.BuildIn, PebBuildInAnimationType],
    ]);

    motionAnimationTypesMap.forEach((value, key) => {
      component.motionType = key;
      component.ngOnInit();
      expect(component.noAnimation).toEqual(value.None);
      expect(component.animationTypes).toEqual(Object.values(value).filter(v => v !== value.None));
    });

  });

  it('should handle search input enter event', () => {

    const eventMock = { preventDefault: jasmine.createSpy('preventDefault') };

    component.searchInputEnterHandler(eventMock as any);

    expect(eventMock.preventDefault).toHaveBeenCalled();

  });

  it('should select animation', () => {

    /**
     * argument animation is undefined as default
     */
    component.noAnimation = PebBuildOutAnimationType.None;
    component.formGroup = new FormGroup({
      type: new FormControl(),
    });
    component.selectAnimation();

    expect(component.formGroup.value.type).toEqual(PebBuildOutAnimationType.None);

    /**
     * argument animation is set
     */
    component.selectAnimation(PebBuildInAnimationType.Drift);

    expect(component.formGroup.value.type).toEqual(PebBuildInAnimationType.Drift);

  });

});
