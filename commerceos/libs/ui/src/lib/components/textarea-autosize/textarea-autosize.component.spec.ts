import { ElementRef, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PebTextareaAutosizeComponent } from './textarea-autosize.component';

describe('TextareaComponent', () => {

  let fixture: ComponentFixture<PebTextareaAutosizeComponent>;
  let component: PebTextareaAutosizeComponent;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebTextareaAutosizeComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebTextareaAutosizeComponent);
      component = fixture.componentInstance;
      component.textarea = new ElementRef(document.createElement('textarea'));

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should call onBlur on focusout', () => {

    const el = fixture.debugElement.nativeElement as HTMLElement;
    const event = new Event('focusout');

    component.textarea.nativeElement.value = 'test';
    component.registerOnChange(() => { });
    component.registerOnTouched(() => { });

    const changeSpy = spyOn(component, 'onChange');
    const touchSpy = spyOn(component, 'onTouch');

    el.dispatchEvent(event);

    expect(changeSpy).toHaveBeenCalledWith('test');
    expect(touchSpy).toHaveBeenCalled();

  });

  it('should write value', () => {

    component.writeValue('test');

    expect(renderer.setProperty).toHaveBeenCalledWith(component.textarea.nativeElement, 'value', 'test');

  });

});
