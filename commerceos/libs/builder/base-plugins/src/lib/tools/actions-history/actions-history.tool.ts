import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AbstractPebEditorTool } from '../abstract.tool';

@Component({
  selector: 'peb-editor-actions-history-tool',
  templateUrl: './actions-history.tool.html',
  styleUrls: ['./actions-history.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorActionsHistoryTool extends AbstractPebEditorTool {

  isMobile = this.deviceService.isMobile;

  constructor(injector: Injector) {
    super(injector);
  }

  get canUndo$() {
    return combineLatest([
      this.editorStore.canUndo$,
      this.editorState.textEditorActive$,
    ]).pipe(
      switchMap(([canUndo, textEditor]) => {
        if (!textEditor) {
          return of(canUndo);
        }

        return textEditor.canUndo$;
      }),
    );
  }

  get canRedo$() {
    return combineLatest([
      this.editorStore.canRedo$,
      this.editorState.textEditorActive$,
    ]).pipe(
      switchMap(([canRedo, textEditor]) => {
        if (!textEditor) {
          return of(canRedo);
        }

        return textEditor.canRedo$;
      }),
    );
  }

}
