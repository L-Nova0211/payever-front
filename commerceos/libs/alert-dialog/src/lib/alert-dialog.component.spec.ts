import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { PeAlertDialogData, PeAlertDialogService, PeAlertDialogStylesComponent } from '@pe/alert-dialog';

import { PeAlertDialogComponent } from './alert-dialog.component';

describe('PeAlertDialogComponent', () => {
  let component: PeAlertDialogComponent;
  let fixture: ComponentFixture<PeAlertDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeAlertDialogComponent, PeAlertDialogStylesComponent ],
      imports: [MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: (result) => result } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        PeAlertDialogService,
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeAlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invoke action and close on result', fakeAsync(() => {
    const alertDialog = TestBed.inject(PeAlertDialogService);
    const data: PeAlertDialogData = (alertDialog as any).defaultData;
    (component.data as any) = data;
    const event = new MouseEvent('click');
    const dialogRefCloseSpy = spyOn(component.dialogRef, 'close');

    fixture.detectChanges();
    component.invokeAction(event, data.actions[0]);
    tick(100);
    expect(dialogRefCloseSpy).toHaveBeenCalledWith(true);
  }));
});
