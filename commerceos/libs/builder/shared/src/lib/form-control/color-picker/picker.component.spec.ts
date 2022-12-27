import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { skip } from 'rxjs/operators';

import { RGBA } from './formats';
import { PebPickerComponent } from './picker.component';

describe('PebPickerComponent', () => {

  let fixture: ComponentFixture<PebPickerComponent>;
  let component: PebPickerComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebPickerComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebPickerComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle value changes', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const nextSpy = spyOn(component.changeOn, 'next');

    component.registerOnChange(changeSpy);
    component.hsv$.pipe(
      skip(11), // skip all changes except last
    ).subscribe(hsv => expect(hsv).toEqual({
      hue: {
        '--slider-thumb': 'rgb(255,0,255)',
      },
      saturation: {
        '--unfilled': 'linear-gradient(90deg, rgb(255,255,255) 0%, rgb(255,0,255) 100%)',
        '--slider-thumb': 'rgb(255,0,255)',
      },
      value: {
        '--unfilled': 'linear-gradient(90deg, #000000 0%, #ffffff 100%)',
        '--slider-thumb': 'rgb(255,255,255)',
      },
    }));

    /**
     * set component.rgbaValue$
     * compontn.form.dirty is FALSE
     */
    component.rgbaValue$.next(new RGBA(255, 255, 255, 1));

    expect(component.form.value).toEqual({
      hsva: { h: 0, s: 0, v: 100, a: 100 },
      hue: 0,
      saturation: 0,
      value: 100,
      alpha: 100,
      hex: new RGBA(255, 255, 255, 1),
      red: 255,
      green: 255,
      blue: 255,
    });
    expect(changeSpy).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.form.dirty is TRUE
     * change component.form
     * hsva null
     */
    component.form.markAsDirty();
    component.form.patchValue({
      hsva: null,
      alpha: 75,
      hex: new RGBA(204, 102, 102, .75),
      red: 204,
      green: 102,
      blue: 102,
    });

    expect(changeSpy).toHaveBeenCalledWith('rgba(204,102,102,0.75)');
    expect(nextSpy).not.toHaveBeenCalled();
    expect(component.form.get('hex').dirty).toBe(false);

    /**
     * component.form.controls.hex.dirty is TRUE
     * hsva is set
     */
    component.form.controls.hex.markAsDirty();
    component.form.patchValue({
      hue: 300,
      saturation: 100,
      value: 100,
      alpha: 100,
    });

    expect(nextSpy).toHaveBeenCalled();
    expect(component.form.controls.hex.dirty).toBe(false);

    /**
     * change alpha
     */
    changeSpy.calls.reset();
    component.form.markAsDirty();
    component.form.patchValue({
      alpha: 1,
    });

    expect(changeSpy).toHaveBeenCalledWith('rgb(255,0,255)');

  });

  it('should set disabled state', () => {

    component.setDisabledState(true);

    expect().nothing();

  });

  it('should handle value change - onValueChange', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');
    const nextSpy = spyOn(component.changeOn, 'next');

    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);

    /**
     * component.form.value.alpha is 1
     */
    component.form.patchValue({
      red: 250,
      green: 13,
      blue: 172,
      alpha: 1,
    });
    component.onValueChange();

    expect(touchSpy).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalledWith('rgb(250,13,172)');
    expect(nextSpy).toHaveBeenCalled();

    /**
     * component.form.value.alpha is 75
     */
    component.form.patchValue({ alpha: 75 });
    component.onValueChange();

    expect(changeSpy).toHaveBeenCalledWith('rgba(250,13,172,0.75)');

  });

  it('should write value', () => {

    const rgba = new RGBA(153, 153, 153, 1);
    const nextSpy = spyOn(component.rgbaValue$, 'next');

    /**
     * argument value is null
     */
    component.writeValue(null);

    expect(nextSpy).toHaveBeenCalledWith({ r: 255, g: 255, b: 255, a: 1 });

    /**
     * argument value is typeof string
     */
    component.writeValue('rgb(51,51,51)');

    expect(nextSpy).toHaveBeenCalledWith(new RGBA(51, 51, 51, 1));

    /**
     * argument value is typeof RGBA
     */
    component.writeValue(rgba);

    expect(nextSpy).toHaveBeenCalledWith(rgba);

  });

});
