import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SidebarTextInput } from './text.input';

describe('SidebarTextInput', () => {

  let fixture: ComponentFixture<SidebarTextInput>;
  let component: SidebarTextInput;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['setProperty']);

    TestBed.configureTestingModule({
      declarations: [SidebarTextInput],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(SidebarTextInput);
      component = fixture.componentInstance;
      component[`renderer`] = renderer;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle value change', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');

    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);
    component.input.nativeElement.value = 'test';
    component.onValueChange();

    expect(changeSpy).toHaveBeenCalledWith('test');
    expect(touchSpy).toHaveBeenCalled();

  });

  it('should write value', () => {

    component.writeValue('test');

    expect(renderer.setProperty).toHaveBeenCalledWith(component.input.nativeElement, 'value', 'test');

  });

});
