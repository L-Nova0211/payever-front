import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as yaml from 'js-yaml';
import { map, share } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';


@Component({
  selector: 'sandbox-viewer-selection-dialog',
  templateUrl: './viewer-selection.dialog.html',
  styleUrls: ['./viewer-selection.dialog.scss'],
})
export class SandboxViewerSelectionDialog {
  themes$ = this.api.getShopThemesList().pipe(
    share(),
  );

  fixtures$ = this.loadYml('/fixtures/index.yml').pipe(
    share(),
  );

  constructor(
    private http: HttpClient,
    private api: PebEditorApi,
    private dialogRef: MatDialogRef<SandboxViewerSelectionDialog>,
  ) {}

  private loadYml(path) {
    return this.http.get(path, {
      responseType: 'text',
    }).pipe(
      map((content) => (yaml as any).safeLoad(content)),
    );
  }

  onNavigationClick() {
    this.dialogRef.close();
  }
}
