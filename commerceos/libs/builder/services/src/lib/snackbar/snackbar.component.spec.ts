import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { PebEditorSnackbarComponent } from './snackbar.component';

describe('PebEditorSnackbarComponent', () => {

  let fixture: ComponentFixture<PebEditorSnackbarComponent>;
  let component: PebEditorSnackbarComponent;
  let snackBarRef: { dismiss: jasmine.Spy };
  let data: { cancelAction: jasmine.Spy; mainAction: jasmine.Spy; };

  beforeEach(waitForAsync(() => {

    data = {
      cancelAction: null,
      mainAction: null,
    };

    snackBarRef = {
      dismiss: jasmine.createSpy('dismiss'),
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorSnackbarComponent],
      providers: [
        { provide: MatSnackBarRef, useValue: snackBarRef },
        { provide: MAT_SNACK_BAR_DATA, useValue: data },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorSnackbarComponent);
      component = fixture.componentInstance;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle click on hide', () => {

    /**
     * component.data.cancelAction is null
     */
    component.onHideClick();

    expect(snackBarRef.dismiss).toHaveBeenCalled();

    /**
     * component.data.cancelAction is set
     */
    data.cancelAction = jasmine.createSpy('cancelAction');

    component.onHideClick();

    expect(data.cancelAction).toHaveBeenCalled();
    expect(snackBarRef.dismiss).toHaveBeenCalledTimes(2);

  });

  it('should handle main click', () => {

    /**
     * component.data is null
     */
    component.data = null;
    component.onMainClick();

    expect(snackBarRef.dismiss).toHaveBeenCalled();

    /**
     * component.data is set
     */
    data.mainAction = jasmine.createSpy('mainAction');

    component.data = data as any;
    component.onMainClick();

    expect(data.mainAction).toHaveBeenCalled();
    expect(snackBarRef.dismiss).toHaveBeenCalledTimes(2);

  });

});
