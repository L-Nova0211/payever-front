import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { PebPagesComponent } from './pages.component';


@Injectable()
export class PebPagesService {

  constructor(
    private dialog: MatDialog,
  ) {
  }

  openPagesDialog(ids: string[] = []): Observable<any> {
    const dialog = this.dialog.open(PebPagesComponent, {
      height: '95vh',
      maxWidth: '95vw',
      width: '95vw',
      panelClass: 'pages-dialog',
      data: {
        ids,
      },
    });

    return dialog.afterClosed();
  }
}
