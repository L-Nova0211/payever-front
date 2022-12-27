import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { MediaItemType } from '@pe/builder-core';

import { MediaDialogService } from './media-dialog.service';
import { PebMediaComponent } from './media.component';

describe('MediaDialogService', () => {

  let service: MediaDialogService;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {

    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        MediaDialogService,
        { provide: MatDialog, useValue: dialogSpy },
      ],
    });

    service = TestBed.inject(MediaDialogService);
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should open media dialog', () => {

    const data = { types: [MediaItemType.Image] };

    /**
     * argument data is {} as default
     */
    service.openMediaDialog();

    expect(dialog.open).toHaveBeenCalledWith(PebMediaComponent, {
      data: {},
      height: '82.3vh',
      maxHeight: '82.3vh',
      maxWidth: '78.77vw',
      width: '78.77vw',
      panelClass: 'studio-dialog',
    });

    /**
     * argument data is set
     */
    service.openMediaDialog(data);

    expect(dialog.open.calls.mostRecent().args[1].data).toEqual(data);

  });

});
