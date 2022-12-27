import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PE_TIMEPICKER_CONFIG } from './constants';
import { PebOverlayConfigExtened, PebTimePickerOverlayConfig } from './interfaces';
import { PebTimePickerComponent } from './time-picker/time-picker.component';


export class PeTimePickerRef {
  afterClosed = new Subject<any>();

  constructor(private overlayRef: OverlayRef) {}

  close(data?: any): void {
    this.overlayRef.dispose();
    this.afterClosed.next(data);
    this.afterClosed.complete();
  }
}

const DEFAULT_CONFIG: PebOverlayConfigExtened = {
  hasBackdrop: true,
  backdropClass: 'pe-timepicker-backdrop',
  panelClass: 'pe-timepicker-panel',
  position: {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
};

@Injectable({ providedIn: 'root' })
export class PebTimePickerService {
  private dialogRef: PeTimePickerRef;

  constructor(private overlay: Overlay) {}

  open(event: MouseEvent, config?: PebTimePickerOverlayConfig) {
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };
    const element = event.target;
    const timepickerRef = this.createOverlay(dialogConfig, element);
    this.dialogRef = new PeTimePickerRef(timepickerRef);
    this.attachDialogContainer(timepickerRef, dialogConfig, this.dialogRef);

    timepickerRef.backdropClick().subscribe(() => this.dialogRef.close());

    return this.dialogRef;
  }

  close() {
    this.dialogRef.close();
  }

  private createOverlay(config, element): OverlayRef {
    const datepickerConfig = this.createConfig(config, element);

    return this.overlay.create(datepickerConfig);
  }

  private createConfig(config, element): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(element)
      .withLockedPosition()
      .withPositions([config.position]);

    return new OverlayConfig({
      positionStrategy,
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  private attachDialogContainer(overlayRef: OverlayRef, config, dialogRef: PeTimePickerRef) {
    const injector = this.createInjector(config, dialogRef);

    const containerPortal = new ComponentPortal(PebTimePickerComponent, null, injector);
    const containerRef: ComponentRef<PebTimePickerComponent> = overlayRef.attach(containerPortal);

    containerRef.instance.timeSet$.pipe(
      take(1),
      tap((time) => {
        this.dialogRef.close(time);
      }),
    ).subscribe();

    return containerRef.instance;
  }

  private createInjector(config, dialogRef: PeTimePickerRef): Injector {
    return Injector.create([
      { provide: PeTimePickerRef, useValue: dialogRef },
      { provide: PE_TIMEPICKER_CONFIG, useValue: { ...config.timeConfig, theme: config.theme } },
    ]);
  }
}
