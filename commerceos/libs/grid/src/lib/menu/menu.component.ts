import { AfterViewInit, Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { PeGridService } from '../grid.service';
import { PeGridMenu, PeGridMenuItem } from '../misc/interfaces';



@Component({
  selector: 'pe-grid-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class PeGridMenuComponent implements OnChanges, AfterViewInit {

  @HostBinding('class') get classObj() {
    return {
      [this.peGridService.theme]: this.peGridService.theme,
      [this.classList]: this.classList,
    };
  }

  @Input() menu: PeGridMenu;

  @Output() closeMenu = new EventEmitter<void>();
  @Output() selectedItem = new EventEmitter<PeGridMenuItem>();

  isSearchMenu = false;
  classList: string;
  menuItems: PeGridMenuItem[] = [];
  landscape = false;

  @HostListener('window:resize') onResize() {
    this.checkOrientation();
  }

  @HostBinding('class.is-landscape') get isLandscape() {
    return this.landscape;
  }

  constructor(
    private peGridService: PeGridService,
  ) {}

  ngAfterViewInit(): void {
    this.checkOrientation();
  }

  ngOnChanges(changes: SimpleChanges) {
    const { menu } = changes;
    if (menu?.currentValue) {
      this.setMenu(menu.currentValue);
    }
  }

  getIconPosition(position: 'start' | 'end'): string {
    return position ?? 'start';
  }

  selected(item: PeGridMenuItem): void {
    if (!this.isDisabled(item)) {
      this.selectedItem.emit(item);
      item.checked$?.next(true);
      if (item.onClick) {item.onClick();}
    }
  }

  setMenu(menu: PeGridMenu): void {
    this.menu = menu;
    this.menuItems = menu.items?.filter(item => !item.hidden) ?? [];
  }

  getDividers(item: PeGridMenuItem): { [key: string]: boolean } {
    const dividers  = item?.dividers?.reduce((acc, item) => ({
      ...acc,
      [`${item}-divider`]: true,
    }), {});

    return dividers ?? {};
  }

  onChange(item: PeGridMenuItem, checked: boolean) {
    if (this.isDisabled(item)) {
      return;
    }

    item.checked$?.next(checked);
  }

  isDisabled(item: PeGridMenuItem): boolean {
    return item?.disabled ?? false;
  }

  private checkOrientation(): void {
    setTimeout(() => {
      this.landscape = window.matchMedia('(orientation: landscape)').matches
      && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    });
  }
}
