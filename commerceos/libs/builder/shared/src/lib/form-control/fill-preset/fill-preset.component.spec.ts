import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { PebFillPresetComponent } from './fill-preset.component';

describe('FillPresetComponent', () => {

  let fixture: ComponentFixture<PebFillPresetComponent>;
  let component: PebFillPresetComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebFillPresetComponent],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebFillPresetComponent);
      component = fixture.componentInstance;
      component.control = new FormControl();

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should select', () => {

    const color = component.columns[2][3];
    const emitSpy = spyOn(component.colorSelected, 'emit');

    /**
     * component.control is set
     */
    component.select(color);

    expect(component.control.touched).toBe(true);
    expect(component.control.dirty).toBe(true);
    expect(component.control.value).toEqual(color);
    expect(emitSpy).toHaveBeenCalledWith(color);

    /**
     * component.control is null
     */
    component.control = null;
    component.select(color);

    expect(emitSpy).toHaveBeenCalledWith(color);

  });

});
