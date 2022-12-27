import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

export interface PebOption<T = any> {
  name: string;
  value: T;
  iconTpl?: TemplateRef<any>;
  data?: any;
}

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-select-option-list',
  templateUrl: 'option-list.component.html',
  styleUrls: ['./option-list.component.scss'],
  providers: [
    PeDestroyService,
  ],
})
export class PebSelectOptionListComponent {

  @Input() active: any;
  @Input() options: PebOption[] | PebOption[][];
  @Output() selected = new EventEmitter<string>();

  constructor(public destroy$: PeDestroyService) {
  }

  isGroup(option): boolean {
    return Array.isArray(option);
  }

  isSelected(value): boolean {
    return Array.isArray(this.active) ? this.active.some(o => o === value) : this.active === value;
  }
}
