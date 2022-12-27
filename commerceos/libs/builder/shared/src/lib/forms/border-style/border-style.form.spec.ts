import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditorBorderStyleForm } from './border-style.form';

describe('EditorBorderStyleForm', () => {

  let fixture: ComponentFixture<EditorBorderStyleForm>;
  let component: EditorBorderStyleForm;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [EditorBorderStyleForm],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(EditorBorderStyleForm);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should check is single line border', () => {

    expect(component.isSingleLineBorder('groove')).toBe(false);
    expect(component.isSingleLineBorder('dotted')).toBe(true);

  });

  it('should patch value', () => {

    const emitSpy = spyOn(component.blurred, 'emit');
    const elemRefMock = {
      nativeElement: {
        dispatchEvent: jasmine.createSpy('dispatchEvent'),
      },
    };
    const formControlMock = {
      patchValue: jasmine.createSpy('patchValue'),
    };

    /**
     * component.formControl is null
     */
    component.formControl = null;
    component[`elmRef`] = elemRefMock;
    component.patchValue('test');

    expect(elemRefMock.nativeElement.dispatchEvent).toHaveBeenCalledWith(new Event('change', { bubbles: true }));
    expect(emitSpy).toHaveBeenCalled();

    /**
     * component.formControl is set
     */
    component.formControl = formControlMock as any;
    component.patchValue('test');

    expect(formControlMock.patchValue).toHaveBeenCalledWith('test');

  });

});
