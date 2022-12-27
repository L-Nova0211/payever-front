import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

import { PeGridService } from '../../../../grid.service';
import { PeGridItem } from '../../../../misc/interfaces';

@Component({
  selector: 'pe-badge',
  template: `
   <span class="cell-badge {{theme}}"
    [style.backgroundColor]="item.badge?.backgroundColor"
    [style.color]="item.badge?.color"
   >
     {{item.badge.label}}
   </span>
  `,
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeGridTableBadgeCellComponent {
  @Input() item: PeGridItem;
  @Input() inMobile = false;

  @Output() preview = new EventEmitter<PeGridItem>();

  @HostBinding('class.is-mobile') get mobile() {
    return this.inMobile;
  }

  get theme(): string {
    return this.gridService.theme;
  }

  constructor(
    private gridService: PeGridService
  ) {
  }
}
