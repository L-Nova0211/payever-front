import { Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as rxjsOps from 'rxjs/operators';

import { HSVA } from './formats';
import { PebHSVColorPickerComponent } from './hsva-picker.component';

describe('PebHSVColorPickerComponent', () => {

  let fixture: ComponentFixture<PebHSVColorPickerComponent>;
  let component: PebHSVColorPickerComponent;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeAll(() => {

    Object.defineProperty(rxjsOps, 'throttleTime', {
      value: rxjsOps.throttleTime,
      writable: true,
    });

  });

  beforeEach(waitForAsync(() => {

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['setStyle']);

    TestBed.configureTestingModule({
      declarations: [PebHSVColorPickerComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebHSVColorPickerComponent);
      component = fixture.componentInstance;
      component[`renderer` as any] = renderer;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle change', () => {

    const hostElem: HTMLElement = fixture.debugElement.nativeElement;
    const mousedown = new MouseEvent('mousedown', {
      clientX: 108,
      clientY: 50,
    });
    const mousemove = new MouseEvent('mousemove');
    const mouseup = new MouseEvent('mouseup');
    const eventSpy = spyOn(hostElem, 'dispatchEvent').and.callThrough();
    const changeSpy = jasmine.createSpy('onChange').and.callFake(() => document.dispatchEvent(mouseup));
    const touchSpy = jasmine.createSpy('onTouch');
    const hsva = new HSVA(0, 0, 20, 100);

    spyOn(rxjsOps, 'throttleTime').and.returnValue(value => value);

    component[`hsva$`].next(hsva);
    component.canvas.nativeElement.style.width = '500px';
    component.canvas.nativeElement.style.height = '500px';
    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);

    fixture.detectChanges();
    const cursorElem: HTMLElement = hostElem.querySelector('.hsva__cursor');

    /**
     * event.target is not cursor
     */
    hostElem.dispatchEvent(mousedown);
    document.dispatchEvent(mousemove);

    expect(renderer.setStyle.calls.allArgs()).toEqual([
      [document.body, 'pointer-events', 'none'],
      [document.body, 'pointer-events', 'auto'],
    ]);
    expect(changeSpy).toHaveBeenCalledWith(new HSVA(0, 20, 100, 100));
    expect(touchSpy).toHaveBeenCalled();
    expect(eventSpy).toHaveBeenCalledWith(new Event('change', { bubbles: true }));

    /**
     * event.target is cursor
     */
    changeSpy.calls.reset();
    touchSpy.calls.reset();
    spyOnProperty(mousedown, 'target').and.returnValue(cursorElem);

    hostElem.dispatchEvent(mousedown);
    document.dispatchEvent(mousemove);

    expect(changeSpy.calls.argsFor(0)[0].h).toBe(0);
    expect(changeSpy.calls.argsFor(0)[0].s).toBe(0);
    expect(Math.ceil(changeSpy.calls.argsFor(0)[0].v)).toBe(20);
    expect(changeSpy.calls.argsFor(0)[0].a).toBe(100);

  });

  it('should set disabled state', () => {

    component.setDisabledState(true);

    expect().nothing();

  });

  it('should write value', () => {

    const hsva = new HSVA(0, 0, 20, 1);
    const nextSpy = spyOn(component[`hsva$`], 'next');

    component.writeValue(hsva);

    expect(nextSpy).toHaveBeenCalledWith(hsva);

  });

});
