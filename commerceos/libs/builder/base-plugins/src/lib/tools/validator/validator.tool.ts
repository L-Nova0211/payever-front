import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { AbstractPebEditorTool } from '../abstract.tool';

@Component({
  selector: 'peb-editor-validator-tool',
  templateUrl: './validator.tool.html',
  styleUrls: ['./validator.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorValidatorTool extends AbstractPebEditorTool {

  constructor(injector: Injector) {
    super(injector);
  }

}
