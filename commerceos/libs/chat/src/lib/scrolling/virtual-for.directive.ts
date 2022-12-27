import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { ChatScrollService } from '../chat.service';

@Directive({
  selector: '[peVirtualFor]',
})

export class VirtualForDirective {

  public items: any[];

  @Input()
  set peVirtualForOf(value: any) {
    this.items = value;
    this.chatScrollService.setInputItems$.next(this.items);
  }    

  constructor(
    public viewContainerRef: ViewContainerRef,
    public template: TemplateRef<any>,
    private chatScrollService: ChatScrollService,
  ) { }
}
