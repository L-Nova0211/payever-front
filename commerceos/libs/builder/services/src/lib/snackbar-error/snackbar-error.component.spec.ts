import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { PebEditorSnackbarErrorComponent } from './snackbar-error.component';

describe('PebEditorSnackbarErrorComponent', () => {

  let fixture: ComponentFixture<PebEditorSnackbarErrorComponent>;
  let component: PebEditorSnackbarErrorComponent;
  let snackbarRef: any;
  let data: any;

  beforeEach(waitForAsync(() => {

    const snackbarRefSpy = jasmine.createSpyObj('MatSnackBarRef', ['dismiss']);

    const dataMock = {
      retryAction: jasmine.createSpy('retryAction'),
      cancelAction: jasmine.createSpy('cancelAction'),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorSnackbarErrorComponent],
      providers: [
        { provide: MatSnackBarRef, useValue: snackbarRefSpy },
        { provide: MAT_SNACK_BAR_DATA, useValue: dataMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorSnackbarErrorComponent);
      component = fixture.componentInstance;

      snackbarRef = TestBed.inject(MatSnackBarRef);
      data = TestBed.inject(MAT_SNACK_BAR_DATA);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should call retry action and dismiss on retry click', () => {

    component.onRetryClick();

    expect(data.retryAction).toHaveBeenCalled();
    expect(snackbarRef.dismiss).toHaveBeenCalled();

  });

  it('should cancel action and dismiss on hide click', () => {

    // w/ cancel action
    component.onHideClick();

    expect(data.cancelAction).toHaveBeenCalled();
    expect(snackbarRef.dismiss).toHaveBeenCalled();

    // w/o cancel action
    data.cancelAction = null;

    component.onHideClick();

    expect(snackbarRef.dismiss).toHaveBeenCalled();

  });

});
