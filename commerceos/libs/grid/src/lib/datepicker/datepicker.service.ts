import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PeGridMenuPosition } from '../misc/enums';
import { PeGridMenuConfig } from '../misc/interfaces';

import { PeGridDatepickerComponent } from './datepicker.component';

@Injectable({ providedIn: 'root' })
export class PeGridDatepickerService {

  overlayClosed$ = new Subject<Date>();

  overlayRef: OverlayRef;
  globalOverlayRef: OverlayRef;

  constructor(
    private overlay: Overlay,
  ) { }

  open(
    element: HTMLInputElement,
    config?: PeGridMenuConfig
  ): void {
    this.overlayRef = this.overlay.create({
      minWidth: config?.minWidth ?? 267,
      hasBackdrop: true,
      backdropClass: 'pe-grid-datepicker__backdrop',
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(element)
        .withDefaultOffsetX(config?.offsetX ?? 0)
        .withDefaultOffsetY(config?.offsetY ?? 0)
        .withPositions([this.getPositions(config?.position)]),
    });

    const menuPortal = new ComponentPortal(PeGridDatepickerComponent);
    const menuRef: ComponentRef<PeGridDatepickerComponent> = this.overlayRef.attach(menuPortal);

    merge(
      menuRef.instance.selectedDate.pipe(
        take(1),
        tap((date: Date) => {
          this.close(date);
        }),
      ),
      menuRef.instance.closed.pipe(
        take(1),
        tap(() => { this.close(); }),
      ),
      this.overlayRef.backdropClick().pipe(
        take(1),
        tap(() => { this.close(); }),
      ),
    ).subscribe();
  }

  close(date?: Date): void {
    this.overlayClosed$.next(date ?? undefined);
    this.overlayRef.dispose();
  }

  private getPositions(position: PeGridMenuPosition): ConnectedPosition { // TODO Remove copypaste
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
