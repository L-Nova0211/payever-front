import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

import { PeGridService } from '../../../../grid.service';
import { PeGridItem } from '../../../../misc/interfaces/grid.interface';

@Component({
  selector: 'pe-action-btn',
  template: `
   <button
    *ngIf="item?.action?.label"
    class="cell-action {{theme}}"
    [style.backgroundColor]="item.action?.backgroundColor"
    [style.color]="item.action?.color"
    (click)="actionClicked($event, item)">
     <ng-container
       *ngIf="(item.isLoading$ | async) !== true"
     >
       {{ item.action?.label | translate }}
     </ng-container>
     <ng-container *ngIf="item.isLoading$ | async">
       <mat-spinner [strokeWidth]="2" [diameter]="16"></mat-spinner>
     </ng-container>
   </button>
  `,
  styleUrls: ['./action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeGridTableActionCellComponent {
  @Input() item: PeGridItem;
  @Input() inMobile = false;

  @Output() actionClick = new EventEmitter<PeGridItem>();

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

  public actionClicked(event: PointerEvent, item: PeGridItem): void {
    event.stopPropagation();
    this.actionClick.emit(item);
  }
}
