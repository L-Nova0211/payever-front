import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal } from '@angular/cdk/portal';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'peb-overlay',
  template: `<ng-template cdk-portal="">
    <ng-content></ng-content>
  </ng-template>`,
})
export class OverlayComponent {
  protected overlayRef: OverlayRef;

  @Input()
  public reference: ElementRef;

  @ViewChild(CdkPortal)
  public contentTemplate: CdkPortal;

  constructor(protected overlay: Overlay) {}

  @Output() showing: EventEmitter<boolean> = new EventEmitter<boolean>();

  public show(width) {
    const overlayRef = this.overlay.create(this.getOverlayConfig());
    const dialogRef = new SelectOverlayRef(overlayRef);

    overlayRef.updateSize({ width });

    overlayRef.attach(this.contentTemplate);
    overlayRef.backdropClick().subscribe(() => {
      dialogRef.close();
      this.showing.emit(false);
    });
    this.showing.emit(true);

    return dialogRef;
  }

  protected getOverlayConfig(): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.reference)
      .withPositions([
        new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }),
        new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'bottom' }),
      ])
      .withPush(false);

    return new OverlayConfig({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'peb-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
  }
}

export class SelectOverlayRef {
  constructor(private overlayRef: OverlayRef) {}

  close(): void {
    this.overlayRef.dispose();
  }
}
