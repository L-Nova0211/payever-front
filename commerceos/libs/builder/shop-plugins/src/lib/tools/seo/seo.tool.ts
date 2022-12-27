import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { distinctUntilChanged, pluck } from 'rxjs/operators';

import { AbstractPebEditorTool } from '@pe/builder-base-plugins';

@Component({
  selector: 'peb-editor-seo-tool',
  templateUrl: './seo.tool.html',
  styleUrls: ['./seo.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorSeoTool extends AbstractPebEditorTool {

  seoDialogOpened$ = this.editorState.misc$.pipe(
    pluck('seoSidebarOpened'),
    distinctUntilChanged(),
  );

  constructor(injector: Injector) {
    super(injector);
  }

}
