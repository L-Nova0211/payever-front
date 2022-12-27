import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebRangeInputComponent } from './range-input.component';

describe('PebEditorSliderComponent', () => {

  let fixture: ComponentFixture<PebRangeInputComponent>;
  let component: PebRangeInputComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebRangeInputComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebRangeInputComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle focusout event', () => {

    const el: HTMLElement = fixture.debugElement.nativeElement;
    const event = new FocusEvent('focusout');
    const touchSpy = jasmine.createSpy('onTouch');

    component.registerOnTouched(touchSpy);

    /**
     * component.ngControl is null
     */
    component.ngControl = null;
    el.dispatchEvent(event);
    expect(touchSpy).not.toHaveBeenCalled();

    /**
     * component.ngControl is set and dirty
     */
    component.ngControl = { control: { dirty: true } } as any;
    el.dispatchEvent(event);
    expect(touchSpy).toHaveBeenCalled();

  });

  it('should get is disabled', () => {

    /**
     * component.disabled is FALSE
     */
    component.disabled = false;
    expect(component.isDisabled).toBe(null);

    /**
     * component.disabled is TRUE
     */
    component.disabled = true;
    expect(component.isDisabled).toEqual('');

  });

  it('should get aria value now, min & max', () => {

    expect(component.ariaValueNow).toBe(50);
    expect(component.ariaValueMin).toBe(0);
    expect(component.ariaValueMax).toBe(100);

  });

  it('should handle input', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const ngControlMock = {
      control: {
        setValue: jasmine.createSpy('setValue'),
      },
    };

    component.registerOnChange(changeSpy);
    component.ngControl = ngControlMock as any;
    component[`input`].nativeElement.value = '13';
    component.onInput();

    expect(changeSpy).toHaveBeenCalledWith(13);
    expect(ngControlMock.control.setValue).toHaveBeenCalledWith(13, { emitEvent: false });

  });

  it('should set disabled state', () => {

    component.disabled = true;
    component.setDisabledState(false);
    expect(component.disabled).toBe(false);

  });

  it('should write value', () => {

    const nextSpy = spyOn(component.value$, 'next');

    component.writeValue(75);

    expect(nextSpy).toHaveBeenCalledWith(75);

  });

});
