import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { PebPointerEventsService } from '@pe/builder-controls';
import { PebElementDef, PebElementType, PebScreen } from '@pe/builder-core';
import { ElementManipulation } from '@pe/builder-old';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import { EditorContextMenuComponent } from '@pe/builder-shared';
import { PebElementSelectionState } from '@pe/builder-state';

import { PebInsertAction } from '../actions';


export const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
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
];


@Injectable({ providedIn: 'any' })
export class PebContextMenuService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  private overlayRef: OverlayRef;

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    private readonly editorAccessorService: PebEditorAccessorService,
    private readonly eventsService: PebPointerEventsService,
    private readonly overlay: Overlay,
    private readonly store: Store,
  ) {
  }

  open($event: MouseEvent) {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo({
          x: $event.clientX,
          y: $event.clientY,
        })
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
    });

    this.overlayRef.backdropClick().pipe(
      take(1),
      tap(() => this.overlayRef.dispose()),
    ).subscribe();

    this.selectedElements$.pipe(
      take(1),
      filter((selectedElements) => {
        const isAccessType = selectedElements.every(el => el.type !== PebElementType.Document);

        return isAccessType;
      }),
      switchMap(() => {
        const component = this.overlayRef.attach(new ComponentPortal(EditorContextMenuComponent));

        return component.instance.event.pipe(
          withLatestFrom(this.eventsService.events$, this.screen$, this.selectedElements$),
          tap(([value, event, screen, selectedElements]) => {
            const selectedElementsIds = selectedElements.map(selectedElement => selectedElement.id);

            if (value === 'addSection') {
              this.store.dispatch(new PebInsertAction());
            }

            if (value === 'delete' || value === 'group' || value === 'ungroup') {
              const elementManipulation: ElementManipulation = {
                screen,
                selectedElements: selectedElementsIds,
                type: value,
              };

              this.editor.manipulateElementSubject$.next(elementManipulation);
            }

            this.overlayRef.dispose();
          }),
        );
      })
    ).subscribe();
  }

}
