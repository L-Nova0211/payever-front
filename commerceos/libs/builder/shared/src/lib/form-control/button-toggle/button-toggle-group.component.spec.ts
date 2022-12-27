import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebButtonToggleGroupComponent } from './button-toggle-group.component';

describe('PebButtonToggleGroupComponent', () => {

  let fixture: ComponentFixture<PebButtonToggleGroupComponent>;
  let component: PebButtonToggleGroupComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebButtonToggleGroupComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebButtonToggleGroupComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set disabled state', () => {

    const setSpy = spyOn<any>(component, 'setChildDisabledState');

    /**
     * component.buttonToggles is null
     */
    component[`disabled`] = false;
    component.setDisabledState(true);

    expect(component[`disabled`]).toBe(true);
    expect(setSpy).not.toHaveBeenCalled();

    /**
     * component.buttonToggles is set
     */
    component.buttonToggles = [{ button: 'test' }] as any;
    component.setDisabledState(false);

    expect(component[`disabled`]).toBe(false);
    expect(setSpy).toHaveBeenCalledWith(false);

  });

  it('should write value', () => {

    const writeSpy = spyOn<any>(component, 'writeChildValue');

    /**
     * component.buttonToggles is null
     */
    component.buttonToggles = null;
    component[`value`] = false;
    component.writeValue(true);

    expect(component[`value`]).toBe(true);
    expect(writeSpy).not.toHaveBeenCalled();

    /**
     * component.buttonToggles is set
     */
    component.buttonToggles = [{ button: 'test' }] as any;
    component.writeValue(false);

    expect(component[`value`]).toBe(false);
    expect(writeSpy).toHaveBeenCalledWith(false);

  });

  it('should handle ng after content init', () => {

    const buttonMock = {
      registerOnChange: jasmine.createSpy('registerOnChange'),
      registerOnTouched: jasmine.createSpy('registerOnTouched'),
      onChange: null as Function,
      checked: null,
      value: null,
    };
    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');
    const writeSpy = spyOn<any>(component, 'writeChildValue');
    const setSpy = spyOn<any>(component, 'setChildDisabledState');

    buttonMock.registerOnChange.and.callFake((fn: Function) => {
      buttonMock.onChange = fn;
    });

    /**
     * component.buttonToggles is []
     * component.disabled is undefined
     */
    component[`value`] = true;
    component.buttonToggles = [] as any;
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);
    component[`disabled`] = undefined;
    component.ngAfterContentInit();

    expect(changeSpy).not.toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalledWith(true);
    expect(setSpy).not.toHaveBeenCalled();

    /**
     * component.buttonToggles is set
     * component.disabled is FALSE
     */
    component.buttonToggles = [buttonMock] as any;
    component[`disabled`] = false;
    component.ngAfterContentInit();

    expect(buttonMock.registerOnChange).toHaveBeenCalled();
    expect(buttonMock.registerOnTouched).toHaveBeenCalledWith(touchSpy);
    expect(setSpy).toHaveBeenCalledWith(false);

    /**
     * change value
     * component.radio is FALSE
     */
    expect(buttonMock.onChange).toBeDefined();

    component.radio = false;
    buttonMock.onChange('test');

    expect(changeSpy).toHaveBeenCalledWith(buttonMock.value);
    expect(buttonMock.checked).toBeNull();

    /**
     * component.radio is TRUE
     */
    component.radio = true;
    buttonMock.onChange('test');

    expect(buttonMock.checked).toBe(true);

  });

  it('should write child value', () => {

    const buttonMock = {
      checked: false,
      value: 'test',
    };

    component.buttonToggles = [buttonMock] as any;
    component[`writeChildValue`]('test');
    expect(buttonMock.checked).toBe(true);

    component[`writeChildValue`]('new test');
    expect(buttonMock.checked).toBe(false);

  });

  it('should set child disabled state', () => {

    const buttonMock = {
      setDisabledState: jasmine.createSpy('setDisabledState'),
    };

    component.buttonToggles = [buttonMock] as any;
    component.setDisabledState(true);

    expect(buttonMock.setDisabledState).toHaveBeenCalledWith(true);

  });

});
