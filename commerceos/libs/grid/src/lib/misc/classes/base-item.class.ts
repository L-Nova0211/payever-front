import { Directive, EventEmitter, Injector, Input, Output } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { tap, takeUntil, filter } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PeGridService } from '../../grid.service';
import { PeGridMenuService } from '../../menu/menu.service';
import { PeGridMenu, PeGridItem, PeGridItemContextSelect } from '../../misc/interfaces';
import { PeGridInnerAction } from '../enums/menu.enum';


@Directive()
export class GridBaseItemClassDirective {
  @Input() item: PeGridItem;
  @Input() allowPreview = false;
  @Input() viewAction = true;
  @Input() itemContextMenu: PeGridMenu;
  @Input() showLoader$ = new BehaviorSubject<boolean>(false);

  @Output() actionClick = new EventEmitter<PeGridItem>();
  @Output() itemClick = new EventEmitter<PeGridItem>();
  @Output() preview = new EventEmitter<PeGridItem>();
  @Output() itemContextSelect = new EventEmitter<PeGridItemContextSelect>();

  protected menuService: PeGridMenuService = this.injector.get(PeGridMenuService);
  protected readonly destroy$: PeDestroyService = this.injector.get(PeDestroyService);
  protected gridService: PeGridService = this.injector.get(PeGridService);

  constructor(protected injector: Injector) {}

  get theme(): string {
    return this.gridService.theme;
  }

  openContextMenu(clickEvent: PointerEvent, moreButton?): void {
    let contextMenu = { ...this.itemContextMenu };
    if (this.item.action?.more) {
      contextMenu = contextMenu ?? { items: [] };
      contextMenu.items = [...contextMenu.items.filter(item => item.value !== PeGridInnerAction.InnerAction)];

      if (this.item.action.label) {
        contextMenu.items.unshift({
          label: this.item.action.label,
          value: PeGridInnerAction.InnerAction,
        });
      }
    }
    if (this.item.hideMenuItems) {
      this.item.hideMenuItems.forEach(({ hide, value }) => {
        contextMenu = contextMenu ?? { items: [] };
        contextMenu.items = [...contextMenu.items.filter(menuItem => !(menuItem.value === value && hide))];
      });
    }
    if (this.item.disabledMenuItems) {
      this.item.disabledMenuItems.forEach(({ disable, value }) => {
        contextMenu = contextMenu ?? { items: [] };
        contextMenu.items.map((item) => {
          item.disabled = item.value === value && !!disable;
       });
      });
    }


    const contextMenuEvent$ = this.menuService.openContextMenu(
      clickEvent,
      contextMenu,
      moreButton
    ) ?? of(null);

    contextMenuEvent$
      .pipe(
        filter((menuItem) => !!menuItem),
        tap((menuItem) => {
          switch (menuItem.value) {
            case PeGridInnerAction.InnerAction:
              this.actionClick.emit(this.item);
              break;
            default:
              this.itemContextSelect.emit({
                gridItem: this.item,
                menuItem: menuItem,
              });
              break;
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }
}
