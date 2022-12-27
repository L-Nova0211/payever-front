import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input } from '@angular/core';

import { SHAPES_CONTEXT_DATA } from '../shapes.common';

@Component({
  selector: 'peb-shapes-context-menu',
  templateUrl: './shapes-context-menu.component.html',
  styleUrls: ['./shapes-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShapesContextMenuComponent {

  @Input() options: Array<{
    title: string,
    onClick: () => void,
  }>;

  readonly onClose = new EventEmitter();

  constructor(
    @Inject(SHAPES_CONTEXT_DATA) public data: any,
  ) {
    this.options = data.options ?? [];
  }
}
