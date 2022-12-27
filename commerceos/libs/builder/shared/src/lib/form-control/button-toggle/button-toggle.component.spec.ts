import { Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebButtonToggleComponent } from './button-toggle.component';

describe('PebButtonToggleComponent', () => {

  let fixture: ComponentFixture<PebButtonToggleComponent>;
  let component: PebButtonToggleComponent;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', [
      'setAttribute',
      'removeAttribute',
    ]);

    TestBed.configureTestingModule({
      declarations: [PebButtonToggleComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebButtonToggleComponent);
      component = fixture.componentInstance;
      component[`renderer`] = renderer;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get checked class', () => {

    const el = fixture.debugElement.nativeElement;

    component.checked = true;
    fixture.detectChanges();

    expect(component.class).toBe(true);
    expect(el).toHaveClass('toggle-button-checked');

  });

  it('should set disabled state', () => {

    component.setDisabledState(true);

    expect(renderer.setAttribute(component.button.nativeElement, 'disabled', 'true'));
    expect(renderer.removeAttribute).not.toHaveBeenCalled();

    renderer.setAttribute.calls.reset();
    component.setDisabledState(false);

    expect(renderer.removeAttribute).toHaveBeenCalledWith(component.button.nativeElement, 'disabled');
    expect(renderer.setAttribute).not.toHaveBeenCalled();

  });

  it('should write value', () => {

    component.checked = null;
    component.writeValue(true);
    expect(component.checked).toBe(true);

  });

  it('should toggle value', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');

    /**
     * component.toggle is FALSE
     * component.value is TRUE
     */
    component.toggle = false;
    component.value = true;
    component.checked = true;
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);
    component.toggleValue();

    expect(component.checked).toBe(true);
    expect(changeSpy).not.toHaveBeenCalled();
    expect(touchSpy).not.toHaveBeenCalled();

    /**
     * component.toggle is TRUE
     */
    component.toggle = true;
    component.toggleValue();

    expect(component.checked).toBe(false);
    expect(touchSpy).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalledWith(true);

    /**
     * component.value is undefined
     */
    component.checked = true;
    component.value = undefined;
    component.toggleValue();

    expect(component.checked).toBe(false);
    expect(changeSpy).toHaveBeenCalledWith(false);

  });

});
