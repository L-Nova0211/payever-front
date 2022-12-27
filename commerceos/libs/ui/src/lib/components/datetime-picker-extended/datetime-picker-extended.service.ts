import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { DatePickerConfig } from '../datetime-picker/interfaces';

import { PE_DATEPICKEREXT_DATA, PE_DATEPICKEREXT_THEME } from './constants';
import { PebDateTimePickerExtendedComponent } from './datetime-picker-extended';


export class PeDatePickerExtRef {
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
  backdropClass: 'pe-datepicker-extended-backdrop',
  panelClass: 'pe-datepicker-extanded-panel',
};

@Injectable({ providedIn: 'root' })
export class PeDateTimePickerExtendedService {
  private dialogRef: PeDatePickerExtRef;

  constructor(
    private injector: Injector,
    private overlay: Overlay,
  ) {
  }

  open(event: MouseEvent, config?: DatePickerConfig) {
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };
    const element = event.target;

    const datepickerRef = this.createOverlay(dialogConfig, element);
    this.dialogRef = new PeDatePickerExtRef(datepickerRef);
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
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(element)
      .withLockedPosition()
      .withPositions([new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' })]);

    return new OverlayConfig({
      positionStrategy,
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  private attachDialogContainer(overlayRef: OverlayRef, config, dialogRef: PeDatePickerExtRef) {
    const injector = this.createInjector(config, dialogRef);

    const containerPortal = new ComponentPortal(PebDateTimePickerExtendedComponent, null, injector);
    const containerRef: ComponentRef<PebDateTimePickerExtendedComponent> = overlayRef.attach(containerPortal);
    containerRef.instance.apply$.pipe(
      take(1),
      tap((value) => dialogRef.close(value)),
      takeUntil(containerRef.instance.destroyed$)).subscribe();

    return containerRef.instance;
  }

  private createInjector(config, dialogRef: PeDatePickerExtRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(PeDatePickerExtRef, dialogRef);
    injectionTokens.set(PE_DATEPICKEREXT_DATA, config.data);
    injectionTokens.set(PE_DATEPICKEREXT_THEME, config.theme);

    return new PortalInjector(this.injector, injectionTokens);
  }
}
