import { Directive, Input, ViewContainerRef } from '@angular/core';

import { PebAbstractElement } from '../../elements/_abstract/abstract.element';

@Directive({
  selector: '[pebRendererGridCellSlot]',
})
export class PebRendererGridCellSlot {
  @Input() index: number;
  @Input() length: number;
  @Input() grid: PebAbstractElement;

  constructor(public viewRef: ViewContainerRef) {
  }
}
