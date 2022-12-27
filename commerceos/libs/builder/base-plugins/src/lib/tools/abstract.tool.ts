import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, PortalInjector } from '@angular/cdk/portal';
import { ChangeDetectorRef, Directive, EventEmitter, Injector, Input, OnDestroy, Output } from '@angular/core';
import { merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PebEditorCommand, PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-services';
import { PebDeviceService } from '@pe/common';

import { ObjectCategory, OverlayData, OverlayDataValue, OVERLAY_DATA, OVERLAY_POSITIONS } from '../misc/overlay.data';


@Directive()
export abstract class AbstractPebEditorTool implements OnDestroy {
  @Output() execCommand = new EventEmitter<PebEditorCommand>();
  @Input() loading = false;

  protected editorStore = this.injector.get(PebEditorStore);
  protected overlayRef: OverlayRef;
  protected editorState = this.injector.get(PebEditorState);
  protected cdr = this.injector.get(ChangeDetectorRef);
  protected overlay = this.injector.get(Overlay);
  protected overlayData = OVERLAY_DATA;
  protected deviceService = this.injector.get(PebDeviceService);

  protected readonly destroy$ = new ReplaySubject<void>(1);
  readonly destroyed$: Observable<void> = this.destroy$.asObservable();

  protected constructor(
    protected injector: Injector,
  ) {
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  protected openOverlay<T, R = OverlayDataValue>(
    component: ComponentType<T>,
    element: HTMLElement,
    data?: any,
    panelClass?: string,
    backdropClass?: string,
  ): Observable<R> {
    const emitter: Subject<R> = new Subject();
    const emitter$: Observable<R> = emitter.asObservable();
    if (this.hasOverlayAttached()) {
      return emitter$;
    }

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(element)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      hasBackdrop: true,
      backdropClass: backdropClass ?? 'dialog-backdrop',
      panelClass: panelClass ? panelClass : 'dialog-publish-panel',
      disposeOnNavigation: true,
    });

    const injector = this.createInjector({
      emitter,
      data,
    });
    const portal = new ComponentPortal(component, null, injector);
    this.overlayRef.attach(portal);

    merge(
      this.overlayRef.backdropClick(),
      // fromEvent(this.injector.get(DOCUMENT), 'click').pipe(skip(1)),
      // fromEvent(this.injector.get(PebEditorAccessorService).renderer.contentDocument, 'click'),
    ).pipe(
      tap(v => console.log('EVENT', v)),
      take(1),
      tap(() => this.detachOverlay()),
    ).subscribe();

    return emitter$;
  }

  protected createInjector<T = OverlayData>(injectData: T): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(this.overlayData, injectData);

    return new PortalInjector(this.injector, injectionTokens);
  }

  protected detachOverlay(): void {
    if (this.hasOverlayAttached()) {
      this.overlayRef.detach();
    }
  }

  protected hasOverlayAttached(): boolean {
    return this.overlayRef && this.overlayRef.hasAttached();
  }

  protected createElementAfterClose(overlay: Observable<OverlayDataValue>): void {
    overlay.pipe(
      tap((element: OverlayDataValue) => {
        this.detachOverlay();
        if ((element as ObjectCategory).type) {
          this.execCommand.emit({ type: 'createElement', params: element });
        }
      }),
    ).subscribe();
  }
}
