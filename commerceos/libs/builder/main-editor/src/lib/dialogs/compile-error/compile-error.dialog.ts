import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'peb-editor-compile-error-dialog',
  templateUrl: 'compile-error.dialog.html',
  styleUrls: ['./compile-error.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorCompileErrorDialog {
  onReloadClick() {
    window.location.reload();
  }
}
