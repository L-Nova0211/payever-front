import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebColorPaletteComponent } from './color-palette.component';

describe('PebEditorColorPaletteComponent', () => {

  let fixture: ComponentFixture<PebColorPaletteComponent>;
  let component: PebColorPaletteComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebColorPaletteComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebColorPaletteComponent);
      component = fixture.componentInstance;
      component.palette = [
        'red',
        'green',
        'blue',
      ];

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should subscribe to form value changes on construct', () => {

    const changeSpy = jasmine.createSpy('onChange');
    const touchSpy = jasmine.createSpy('onTouch');

    component.registerOnChange(changeSpy);
    component.registerOnTouched(touchSpy);
    component.form.patchValue({
      color: 'green',
    });

    expect(component.onChange).toEqual(changeSpy);
    expect(component.onTouch).toEqual(touchSpy);
    expect(changeSpy).toHaveBeenCalledWith('green');
    expect(touchSpy).toHaveBeenCalled();

  });

  it('should write value', () => {

    component.writeValue('red');
    expect(component.form.value.color).toEqual('red');

  });

});
