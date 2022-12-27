import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { BehaviorSubject, from, fromEvent, Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';

import { PebAbstractElement, PebEditorOptionsState, PebRTree } from '@pe/builder-renderer';

import { CursorType, isAnchor, PeAnchorType } from '../selection/anchors';
import { PebAnchorsService } from '../selection/anchors.service';
import { PebRadiusAnchorsService } from '../selection/radius/radius-anchors.service';


export interface PebEvent {
  type: PebEventType;
  x: number;
  y: number;
  shiftKey: boolean;
  metaKey: boolean;
  target: PebAbstractElement | PeAnchorType;
}

export enum PebEventType {
  mousedown = 'mousedown',
  mousemove = 'mousemove',
  mouseup = 'mouseup',
  click = 'click',
  dblclick = 'dblclick',
}

export enum PebEvents {
  pointerdown = PebEventType.mousedown,
  pointermove = PebEventType.mousemove,
  pointerup = PebEventType.mouseup,
  click = PebEventType.click,
  dblclick = PebEventType.dblclick,
}

/**
 * Purpose of this class:
 *
 * For all mouse events need to transform position to renderer coordinate system
 * because zoom in editor is implemented using CSS transform scale property,
 * but all elements and they controls (selection borders, anchors, grid rulers etc.)
 * are rendered in not scaled renderer coordinate system.
 *
 * Elements manipulations like move, resize and relocate between parents are restricted by other elements.
 * Instead of traversing DOM to find intersections with siblings or parents, all elements dimensions are stored
 * in the RTree in renderer coordinate system, as it most efficient way to find intersections with other elements.
 *
 * Based on these two facts can make a conclusion, to handle all elements manipulations
 * is enough to have event listeners bind only on document and disable pointer events on renderer.
 * Also, as pointer events are completely disabled we can use passive event listeners ensuring a reliably
 * smooth scrolling experience for the use.
 *
 * Due mouse events clientX, clientY properties are read only they can't be overridden
 * with scaled and translated values and instead, new event should be initialized using properties
 * copied from original event. Copying properties are a a little tricky because Event object have circular references
 * and references to DOM elements. Can iterate over properties or use custom json serializer,
 * but actually to handle elements manipulations only event type and mouse position are needed (except
 * maybe multi-touch gestures case). Considering having original event object in event handlers does not add
 * any valuable improvements and requires additional resources with possible performance drop, just plain object with
 * event type and mouse position x, y in renderer coordinate system are returned.
 *
 * Issues:
 *
 * Bind events on document:
 *
 * Some of theme pages can have thousands of html elements and unfortunately, even with disabled pointer events,
 * browser can spend 30% of time and more on frequently recurring events like mousemove to determine objects
 * under cursor (Hit Test). Instead empty element should be placed on top to bind events.
 * Important to place it on top as overlay, because some DOM apis e.g. Document.elementFromPoint() still works with
 * disabled pointer events.
 *
 * Text editor events:
 *
 * Unfortunately, if use this approach it's not possible to edit text, first, you need to have pointer events
 * to be enabled on text editor to place cursor on click, and second, you need to lift up text editor above an overlay.
 * Due applied CSS transform on the renderer element it has different stack context, what means z-index won't work
 * between renderer's children and the overlay. In theory can place overlay inside renderer element,
 * which solves z-index problem, but in this case overlay size will take only renderer area and not space around,
 * what is important to select document element or select elements using rectangular selection tool, so overlay needs
 * to be resized manually which again can cause performance drop.
 *
 * Also, if you get text editor on top of overlay and enable pointer events, mouse events won't be dispatched
 * on the overlay, it's fine for text elements, but shapes can have nested child elements and still text editor
 * under them. If you lift up only text editor, you be not able to select child elements of shape as it covers
 * shape children, so need to change z-index for the shape element itself, and this prevents mouse events on overlay
 * and you still not be able to select shape children.
 *
 * Solution:
 *
 * Use two separate overlays instead of single one. First is appended as sibling before renderer element
 * to have events registered in editor area outside of renderer, and another one in the renderer.
 * Mouse events from both are dispatched to this class and emitted after scaled and translated
 * into renderer coordinates system. On mousemove pointer events are enabled for detected element under cursor
 * and it is lifted up above internal renderer overlay. Also mouse events are registered and will be dispatched
 * from element while element it is under cursor. When mouse position not inside element bounding anymore
 * pointer events on element are disabled, z-index reverted to previous value and mouse events detached.
 */
@Injectable()
export class PebPointerEventsService {

  @Select(PebEditorOptionsState.scale) private scale$!: Observable<number>;

  public cursor$ = new BehaviorSubject(CursorType.Default);

  private readonly origin$ = new ReplaySubject<{ x: number, y: number }>(1);

  private readonly dispatch$ = new ReplaySubject<PointerEvent>(1);

  private events = PebEvents;

  contentElement: HTMLIFrameElement;
  contentElement$ = new ReplaySubject<HTMLIFrameElement>(1);

  events$: Observable<PebEvent> = this.dispatch$.pipe(
    withLatestFrom(this.origin$, this.scale$),
    map(([event, origin, scale]) => {
      const x = (event.clientX - origin.x) / scale;
      const y = (event.clientY - origin.y) / scale;
      const { shiftKey, metaKey } = event;
      const bbox = { minX: x, minY: y, maxX: x, maxY: y };
      let [anchorTarget] = this.anchorService.search(bbox);
      let [radiusAnchorTarget] = this.radiusAnchorService.search(bbox);

      let target = radiusAnchorTarget || anchorTarget;

      if (!target) {
        const elements = this.tree.search(bbox).reduce((acc, elm) => {
          const parents = [elm];
          let parent = elm;
          while (parent.parent) {
            parent = parent.parent;
            parents.push(parent);
          }

          acc.set(elm, parents.length);

          return acc;
        }, new Map<PebAbstractElement, number>());

        const entries = [...elements.entries()];

        if (entries.length) {
          target = entries.sort((a, b) => b[1] - a[1])[0][0] as any;
        }
      }

      return { x, y, shiftKey, metaKey, target, type: this.events[event.type] };
    }),
    filter(ev => !!ev.target),
    tap(ev => {
      const cursor = isAnchor(ev.target) ? ev.target.cursor ?? CursorType.Default : CursorType.Default;
      this.setCursor(cursor);
    }),
    distinctUntilChanged((a, b) => a.type === b.type && a.x === b.x && a.y === b.y),
  );

  constructor(
    private readonly tree: PebRTree<PebAbstractElement>,
    private readonly anchorService: PebAnchorsService,
    private readonly radiusAnchorService: PebRadiusAnchorsService,
  ) {
  }

  setContentElement(iframe: HTMLIFrameElement) {
    this.contentElement = iframe;
    this.contentElement$.next(iframe);
    from(Object.keys(this.events)).pipe(
      mergeMap(event => fromEvent<PointerEvent>(this.contentElement.contentWindow, event, { passive: true })),
      tap((event) => {
        this.dispatch$.next(event);
      }),
    ).subscribe();
  }

  setOrigin(x: number, y: number) {
    this.origin$.next({ x, y });
  }

  setCursor(cursor: CursorType) {
    this.cursor$.next(cursor);
  }
}

