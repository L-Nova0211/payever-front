import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PebColorForm } from './color.form';

describe('PebColorForm', () => {

  let fixture: ComponentFixture<PebColorForm>;
  let component: PebColorForm;
  let el: DebugElement;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebColorForm],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebColorForm);
      component = fixture.componentInstance;
      el = fixture.debugElement;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should emit blurred on change and color selected', () => {

    const emitSpy = spyOn(component.blurred, 'emit');
    const picker: HTMLElement = el.query(By.css('peb-picker')).nativeElement;
    const fillPreset: HTMLElement = el.query(By.css('peb-fill-preset')).nativeElement;

    /**
     * dispatch change event on picker
     */
    picker.dispatchEvent(new Event('change'));
    expect(emitSpy).toHaveBeenCalled();

    /**
     * dispatch colorSelected event on fill preset
     */
    emitSpy.calls.reset();
    fillPreset.dispatchEvent(new Event('colorSelected'));
    expect(emitSpy).toHaveBeenCalled();

  });

  it('should handle ng destroy', () => {

    const nextSpy = spyOn(component.destroy$, 'next');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();

  });

});
