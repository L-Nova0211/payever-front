import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { PebEditorScriptsDialog } from './scripts.dialog';
import { PebEditorScriptsDialogService } from './scripts.service';

describe('PebEditorScriptsDialogService', () => {

  let service: PebEditorScriptsDialogService;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {

    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        PebEditorScriptsDialogService,
        { provide: MatDialog, useValue: dialogSpy },
      ],
    });

    service = TestBed.inject(PebEditorScriptsDialogService);
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should open scripts dialog', () => {

    service.openScriptsDialog();

    expect(dialog.open).toHaveBeenCalledWith(PebEditorScriptsDialog, {
      panelClass: 'scripts-dialog__panel',
      width: '436px',
    });

  });

});
