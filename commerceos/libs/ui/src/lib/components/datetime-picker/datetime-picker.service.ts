import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PE_DATEPICKER_CONFIG, PE_DATEPICKER_DATA, PE_DATEPICKER_THEME } from './constants';
import { PebDateTimePickerComponent } from './datetime-picker';
import { DatePickerConfig, PebOverlayConfigExtended } from './interfaces';

export class PeDatePickerRef {
  afterClosed = new Subject<any>();

  constructor(private overlayRef: OverlayRef) {}

  close(data?: any): void {
    this.overlayRef.dispose();

    this.afterClosed.next(data);
    this.afterClosed.complete();
  }
}

const DEFAULT_CONFIG: PebOverlayConfigExtended = {
  hasBackdrop: true,
  backdropClass: 'pe-datepicker-backdrop',
  panelClass: 'pe-datepicker-panel',
  position: {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'top',
  },
};

@Injectable({ providedIn: 'root' })
export class PeDateTimePickerService {
  private dialogRef: PeDatePickerRef;

  constructor(
    private injector: Injector,
    private overlay: Overlay,
  ) {}

  open(event: MouseEvent, config?: DatePickerConfig) {
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };
    const element = event.target;

    const datepickerRef = this.createOverlay(dialogConfig, element);
    this.dialogRef = new PeDatePickerRef(datepickerRef);
    this.attachDialogContainer(datepickerRef, dialogConfig, this.dialogRef);

    datepickerRef.backdropClick().subscribe(() => this.dialogRef.close());

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
    if (window.innerWidth >= 920 && !config.position?.offsetX) {
      config.position = { ...config.position, offsetX: 300 };
    }
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

  private attachDialogContainer(overlayRef: OverlayRef, config, dialogRef: PeDatePickerRef) {
    const injector = this.createInjector(config, dialogRef);

    const containerPortal = new ComponentPortal(PebDateTimePickerComponent, null, injector);
    const containerRef: ComponentRef<PebDateTimePickerComponent> = overlayRef.attach(containerPortal);
    containerRef.instance.apply$.pipe(
      take(1),
      tap((value) => dialogRef.close(value)),
      takeUntil(containerRef.instance.destroyed$)).subscribe();

    return containerRef.instance;
  }

  private createInjector(config, dialogRef: PeDatePickerRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(PeDatePickerRef, dialogRef);
    injectionTokens.set(PE_DATEPICKER_DATA, config.data);
    injectionTokens.set(PE_DATEPICKER_THEME, config.theme);
    injectionTokens.set(PE_DATEPICKER_CONFIG, config.config);

    return new PortalInjector(this.injector, injectionTokens);
  }
}
