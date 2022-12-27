import { Renderer2 } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { PebNumberInputComponent } from './number-input.component';

describe('NumberInputComponent', () => {

  let fixture: ComponentFixture<PebNumberInputComponent>;
  let component: PebNumberInputComponent;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['setProperty']);

    TestBed.configureTestingModule({
      declarations: [PebNumberInputComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebNumberInputComponent);
      component = fixture.componentInstance;
      component[`renderer`] = renderer;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get aria value now', () => {

    /**
     * component.value is not finite
     */
    component[`value`] = Infinity;
    expect(component.ariaValueNow).toBe(0);

    /**
     * component.value is finite
     */
    component[`value`] = 10.52;
    expect(component.ariaValueNow).toEqual('11');

  });

  it('should get aria value min', () => {

    /**
     * component.min is infinite
     */
    expect(component.ariaValueMin).toBeUndefined();

    /**
     * component.min is finite
     */
    component.min = 10.52;
    expect(component.ariaValueMin).toEqual('11');

  });

  it('should get aria value max', () => {

    /**
     * component.max is infinite
     */
    expect(component.ariaValueMax).toBeUndefined();

    /**
     * component.max is finite
     */
    component.max = 99.13;
    expect(component.ariaValueMax).toEqual('99');

  });

  it('should check if multiple', () => {

    component[`value`] = [1, 3] as any;
    expect(component.multiple).toBe(true);

  });

  it('should register onChange & onTouch', () => {

    const changeFn = () => { };
    const touchFn = () => { };

    component.registerOnChange(changeFn);
    component.registerOnTouched(touchFn);

    expect(component.onChange).toEqual(changeFn);
    expect(component.onTouch).toEqual(touchFn);

  });

  it('should write value', () => {

    component.min = 0;
    component.max = 100;

    // typeof value != array
    // value isNaN
    component.writeValue('test' as any);

    expect(renderer.setProperty).not.toHaveBeenCalled();

    // value !isNaN
    component.writeValue(13);

    expect(component[`value`]).toBe(13);
    expect(renderer.setProperty).toHaveBeenCalledWith((component as any).input.nativeElement, 'value', '13');

    // typeof value = array
    component.writeValue([44, 55] as any);

    expect(component[`value`]).toBe(44);
    expect(renderer.setProperty).toHaveBeenCalledWith((component as any).input.nativeElement, 'value', '44');

  });

  it('should set disabled state', () => {

    const incrementElem = document.createElement('button');
    const decrementElem = document.createElement('button');

    /**
     * component.increment & decrement are null
     */
    component.increment = null;
    component.decrement = null;
    component.setDisabledState(true);

    expect(renderer.setProperty).toHaveBeenCalledOnceWith(component[`input`].nativeElement, 'disabled', true);

    /**
     * component.increment & decrement are set
     */
    renderer.setProperty.calls.reset();

    component.increment = incrementElem;
    component.decrement = decrementElem;
    component.setDisabledState(false);

    expect(renderer.setProperty.calls.allArgs()).toEqual([
      [component[`input`].nativeElement, 'disabled', false],
      [incrementElem, 'disabled', false],
      [decrementElem, 'disabled', false],
    ]);

  });

  it('should handle after view init', fakeAsync(() => {

    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');
    const writeSpy = spyOn(component, 'writeValue');
    const saveSelectionSpy = spyOn<any>(component, 'saveSelection');
    const restoreSelectionSpy = spyOn<any>(component, 'restoreSelection');
    const ngControlMock = {
      control: {
        setValue: jasmine.createSpy('setValue'),
      },
    };
    const blurSpy = spyOn(component[`input`].nativeElement, 'blur').and.callThrough();
    const incrementElem = document.createElement('button');
    const decrementElem = document.createElement('button');
    const mouseUpEvent = new MouseEvent('mouseup');
    const inputElem: HTMLInputElement = component[`input`].nativeElement;
    let event: Event | KeyboardEvent | MouseEvent | FocusEvent;
    let preventDefaultSpy: jasmine.Spy;

    function resetSpyCalls() {
      changeSpy.calls.reset();
      touchSpy.calls.reset();
      writeSpy.calls.reset();
      saveSelectionSpy.calls.reset();
      restoreSelectionSpy.calls.reset();
      ngControlMock.control.setValue.calls.reset();
      blurSpy.calls.reset();
      preventDefaultSpy = null;
    }

    /**
     * component.increment & decrement are null
     */
    component.increment = null;
    component.decrement = null;
    (component as any).value = 13;
    component.ngControl = ngControlMock as any;
    component.min = 10;
    component.max = 90;
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);
    component.ngAfterViewInit();

    /**
     * dispatch 'ArrowUp' keydown event
     */
    event = new KeyboardEvent('keydown', {
      code: 'ArrowUp',
    });
    preventDefaultSpy = spyOn(event, 'preventDefault').and.callThrough();
    inputElem.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(changeSpy.calls.allArgs()).toEqual(Array(2).fill([14]));
    expect(saveSelectionSpy).toHaveBeenCalled();
    expect(restoreSelectionSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalledWith(14);
    expect(ngControlMock.control.setValue).toHaveBeenCalledWith(14, { emitEvent: false });

    /**
     * dispatch 'ArrowDown' keydown event
     */
    resetSpyCalls();
    event = new KeyboardEvent('keydown', {
      code: 'ArrowDown',
    });
    preventDefaultSpy = spyOn(event, 'preventDefault').and.callThrough();
    inputElem.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(changeSpy.calls.allArgs()).toEqual(Array(2).fill([12]));
    expect(saveSelectionSpy).toHaveBeenCalled();
    expect(restoreSelectionSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalledWith(12);
    expect(ngControlMock.control.setValue).toHaveBeenCalledWith(12, { emitEvent: false });

    /**
     * dispatch focusout event
     * it will trigger change handler
     * event.target.nativeElement.value is 'test' (isNaN)
     */
    resetSpyCalls();
    event = new FocusEvent('focusout');
    inputElem.value = 'test';
    inputElem.dispatchEvent(event);

    expect(touchSpy).not.toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalledWith(13);
    expect(changeSpy).not.toHaveBeenCalled();
    expect(ngControlMock.control.setValue).not.toHaveBeenCalled();

    /**
     * event.target.nativeElement.value is '88'
     */
    resetSpyCalls();
    inputElem.value = '88';
    inputElem.dispatchEvent(event);

    expect(writeSpy).toHaveBeenCalledWith(88);
    expect(changeSpy).toHaveBeenCalledWith(88);
    expect(ngControlMock.control.setValue).toHaveBeenCalledWith(88, { emitEvent: false });

    /**
     * dispatch 'Enter' keydown event
     * event.target.nativeElement.value is 'test' (isNaN)
     */
    resetSpyCalls();
    event = new KeyboardEvent('keydown', {
      key: 'Enter',
    });
    inputElem.value = 'test';
    inputElem.dispatchEvent(event);

    expect(touchSpy).not.toHaveBeenCalled();
    expect(changeSpy).not.toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalledWith(13);
    expect(blurSpy).toHaveBeenCalled();

    /**
     * event.target.nativeElement.value is '88'
     */
    resetSpyCalls();
    inputElem.value = '88';
    inputElem.dispatchEvent(event);

    expect(touchSpy).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalledWith(88);
    expect(writeSpy).toHaveBeenCalledWith(88);
    expect(blurSpy).toHaveBeenCalled();

    /**
     * component.increment & decrement are set
     */
    resetSpyCalls();
    component.increment = incrementElem;
    component.decrement = decrementElem;
    component.ngAfterViewInit();

    /**
     * dispatch mousedown event on increment button
     * dispatch mouseup event on document after 500 msec
     * so it will increment twice
     */
    resetSpyCalls();
    event = new MouseEvent('mousedown');
    preventDefaultSpy = spyOn(event, 'preventDefault');

    incrementElem.dispatchEvent(event);
    tick(500);
    document.dispatchEvent(mouseUpEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(touchSpy).toHaveBeenCalled();
    expect(saveSelectionSpy).toHaveBeenCalled();
    expect(restoreSelectionSpy).toHaveBeenCalled();
    expect(writeSpy.calls.allArgs()).toEqual([[14], [15]]);
    expect(changeSpy.calls.allArgs()).toEqual([[14], [15], [15]]); // 1 more for finalizeWithValue func
    expect(ngControlMock.control.setValue.calls.allArgs()).toEqual([
      [14, { emitEvent: false }],
      [15, { emitEvent: false }],
    ]);

    /**
     * dispatch mousedown event on decrement button
     * dispatch mouseup event on document after 600 msec
     * so it will decrement 4 times (1 startWith + 1 after 500 msec delay + 2 after 100 msec)
     */
    resetSpyCalls();
    event = new MouseEvent('mousedown');
    preventDefaultSpy = spyOn(event, 'preventDefault');

    decrementElem.dispatchEvent(event);
    tick(600);
    document.dispatchEvent(mouseUpEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(touchSpy).toHaveBeenCalled();
    expect(saveSelectionSpy).toHaveBeenCalled();
    expect(restoreSelectionSpy).toHaveBeenCalled();
    expect(writeSpy.calls.allArgs()).toEqual([[12], [11], [10]]);
    expect(changeSpy.calls.allArgs()).toEqual([[12], [11], [10], [10]]);
    expect(ngControlMock.control.setValue.calls.allArgs()).toEqual([
      [12, { emitEvent: false }],
      [11, { emitEvent: false }],
      [10, { emitEvent: false }],
    ]);

  }));

  it('should save/restore selection', () => {

    const inputElem: HTMLInputElement = component[`input`].nativeElement;

    inputElem.value = '13025';
    inputElem.setSelectionRange(2, 4);

    component[`saveSelection`]();
    expect(component[`selection`]).toEqual({
      start: 2,
      end: 4,
    });

    inputElem.setSelectionRange(null, null);
    component[`restoreSelection`]();
    expect(inputElem.selectionStart).toEqual(2);
    expect(inputElem.selectionEnd).toEqual(4);

  });

});
