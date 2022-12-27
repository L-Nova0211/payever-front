import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';

import { PE_HEADERMENU_DATA, PE_HEADERMENU_THEME } from './constants';
import { PeHeaderMenuComponent } from './header-menu';
import { PeHeaderMenuRef } from './header-menu-ref.model';
import { HeaderMenuConfig } from './interfaces';

const DEFAULT_CONFIG: OverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'pe-header-menu-backdrop',
  panelClass: 'pe-header-menu-panel',
};

@Injectable({ providedIn: 'root' })
export class PeHeaderMenuService {
  private dialogRef: PeHeaderMenuRef;

  constructor(private injector: Injector, private overlay: Overlay) {}

  open(config?: HeaderMenuConfig) {
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };

    const menuRef = this.createOverlay(dialogConfig);
    this.dialogRef = new PeHeaderMenuRef(menuRef);
    this.attachDialogContainer(menuRef, dialogConfig, this.dialogRef);

    menuRef.backdropClick().subscribe(() => this.dialogRef.close());

    return this.dialogRef;
  }

  private createOverlay(config): OverlayRef {
    const contextMenuConfig = this.createConfig(config);

    return this.overlay.create(contextMenuConfig);
  }

  private createConfig(config): OverlayConfig {
    const positionStrategy = this.overlay.position().global().centerHorizontally().centerVertically();

    return new OverlayConfig({
      positionStrategy,
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  private attachDialogContainer(overlayRef: OverlayRef, config, dialogRef: PeHeaderMenuRef) {
    const injector = this.createInjector(config, dialogRef);

    const containerPortal = new ComponentPortal(PeHeaderMenuComponent, null, injector);
    const containerRef: ComponentRef<PeHeaderMenuComponent> = overlayRef.attach(containerPortal);

    return containerRef.instance;
  }

  private createInjector(config, dialogRef: PeHeaderMenuRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(PeHeaderMenuRef, dialogRef);
    injectionTokens.set(PE_HEADERMENU_DATA, config.data);
    injectionTokens.set(PE_HEADERMENU_THEME, config.theme);

    return new PortalInjector(this.injector, injectionTokens);
  }
}
