import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { PebPagesService } from './pages.service';

describe('PebPagesService', () => {

  let service: PebPagesService;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: any;

  beforeEach(() => {

    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialogRef = {
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of({ closed: true })),
    };
    dialogSpy.open.and.returnValue(dialogRef);

    TestBed.configureTestingModule({
      providers: [
        PebPagesService,
        { provide: MatDialog, useValue: dialogSpy },
      ],
    });

    service = TestBed.inject(PebPagesService);
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should open pages dialog', () => {

    service.openPagesDialog().subscribe();

    expect(dialog.open).toHaveBeenCalled();
    expect(dialogRef.afterClosed).toHaveBeenCalled();

  });

});
