import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { tap, takeUntil } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import {
  PeGridMenuConfig,
  PeGridMenuPosition,
  PeGridMenu,
  PeGridMenuService,
  PeGridMenuItem,
} from '@pe/grid';

import { PeContactsContactStatusEnum } from '../../enums';

export interface MoreContextSelect {
  menuItem: PeGridMenuItem;
}

export interface MoreApprove {
  backgroundColor: string;
  color: string;
  label: string;
}

@Component({
  selector: 'pe-item-more',
  templateUrl: './item-more.component.html',
  styleUrls: ['./item-more.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeItemMoreComponent {
  @Input() approve: MoreApprove;
  @Input() moreMenus: PeGridMenu;
  @Input() status: string;

  public contactStatusEnum = PeContactsContactStatusEnum;

  @Output() moreContextSelect = new EventEmitter<MoreContextSelect>();

  constructor(
    private menuService: PeGridMenuService,
    private readonly destroy$: PeDestroyService,
  ) { }

  public onMore(element: ElementRef<any>): void {
    const config: PeGridMenuConfig = {
      ...this.getMenuConfig(4, 14, PeGridMenuPosition.RightBottom, 110),
      classList: 'item-more-menu',
    };
    const menu: PeGridMenu = {
      items: this.moreMenus.items.map((a) => {
        return {
          label: a.label,
          color: a.color,
          value: a.value,
        };
      }),
    };

    const moreMenu$ = this.menuService.open(element, menu, config);

    moreMenu$?.pipe(
      tap((item) => {
        if (item) {
          this.moreContextSelect.emit({
            menuItem: item,
          })
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private getMenuConfig(offsetX = 0, offsetY = 0, position: PeGridMenuPosition, minWidth?: number): PeGridMenuConfig {
    const config: PeGridMenuConfig = {
      offsetX,
      offsetY,
      position,
    }

    return minWidth ? { minWidth, ...config } : config;
  }
}
