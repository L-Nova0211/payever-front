import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';

import {
  PebAction,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  pebGenerateId,
  PebScreen,
  PebStylesheetEffect,
} from '@pe/builder-core';
import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';
import { PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';

import { PebEventType, PebPointerEventsService } from '../../pointer';
import { isAnchor, PeAnchorType, PebAnchorType } from '../anchors';
import { PebControlsService } from '../controls.service';
import { finalizeWithValue } from '../helpers';
import { PebSelectionBBox } from '../selection';
import { PebSelectionBBoxState } from '../selection.state';

@Injectable()
export class PebRadiusMoveService {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;

  mousedown$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mousedown && isAnchor(ev.target)),
  );

  mouseup$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mouseup),
  );

  mousemove$ = this.mousedown$.pipe(
    switchMap(mousedown => this.eventsService.events$.pipe(
      // filter(ev => false),
      filter(ev => ev.type === PebEventType.mousemove),
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      withLatestFrom(this.selection$, this.selectedElements$, this.screen$),
      map(([event, selection, elements, screen])=> {
        const childrenIds = [];
        elements.forEach(elm => {
          elm.children.forEach(ch=> childrenIds.push(ch.id));
        });

        return {
          event,
          elements: elements.filter(elm=> !childrenIds.includes(elm.id)),
          screen,
          selection,
        }
      }),
      filter(() => {
        const target = mousedown.target as PeAnchorType;
        const anchorType = target.type;

        return anchorType === PebAnchorType.Radius
      }),
      map(({ event, selection, elements, screen }) => {
        const target = mousedown.target as PeAnchorType;
        const anchorType = target.type;

        const halfWidth = selection.width / 2;
        const startX = selection.left;
        const greenX = event.x;
        const deltaX = greenX - startX;
        const percent = deltaX / (halfWidth / 100);
        const currentPercent = percent < 0 ? 0 : percent > 100 ? 100 : percent;
        const minDimension = Math.min(selection.width, selection.height) / 2;
        const percentPixels = Math.round(currentPercent * (minDimension / 100));

        const idFirstElement = elements[0].id;
        const element = this.tree.find(idFirstElement);
        element.styles.borderRadius = percentPixels;


        const controls = this.controlsService.createDefaultControlsSet(mousedown, elements.map(elm => this.tree.find(elm.id)));
        this.controlsService.renderControls(controls);

        return { anchorType, elements, screen };
      }),
      finalizeWithValue(({ elements, screen }) => {
        const page = this.editorStore.page;
        const effects: PebEffect[] = [];
        elements.forEach(elm => {

          const element = this.tree.find(elm.id);
          const { borderRadius } = element.styles;

          const payload =  { borderRadius };

          effects.push({
            type: PebStylesheetEffect.Update,
            target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
            payload: { [element.element.id]: payload },
          });
        });

        const action: PebAction = {
          effects,
          id: pebGenerateId('action'),
          targetPageId: this.editorStore.page.id,
          affectedPageIds: [this.editorStore.page.id],
          createdAt: new Date(),
        };

        this.editorStore.commitAction(action);

      }),
      takeUntil(this.mouseup$),
    )),
  );


  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly eventsService: PebPointerEventsService,
    private readonly controlsService: PebControlsService,
    private readonly editorStore: PebEditorStore

  ) {
    this.mousemove$.subscribe();
  }

}

