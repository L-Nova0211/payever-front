import { FlexibleConnectedPositionStrategyOrigin, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal } from '@angular/cdk/portal';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'pe-popup',
  template: `
    <ng-template cdkPortal>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class DropdownComponent implements OnInit {
  @Input() connectedTo: FlexibleConnectedPositionStrategyOrigin;

  @ViewChild(CdkPortal) contentTemplate: CdkPortal;

  protected overlayRef: OverlayRef;

  public open = false;

  constructor(protected overlay: Overlay) {}

  public show() {
    this.overlayRef = this.overlay.create(this.getOverlayConfig());
    this.overlayRef.attach(this.contentTemplate);
    // this.syncWidth();
    this.overlayRef.backdropClick().subscribe(() => this.hide());
    this.open = true;
  }

  public hide() {
    this.overlayRef.detach();
    this.open = false;
  }

  @HostListener('window:resize')
  public onResize() {
    this.syncWidth();
  }

  protected getOverlayConfig(): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.connectedTo)
      .withPush(false)
      .withViewportMargin(30)
      .withDefaultOffsetY(50)
      .withPositions([
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
      ]);

    return new OverlayConfig({
      positionStrategy: positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
  }

  private syncWidth() {
    if (!this.overlayRef) {
      return;
    }

    this.overlayRef.updateSize({ width: this.getWidth() });
  }

  private getWidth(): number {
    if (this.connectedTo instanceof Element) {
      return this.connectedTo.getBoundingClientRect().width;
    } else if (isElementRef(this.connectedTo)) {
      return this.connectedTo.nativeElement.getBoundingClientRect().width;
    }

    return this.connectedTo.width;
  }

  ngOnInit(): void {
  }
}

export const isElementRef = (value: unknown): value is ElementRef => !!(value as ElementRef).nativeElement;
