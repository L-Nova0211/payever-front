import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ErrorDialogComponent } from './error-dialog.component';

describe('ErrorDialogComponent', () => {

  let fixture: ComponentFixture<ErrorDialogComponent>;
  let component: ErrorDialogComponent;
  let data: any;
  let dialogRef: any;

  beforeEach(waitForAsync(() => {

    data = {
      setAction: jasmine.createSpy('setAction'),
      cancelAction: jasmine.createSpy('cancelAction'),
    };

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [ErrorDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(ErrorDialogComponent);
      component = fixture.componentInstance;

      dialogRef = TestBed.inject(MatDialogRef);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set action', () => {

    component.onSet();

    expect(data.setAction).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();

  });

  it('should cancel action', () => {

    // w/ cancel action
    component.onCancel();

    expect(data.cancelAction).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();

    // w/o cancel action
    delete data.cancelAction;

    component.onCancel();

    expect(dialogRef.close).toHaveBeenCalled();

  });

});
