import { Injectable, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, pairwise, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebAbstractTextElement } from '@pe/builder-abstract';
import { PebEventType, PebPointerEventsService, isAnchor, PebControlsService } from '@pe/builder-controls';
import { PebElementDef, PebElementType } from '@pe/builder-core';
import { PebElementSelectionState } from '@pe/builder-state';


@Injectable()
export class PebTextActivationService implements OnDestroy {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  private readonly destroyed$ = new Subject<void>();

  activate$ = this.eventService.events$.pipe(
    withLatestFrom(this.selectedElements$),
    pairwise(),
    map(([[prevEvent, prevSelected], [currEvent, currSelected]]) => {
      const prevTarget = (prevEvent.target as PebAbstractTextElement);
      const currTarget = (currEvent.target as PebAbstractTextElement);

      if (!isAnchor(prevTarget)
        && prevEvent.type === PebEventType.mousedown
        && prevSelected.some(item => currTarget.element?.id === item.id)
        && !isAnchor(currTarget)
        && currEvent.type === PebEventType.mouseup
        && currSelected.some(item => currTarget.element?.id === item.id)
        && [PebElementType.Shape, PebElementType.Text].includes(currTarget.element.type)) {
        return { element: currTarget, event: currEvent };
      }

      return null;
    }),
    filter(value => !!value && !value?.element?.editorEnabled),
    tap(({ element, event }) => {
      const controls = this.controlsService.createDefaultControlsSet([]);
      this.controlsService.renderControls(controls);
      element.activate(event);
    })
  );

  constructor(
    private eventService: PebPointerEventsService,
    private readonly controlsService: PebControlsService,
  ) {
    this.activate$.pipe(takeUntil(this.destroyed$)).subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }
}
