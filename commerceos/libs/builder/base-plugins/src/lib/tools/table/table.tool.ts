import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { PebElementType } from '@pe/builder-core';

import { AbstractPebEditorTool } from '../abstract.tool';

@Component({
  selector: 'peb-editor-table-tool',
  templateUrl: './table.tool.html',
  styleUrls: ['./table.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorTableTool extends AbstractPebEditorTool {

  constructor(injector: Injector) {
    super(injector);
  }

  createGridElement() {
    this.execCommand.emit({
      type: 'createElement', params: {
        type: PebElementType.Grid,
        data: { variant: PebElementType.Grid },
        style: {},
      },
    });
  }
}
