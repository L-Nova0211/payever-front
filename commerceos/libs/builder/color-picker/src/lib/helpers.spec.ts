import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SliderDirective, TextDirective } from './helpers';

describe('TextDirective', () => {

  let directive: TextDirective;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        TextDirective,
      ],
    });

    directive = TestBed.inject(TextDirective);

  });

  it('should ne defined', () => {

    expect(directive).toBeDefined();

  });

  it('should handle input change', () => {

    const event = {
      target: {
        value: '15.5',
      },
    };
    const emitSpy = spyOn(directive.newValue, 'emit');

    // w/o rg
    directive.inputChange(event);

    expect(emitSpy).toHaveBeenCalledWith(event.target.value);

    // w/ rg
    directive.rg = 7;

    directive.inputChange(event);

    expect(emitSpy).toHaveBeenCalledWith({ v: 15.5, rg: 7 });

  });

});

describe('SliderDirective', () => {

  let directive: SliderDirective;
  let elemenRef: ElementRef;

  beforeEach(() => {

    elemenRef = new ElementRef(document.createElement('div'));

    TestBed.configureTestingModule({
      providers: [
        SliderDirective,
        { provide: ElementRef, useValue: elemenRef },
      ],
    });

    directive = TestBed.inject(SliderDirective);

  });

  it('should be defined', () => {

    expect(directive).toBeDefined();

  });

  it('should start on mousedown and touchstart', () => {

    const startSpy = spyOn<any>(directive, 'start');
    const event = { test: true };

    directive.mouseDown(event);

    expect(startSpy).toHaveBeenCalledWith(event);

    directive.touchStart(event);

    expect(startSpy).toHaveBeenCalledWith(event);
    expect(startSpy).toHaveBeenCalledTimes(2);

  });

  it('should handle move listener', () => {

    const moveSpy = spyOn<any>(directive, 'move');
    const event = { test: true };

    directive[`listenerMove`](event);

    expect(moveSpy).toHaveBeenCalledWith(event);

  });

  it('should handle stop listener', () => {

    const stopSpy = spyOn<any>(directive, 'stop');

    directive[`listenerStop`]();

    expect(stopSpy).toHaveBeenCalled();

  });

  it('should set cursor on move', () => {

    const setSpy = spyOn<any>(directive, 'setCursor');
    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
    };

    directive[`move`](event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith(event);

  });

  it('should set cursor and add event listeners on start', () => {

    const setSpy = spyOn<any>(directive, 'setCursor');
    const addListenerSpy = spyOn(document, 'addEventListener');
    const emitSpy = spyOn(directive.dragStart, 'emit');
    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };

    directive[`start`](event);

    expect(setSpy).toHaveBeenCalledWith(event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(addListenerSpy).toHaveBeenCalledWith('mouseup', directive[`listenerStop`]);
    expect(addListenerSpy).toHaveBeenCalledWith('touchend', directive[`listenerStop`]);
    expect(addListenerSpy).toHaveBeenCalledWith('mousemove', directive[`listenerMove`]);
    expect(addListenerSpy).toHaveBeenCalledWith('touchmove', directive[`listenerMove`]);
    expect(addListenerSpy).toHaveBeenCalledTimes(4);
    expect(emitSpy).toHaveBeenCalled();

  });

  it('should remove listeners on end', () => {

    const emitSpy = spyOn(directive.dragEnd, 'emit');
    const removeListenerSpy = spyOn(document, 'removeEventListener');

    directive[`stop`]();

    expect(removeListenerSpy).toHaveBeenCalledWith('mouseup', directive[`listenerStop`]);
    expect(removeListenerSpy).toHaveBeenCalledWith('touchend', directive[`listenerStop`]);
    expect(removeListenerSpy).toHaveBeenCalledWith('mousemove', directive[`listenerMove`]);
    expect(removeListenerSpy).toHaveBeenCalledWith('touchmove', directive[`listenerMove`]);
    expect(removeListenerSpy).toHaveBeenCalledTimes(4);
    expect(emitSpy).toHaveBeenCalled();

  });

  it('should get x', () => {

    const event = {
      pageX: undefined,
      touches: [
        { pageX: 100 },
      ],
    };

    // w/o event.pageX
    expect(directive[`getX`](event)).toBe(100);

    // w/ event.pageX
    event.pageX = 200;

    expect(directive[`getX`](event)).toBe(200);

  });

  it('should get x', () => {

    const event = {
      pageY: undefined,
      touches: [
        { pageY: 100 },
      ],
    };

    // w/o event.pageY
    expect(directive[`getY`](event)).toBe(100);

    // w/ event.pageY
    event.pageY = 200;

    expect(directive[`getY`](event)).toBe(200);

  });

  it('should set cursor', () => {

    const event = {
      pageX: 100,
      pageY: 150,
    };
    const emitSpy = spyOn(directive.newValue, 'emit');

    directive[`elRef`] = {
      nativeElement: {
        offsetWidth: 200,
        offsetHeight: 300,
        getBoundingClientRect() {
          return { top: 0, left: 0 };
        },
      },
    };

    // w/o rgX & rgY
    directive[`setCursor`](event);

    expect(emitSpy).not.toHaveBeenCalled();

    // w/ rgX
    // w/o rgY
    directive.rgX = 30;
    directive[`setCursor`](event);

    expect(emitSpy).toHaveBeenCalledWith({ v: 0.5, rgX: 30 });

    // w/o rgX
    // w/ rgY
    directive.rgX = undefined;
    directive.rgY = 50;
    directive[`setCursor`](event);

    expect(emitSpy).toHaveBeenCalledWith({ v: 0.5, rgY: 50 });

    // w/ rgX & rgY
    directive.rgX = 30;
    directive[`setCursor`](event);

    expect(emitSpy).toHaveBeenCalledWith({ s: .5, v: .5, rgX: 30, rgY: 50 });

  });

});
