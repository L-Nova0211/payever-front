import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PeGridItem } from '@pe/grid';

@Component({
  selector: 'pe-text-info-cell',
  template: `
    <div>
      <span>{{ item[this.key] }}</span>
    </div>
  `,
  styleUrls: ['./text-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeGridTableTextInfoCellComponent {
  @Input() item: PeGridItem;
  @Input() key: string;
}
