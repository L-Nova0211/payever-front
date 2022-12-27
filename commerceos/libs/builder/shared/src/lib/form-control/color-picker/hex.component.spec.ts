import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RGBA } from './formats';
import { PebHexComponent } from './hex.component';

describe('PebHexComponent', () => {

  let fixture: ComponentFixture<PebHexComponent>;
  let component: PebHexComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebHexComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebHexComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');

    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);
    component.ngOnInit();

    expect(component.control.value).toEqual('#FFFFFF');
    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchSpy).not.toHaveBeenCalled();

    /**
     * change component.value$
     */
    component[`value$`].next(new RGBA(51, 51, 51, 1));
    expect(component.control.value).toEqual('#333333');
    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchSpy).not.toHaveBeenCalled();

    /**
     * change component.control.value
     * component.control is INVALID
     */
    component.control.setValue('test');
    expect(component.control.value).toEqual('#333333');
    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchSpy).not.toHaveBeenCalled();

    /**
     * component.control is VALID
     * component.control.value is '#999'
     */
    component.control.setValue('#999');
    expect(component.control.value).toEqual('#999999');
    expect(component[`value$`].value).toEqual({ r: 153, g: 153, b: 153, a: 1 });
    expect(touchSpy).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalledWith({ r: 153, g: 153, b: 153, a: 1 });

    /**
     * component.control.value is '5'
     */
    component.control.setValue('5');
    expect(component.control.value).toEqual('#000005');
    expect(component[`value$`].value).toEqual({ r: 0, g: 0, b: 5, a: 1 });
    expect(changeSpy).toHaveBeenCalledWith({ r: 0, g: 0, b: 5, a: 1 });

  });

  it('should set disabled state', () => {

    component.setDisabledState(true);

    expect().nothing();

  });

  it('should write value', () => {

    const rgba = new RGBA(153, 153, 153, 1);

    /**
     * argument value is null
     */
    component.writeValue(null);

    expect(component[`value$`].value).toEqual({ r: 255, g: 255, b: 255, a: 1 });

    /**
     * argument value is typeof string
     */
    component.writeValue('rgb(51,51,51)');

    expect(component[`value$`].value).toEqual(new RGBA(51, 51, 51, 1));

    /**
     * argument value is typeof RGBA
     */
    component.writeValue(rgba);

    expect(component[`value$`].value).toEqual(rgba);

  });

});
