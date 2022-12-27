import { Component, Renderer2, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick,waitForAsync } from '@angular/core/testing';
import { PeDestroyService } from '@pe/common';
import { Subject } from 'rxjs';
import { PebInputComponent } from './input.component';

@Component({
  selector: '',
  template: '<peb-input change="focusout"></peb-input>',
})
class TestComponent {

  @ViewChild(PebInputComponent) inputCmp: PebInputComponent;

};

describe('InputComponent', () => {

  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let inputCmp: PebInputComponent;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['setProperty']);

    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        PebInputComponent,
      ],
      providers: [
        { provide: PeDestroyService, useValue: new Subject() },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
      inputCmp = component.inputCmp;
      inputCmp[`renderer`] = renderer;

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should handle focusout & keyup', fakeAsync(() => {

    let el: HTMLInputElement = inputCmp.input.nativeElement;
    let event: Event = new FocusEvent('focusout');
    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');

    el.value = 'test';
    inputCmp.registerOnChange(changeSpy);
    inputCmp.registerOnTouched(touchSpy);

    /**
     * event is focusout event
     */
    el.dispatchEvent(event);
    tick();

    expect(changeSpy).toHaveBeenCalledWith('test');
    expect(touchSpy).toHaveBeenCalled();

    /**
     * event is keyup
     * need to reset, reconfigure & recreate the component to set change input to 'keyup'
     * because it was used in constructor
     */
    changeSpy.calls.reset();
    touchSpy.calls.reset();

    (async () => {
      fixture.destroy();
      TestBed.resetTestingModule();
      await TestBed
        .configureTestingModule({
          declarations: [
            TestComponent,
            PebInputComponent,
          ],
          providers: [
            { provide: PeDestroyService, useValue: new Subject() },
          ],
        })
        .overrideTemplate(TestComponent, '<peb-input change="keyup"></peb-input>')
        .compileComponents().then(() => {

          fixture = TestBed.createComponent(TestComponent);
          component = fixture.componentInstance;

          fixture.detectChanges();

        });

      inputCmp = component.inputCmp;
      el = inputCmp.input.nativeElement;
      event = new KeyboardEvent('keyup');

      el.value = 'test.keyup';
      inputCmp.registerOnChange(changeSpy);
      inputCmp.registerOnTouched(touchSpy);

      el.dispatchEvent(event);

      tick(500);

      expect(changeSpy).toHaveBeenCalledWith('test.keyup');
      expect(touchSpy).toHaveBeenCalled();

    })();

  }));

  it('should write value', () => {

    inputCmp.writeValue('test');

    expect(renderer.setProperty).toHaveBeenCalledWith(inputCmp.input.nativeElement, 'value', 'test');

  });

  it('should handle blur', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');

    inputCmp.input.nativeElement.value = 'test';
    inputCmp.registerOnChange(changeSpy);
    inputCmp.registerOnTouched(touchSpy);
    inputCmp.onBlur();

    expect(changeSpy).toHaveBeenCalledWith('test');
    expect(touchSpy).toHaveBeenCalled();

  });

});
