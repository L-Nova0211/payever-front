import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebNumberInputSpinButtonsComponent } from './number-input-spinbutton.component';

describe('StepperHorizontalComponent', () => {

  let fixture: ComponentFixture<PebNumberInputSpinButtonsComponent>;
  let component: PebNumberInputSpinButtonsComponent;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [PebNumberInputSpinButtonsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebNumberInputSpinButtonsComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

});
