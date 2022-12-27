import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { EditorSidebarTypes } from '@pe/builder-services';

import { AbstractPebEditorTool } from '../abstract.tool';

@Component({
  selector: 'peb-editor-brush-tool',
  templateUrl: './brush.tool.html',
  styleUrls: ['./brush.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorBrushTool extends AbstractPebEditorTool {


  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  openShapes(): void {
    this.editorState.sidebarsActivity = {
      ...this.editorState.sidebarsActivity,
      [EditorSidebarTypes.Inspector]: !this.editorState.sidebarsActivity[EditorSidebarTypes.Inspector],
    };
  }
}
