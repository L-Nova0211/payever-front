import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';

import { PE_PASSWORDTIP_DATA } from './constants';
import { PeTooltipModalComponent } from './password-tooltip/password-tootip-modal';

export class PePasswordTooltipRef {
  afterClosed = new Subject<any>();

  constructor(private overlayRef: OverlayRef) {}

  close(data?: any): void {
    this.overlayRef.dispose();

    this.afterClosed.next(data);
    this.afterClosed.complete();
  }

  isClose(): any {
    return this.overlayRef.overlayElement ? false : true;
  }
}

@Injectable({ providedIn: 'root' })
export class PePasswordTooltipService {
  private dialogRef: PePasswordTooltipRef;

  constructor(private injector: Injector, private overlay: Overlay) {}

  /** Opens password check */
  open(element, data) {
    const tooltipRef = this.createOverlay(element);
    this.dialogRef = new PePasswordTooltipRef(tooltipRef);
    this.attachDialogContainer(tooltipRef, data, this.dialogRef);

    tooltipRef.backdropClick().subscribe(() => this.dialogRef.close());

    return this.dialogRef;
  }

  close() {
    this.dialogRef.close();
  }

  private createOverlay(element): OverlayRef {
    const tooltipConfig = this.createConfig(element);

    return this.overlay.create(tooltipConfig);
  }

  private createConfig(element): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(element)
      .withLockedPosition()
      .withPositions([
        new ConnectionPositionPair({ originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' }),
      ])
      .withDefaultOffsetY(8);

    return new OverlayConfig({
      positionStrategy,
      hasBackdrop: false,
      backdropClass: 'pe-password-tootip-backdrop',
      panelClass: 'pe-password-tootip-panel',
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  private attachDialogContainer(overlayRef: OverlayRef, data, dialogRef: PePasswordTooltipRef) {
    const injector = this.createInjector(data, dialogRef);

    const containerPortal = new ComponentPortal(PeTooltipModalComponent, null, injector);
    const containerRef: ComponentRef<PeTooltipModalComponent> = overlayRef.attach(containerPortal);

    return containerRef.instance;
  }

  private createInjector(data, dialogRef: PePasswordTooltipRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(PePasswordTooltipRef, dialogRef);
    injectionTokens.set(PE_PASSWORDTIP_DATA, data);

    return new PortalInjector(this.injector, injectionTokens);
  }
}
