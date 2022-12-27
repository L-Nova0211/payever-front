import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, ElementRef, Injectable } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PeGridMenuPosition } from '../misc/enums';
import { PeGridMenu, PeGridMenuConfig, PeGridMenuItem } from '../misc/interfaces';

import { PeGridMenuComponent } from './menu.component';


@Injectable({ providedIn: 'root' })
export class PeGridMenuService {

  overlayClosed$ = new Subject<PeGridMenuItem>();

  overlayRef: OverlayRef;
  globalOverlayRef: OverlayRef;

  constructor(
    private overlay: Overlay,
  ) { }

  open(
    element: HTMLInputElement | ElementRef,
    menu: PeGridMenu,
    config?: PeGridMenuConfig
  ): Subject<any> {

    const menuClosed$ = new Subject<PeGridMenuItem>();

    this.overlayRef = this.overlay.create({
      minWidth: config?.minWidth ?? 267,
      maxHeight: 448,
      hasBackdrop: true,
      backdropClass: 'pe-grid-menu__backdrop',
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(element)
        .withDefaultOffsetX(config?.offsetX ?? 0)
        .withDefaultOffsetY(config?.offsetY ?? 0)
        .withPositions([this.getPositions(config?.position)]),
    });

    const menuPortal = new ComponentPortal(PeGridMenuComponent);
    const menuRef: ComponentRef<PeGridMenuComponent> = this.overlayRef.attach(menuPortal);

    if (config?.classList) {
      menuRef.instance.classList = config.classList;
    }

    menuRef.instance.setMenu(menu);

    merge(
      menuRef.instance.selectedItem.pipe(
        take(1),
        tap((item: PeGridMenuItem) => {
          menuClosed$.next(item);
          this.close(item);
        }),
      ),
      menuRef.instance.closeMenu.pipe(
        take(1),
        tap(() => { this.close(); }),
      ),
      this.overlayRef.backdropClick().pipe(
        take(1),
        tap(() => { this.close(); }),
      ),
    ).subscribe();

    return menuClosed$;
  }

  openSearch(menu: PeGridMenu): OverlayRef {
    const overlayRef: OverlayRef = this.overlay.create({
      width: '100%',
      height: 'calc(100% - 32px)',
      disposeOnNavigation: true,
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      backdropClass: 'pe-grid-menu__search-backdrop',
    });
    const menuPortal = new ComponentPortal(PeGridMenuComponent);
    const menuRef = overlayRef.attach(menuPortal);

    menuRef.instance.setMenu(menu);
    menuRef.instance.isSearchMenu = true;
    menuRef.instance.closeMenu
      .pipe(
        take(1),
        tap(() => overlayRef.detach())
      ).subscribe();

    return overlayRef;
  }

  openContextMenu(event: PointerEvent, menu: PeGridMenu, moreButton?): Subject<any> {
    if (!menu) {
      return;
    }

    const connectedTo = moreButton ?? { x: event.x, y: event.y };
    const contextMenuClosed$ = new Subject<PeGridMenuItem>();
    const overlayRef: OverlayRef = this.overlay.create({
      minWidth: 267,
      disposeOnNavigation: true,
      hasBackdrop: true,
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(connectedTo)
        .withViewportMargin(8)
        .withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        }]),

      backdropClass: 'pe-grid-menu__backdrop',
    });
    const menuPortal = new ComponentPortal(PeGridMenuComponent);
    const menuRef = overlayRef.attach(menuPortal);

    menuRef.instance.setMenu(menu);
    merge(
      overlayRef.backdropClick()
        .pipe(
          take(1),
          tap(() => {
            contextMenuClosed$.next();
            overlayRef.detach();
          }),
        ),
      menuRef.instance.closeMenu
        .pipe(
          take(1),
          tap(() => {
            contextMenuClosed$.next();
            overlayRef.detach();
          })
        ),
      menuRef.instance.selectedItem
        .pipe(
          take(1),
          tap((item: PeGridMenuItem) => {
            contextMenuClosed$.next(item);
            overlayRef.detach();
          }),
        )
    ).subscribe();

    return contextMenuClosed$;
  }

  close(item?: PeGridMenuItem): void {
    this.overlayClosed$.next(item ?? undefined);
    this.overlayRef.dispose();
  }

  private getPositions(position: PeGridMenuPosition): ConnectedPosition {
    switch (position) {
      case PeGridMenuPosition.LeftBottom:
        return { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' };
      case PeGridMenuPosition.LeftTop:
        return { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' };
      case PeGridMenuPosition.RightBottom:
        return { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' };
    }
  }
}
