import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PE_CONTEXTMENU_DATA, PE_CONTEXTMENU_THEME } from './constants';
import { PebContextMenuComponent } from './context-menu';
import { ContextMenuConfig } from './interfaces';


export class PeContextMenuRef {
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
  backdropClass: 'pe-context-menu-backdrop',
  panelClass: 'pe-context-menu-panel',
}

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
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
];

@Injectable({ providedIn: 'root' })
export class PeContextMenuService {
  private dialogRef: PeContextMenuRef;

  constructor(
    private injector: Injector,
    private overlay: Overlay,
  ) {
  }

  open(event: MouseEvent, config?: ContextMenuConfig) {
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };

    const contextMenuRef = this.createOverlay(dialogConfig, event);
    this.dialogRef = new PeContextMenuRef(contextMenuRef);
    this.attachDialogContainer(contextMenuRef, dialogConfig, this.dialogRef);

    contextMenuRef.backdropClick().subscribe(() => this.dialogRef.close());

    return this.dialogRef;
  }

  private createOverlay(config, event): OverlayRef {
    const contextMenuConfig = this.createConfig(config, event);

    return this.overlay.create(contextMenuConfig);
  }

  private createConfig(config, event): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(event)
      .withFlexibleDimensions(false)
      .withViewportMargin(10)
      .withPositions(OVERLAY_POSITIONS);

    return new OverlayConfig({
      positionStrategy,
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  private attachDialogContainer(overlayRef: OverlayRef, config, dialogRef: PeContextMenuRef) {
    const injector = this.createInjector(config, dialogRef);

    const containerPortal = new ComponentPortal(PebContextMenuComponent, null, injector);
    const containerRef: ComponentRef<PebContextMenuComponent> = overlayRef.attach(containerPortal);
    containerRef.instance.select$.pipe(
      take(1),
      tap((value) => dialogRef.close(value)),
      takeUntil(containerRef.instance.destroyed$)).subscribe();

    return containerRef.instance;
  }

  private createInjector(config, dialogRef: PeContextMenuRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(PeContextMenuRef, dialogRef);
    injectionTokens.set(PE_CONTEXTMENU_DATA, config.data);
    injectionTokens.set(PE_CONTEXTMENU_THEME, config.theme);

    return new PortalInjector(this.injector, injectionTokens);
  }

}
