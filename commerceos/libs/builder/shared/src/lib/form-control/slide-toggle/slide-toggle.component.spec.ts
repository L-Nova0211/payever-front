import { Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebSlideToggleComponent } from './slide-toggle.component';

describe('SlideToggleComponent', () => {

  let fixture: ComponentFixture<PebSlideToggleComponent>;
  let component: PebSlideToggleComponent;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['setProperty']);

    TestBed.configureTestingModule({
      declarations: [PebSlideToggleComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebSlideToggleComponent);
      component = fixture.componentInstance;
      component[`renderer`] = renderer;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle toggle', () => {

    const event = new Event('change');
    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');

    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);

    (component.input.nativeElement as HTMLInputElement).dispatchEvent(event);

    expect(changeSpy).toHaveBeenCalled();
    expect(touchSpy).toHaveBeenCalled();

  });

  it('should write value', () => {

    component.writeValue(true);

    expect(renderer.setProperty).toHaveBeenCalledWith(component.input.nativeElement, 'checked', true);

  });

});
