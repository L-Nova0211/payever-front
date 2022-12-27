import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SidebarCheckboxInput } from './checkbox.input';

describe('SidebarCheckboxInput', () => {

  let fixture: ComponentFixture<SidebarCheckboxInput>;
  let component: SidebarCheckboxInput;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['setProperty']);

    TestBed.configureTestingModule({
      declarations: [SidebarCheckboxInput],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(SidebarCheckboxInput);
      component = fixture.componentInstance;
      component[`renderer`] = renderer;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle toggle', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');
    const eventMock: any = {
      target: { checked: true },
    };

    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);
    component.onToggle(eventMock);

    expect(changeSpy).toHaveBeenCalledWith(true);
    expect(touchSpy).toHaveBeenCalled();

  });

  it('should write value', () => {

    component.writeValue(true);

    expect(renderer.setProperty).toHaveBeenCalledWith(component.input.nativeElement, 'checked', true);

  });

});
