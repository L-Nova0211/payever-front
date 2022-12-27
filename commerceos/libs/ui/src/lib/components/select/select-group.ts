import {
  Component,
  ContentChildren,
  HostBinding,
  Input,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';

import { SelectOptionComponent } from './select-option';

@Component({
  selector: 'peb-select-group',
  template: `
    <div class="pe-select-group">
      <div class="pe-group-container">
        <span class="pe-select-label">{{ label }}</span>
      </div>
      <ng-content select="peb-select-option"></ng-content>
    </div>
  `,
  styleUrls: ['./select-group.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SelectGroupComponent {
  @Input()
  public label: string;

  @ContentChildren(SelectOptionComponent)
  public options: QueryList<SelectOptionComponent>;

  @HostBinding('class.border') border = true;
}
