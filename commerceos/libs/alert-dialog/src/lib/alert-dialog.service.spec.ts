import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PeAlertDialogStylesComponent } from './alert-dialog-styles.component';
import { PeAlertDialogComponent } from './alert-dialog.component';
import { PeAlertDialogService } from './alert-dialog.service';

describe('PeAlertDialogService', () => {
  let service: PeAlertDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeAlertDialogComponent, PeAlertDialogStylesComponent],
      imports: [MatDialogModule],
      providers: [PeAlertDialogService],
    });
    service = TestBed.inject(PeAlertDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open dialog', () => {
    const dialog = TestBed.inject(MatDialog);
    const dialogOpenSpy = spyOn(dialog, 'open');

    service.open();
    expect(dialogOpenSpy).toHaveBeenCalledWith(PeAlertDialogComponent, {
      panelClass: 'pe-alert-dialog__panel',
      backdropClass: 'pe-alert-dialog__backdrop',
      data: (service as any).defaultData,
      width: '260px',
      disableClose: true,
    });
  });
});
