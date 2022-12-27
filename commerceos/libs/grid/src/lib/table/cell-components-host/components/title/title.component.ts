import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PeGridItem, PeGridItemColumnData } from '@pe/grid';

@Component({
  selector: 'pe-title-cell',
  template: `
    <div>
      <svg *ngIf="item.type === 'item' && item.icon" class="icon icon-18"><use
        [attr.xlink:href]="item.icon"></use></svg>
      <img *ngIf="item.type === 'item' && !item.icon && item.image"
           class="{{ data?.titleImageStyle }}" [src]="item.image">
      <mat-icon *ngIf="item.type === 'folder'" svgIcon="folder-icon"></mat-icon>
      <span>{{ item.title }}</span>
    </div>
  `,
  styleUrls: ['./title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeGridTableTitleCellComponent {
  @Input() item: PeGridItem;
  @Input() data: PeGridItemColumnData;
}
