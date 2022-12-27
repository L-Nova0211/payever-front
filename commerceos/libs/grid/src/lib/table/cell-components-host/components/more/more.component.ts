import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';

import { PeGridItem } from '@pe/common';

import { PeGridService } from '../../../../grid.service';

@Component({
  selector: 'pe-more-btn',
  template: `
    <ng-container *ngIf="item?.action?.more">
      <button #moreButton
        *ngIf="circleButton; else actionButton"
        class="pe-grid-item__more"
        (click)="this.actionClick.emit($event)">
        <mat-icon
          aria-hidden="false"
          svgIcon="more-icon"
        ></mat-icon>
      </button>
      <button
        *ngIf="item?.action?.label"
        class="cell-action {{theme}}"
        [style.backgroundColor]="item.action?.backgroundColor"
        [style.color]="item.action?.color"
        (click)="actionClick.emit($event)">
        <ng-container
          *ngIf="(item.isLoading$ | async) !== true"
        >
          ...
        </ng-container>
        <ng-container *ngIf="item.isLoading$ | async">
          <mat-spinner [strokeWidth]="2" [diameter]="16"></mat-spinner>
        </ng-container>
      </button>
    </ng-container>
  `,
  styleUrls: ['./more.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeGridTableMoreCellComponent {
  @Input() item: PeGridItem & { action: { more: boolean }};
  @Input() inMobile = false;
  @Input() circleButton: boolean;

  @Output() actionClick = new EventEmitter<PointerEvent>();

  @HostBinding('class.is-mobile') get mobile() {
    return this.inMobile;
  }

  get theme(): string {
    return this.gridService.theme;
  }

  constructor(
    private gridService: PeGridService,
  ) {
  }
}
