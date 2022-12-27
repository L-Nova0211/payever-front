import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Injector, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { PebScreen } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';

import { AbstractPebEditorTool } from '../abstract.tool';

import { PEB_PREVIEW_TOOL_DIALOG } from './preview.constant';

@Component({
  selector: 'peb-editor-preview-tool',
  templateUrl: './preview.tool.html',
  styleUrls: ['./preview.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorPreviewTool extends AbstractPebEditorTool {
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  screen: PebScreen;

  protected editorStore = this.injector.get(PebEditorStore);

  constructor(
    private dialog: MatDialog,
    @Inject(PEB_PREVIEW_TOOL_DIALOG) private pebPreviewDialog: Type<any>,
    private location: Location,
    injector: Injector,
  ) {
    super(injector);
    this.screen$.pipe(
      tap((screen) => {
        this.screen = screen;
      }),
    ).subscribe();
  }

  openPreview() {
    const path = this.location.path(true);
    const dialog = this.dialog.open(this.pebPreviewDialog, {
      position: {
        top: '0',
        left: '0',
      },
      height: '100vh',
      maxWidth: '100vw',
      width: '100vw',
      panelClass: 'themes-preview-dialog',
      data: {
        themeSnapshot: { pages: [this.editorStore.page], snapshot: this.editorStore.snapshot },
        screen: this.screen,
      },
    });
    dialog.afterClosed().pipe(
      first(),
      tap(() => this.location.replaceState(path)),
    ).subscribe();
  }
}
