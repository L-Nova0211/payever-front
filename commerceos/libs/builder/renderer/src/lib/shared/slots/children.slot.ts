import { Directive, Input, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[pebRendererChildrenSlot]',
})
export class PebRendererChildrenSlot {
  @Input('pebRendererChildrenSlot')
  name = '';

  constructor(
    public viewRef: ViewContainerRef,
  ) {}
}
