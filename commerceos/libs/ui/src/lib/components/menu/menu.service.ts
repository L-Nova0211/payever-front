import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PE_MENU_DATA, PE_MENU_THEME } from './constants';
import { MenuConfig } from './interfaces';
import { PebMenuComponent } from './menu';

export class PeMenuRef {
  afterClosed = new Subject<any>();

  constructor(private overlayRef: OverlayRef) {}

  close(data?: any): void {
    this.overlayRef.dispose();

    this.afterClosed.next(data);
    this.afterClosed.complete();
  }
}

const DEFAULT_CONFIG: OverlayConfig = {
  hasBackdrop: true,
  panelClass: 'pe-menu-panel',
};

const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
];

@Injectable({ providedIn: 'root' })
export class PeMenuService {
  private dialogRef: PeMenuRef;

  constructor(
    private injector: Injector,
    private overlay: Overlay) {
  }

  open(element: MouseEvent, config?: MenuConfig) {
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };

    const menuRef = this.createOverlay(dialogConfig, element);
    this.dialogRef = new PeMenuRef(menuRef);
    this.attachDialogContainer(menuRef, dialogConfig, this.dialogRef);

    menuRef.backdropClick().subscribe(() => this.dialogRef.close());

    return this.dialogRef;
  }

  private createOverlay(config, element): OverlayRef {
    const contextMenuConfig = this.createConfig(config, element);

    return this.overlay.create(contextMenuConfig);
  }

  private createConfig(config, element): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(element.target)
      .withFlexibleDimensions(false)
      .withViewportMargin(10)
      .withPositions(OVERLAY_POSITIONS)
      .withDefaultOffsetY(10);

    return new OverlayConfig({
      positionStrategy,
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  private attachDialogContainer(overlayRef: OverlayRef, config, dialogRef: PeMenuRef) {
    const injector = this.createInjector(config, dialogRef);

    const containerPortal = new ComponentPortal(PebMenuComponent, null, injector);
    const containerRef: ComponentRef<PebMenuComponent> = overlayRef.attach(containerPortal);
    containerRef.instance.select$.pipe(
      take(1),
      tap((value) => dialogRef.close(value)),
      takeUntil(containerRef.instance.destroyed$)).subscribe();

    return containerRef.instance;
  }

  private createInjector(config, dialogRef: PeMenuRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(PeMenuRef, dialogRef);
    injectionTokens.set(PE_MENU_DATA, config.data);
    injectionTokens.set(PE_MENU_THEME, config.theme);

    return new PortalInjector(this.injector, injectionTokens);
  }
}
