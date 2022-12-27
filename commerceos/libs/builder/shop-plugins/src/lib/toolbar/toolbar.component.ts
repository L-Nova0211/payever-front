import { ComponentType, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Output,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, pluck, tap } from 'rxjs/operators';

import { PebEditorAbstractToolbar } from '@pe/builder-abstract';
import {
  ObjectCategory,
  OVERLAY_DATA,
  OVERLAY_POSITIONS,
  OverlayData,
  OverlayDataValue,
  PebEditorMediaToolDialogComponent,
} from '@pe/builder-base-plugins';
import { PebEditorCommand, PebEditorState, PebElementType } from '@pe/builder-core';
import { EditorSidebarTypes, PebEditorStore } from '@pe/builder-services';
import { PebDeviceService } from '@pe/common';

@Component({
  selector: 'peb-shop-editor-toolbar',
  templateUrl: 'toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorShopToolbarComponent implements PebEditorAbstractToolbar {
  @Output() execCommand = new EventEmitter<PebEditorCommand>();

  public editorStore = this.injector.get(PebEditorStore);
  public deviceService = this.injector.get(PebDeviceService);
  public editorState = this.injector.get(PebEditorState);
  public cdr = this.injector.get(ChangeDetectorRef);
  private overlay = this.injector.get(Overlay);
  private elementRef = this.injector.get(ElementRef);
  isMobile: boolean;

  private overlayRef: OverlayRef;

  seoDialogOpened$ = this.editorState.misc$.pipe(
    pluck('seoSidebarOpened'),
    distinctUntilChanged(),
  );

  constructor(private injector: Injector) {
    this.isMobile = this.deviceService.isMobile;
  }

  get nativeElement() {
    return this.elementRef.nativeElement;
  }

  openMedia(element: HTMLElement) {
    const overlay: Observable<OverlayDataValue> = this.openOverlay(
      PebEditorMediaToolDialogComponent,
      element,
      null,
      'dialog-media-panel',
    );
    this.createElementAfterClose(overlay);
  }

  createTextElement(): void {
    this.execCommand.emit({
      type: 'createElement', params: {
        type: PebElementType.Text,
        data: { text: '<span>Your text</span>' },
        style: { width: '100%' },
      },
    });
  }

  private openOverlay<T>(
    component: ComponentType<T>,
    element: HTMLElement,
    data?: any,
    panelClass?: string,
  ): Observable<OverlayDataValue> {
    if (this.hasOverlayAttached()) {
      return undefined;
    }

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(element)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      panelClass: panelClass ? panelClass : 'dialog-publish-panel',
      disposeOnNavigation: true,
    });
    const emitter = new Subject<OverlayDataValue>();
    const emitter$ = emitter.asObservable();
    const injector = this.createInjector({ emitter, data });
    const portal = new ComponentPortal(component, null, injector);
    this.overlayRef.attach(portal);
    this.overlayRef.backdropClick().pipe(tap(() => this.detachOverlay())).subscribe();

    return emitter$;
  }

  private createElementAfterClose(overlay: Observable<OverlayDataValue>): void {
    overlay.pipe(
      tap(() => this.detachOverlay()),
    ).subscribe((element: OverlayDataValue) => {
      if ((element as ObjectCategory).type) {
        this.execCommand.emit({ type: 'createElement', params: element });
      }
    });
  }

  private createInjector(injectData: OverlayData): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(OVERLAY_DATA, injectData);

    return new PortalInjector(this.injector, injectionTokens);
  }

  private detachOverlay(): void {
    if (this.hasOverlayAttached()) {
      this.overlayRef.detach();
    }
  }

  private hasOverlayAttached(): boolean {
    return this.overlayRef && this.overlayRef.hasAttached();
  }

  openPageNavigation() {
    this.editorState.sidebarsActivity = {
      ...this.editorState.sidebarsActivity,
      [EditorSidebarTypes.Navigator]: !this.editorState.sidebarsActivity[EditorSidebarTypes.Navigator],
    };
  }
}
