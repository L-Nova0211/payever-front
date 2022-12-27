import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { Actions, Select, Store } from '@ngxs/store';
import { animationFrameScheduler, combineLatest, fromEvent, merge, Observable, ReplaySubject } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  retryWhen,
  share,
  shareReplay,
  startWith,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
  tap, throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import { PageSnapshot } from '@pe/builder-abstract';
import { PebElementsService, PebGridService } from '@pe/builder-controls';
import { PebPointerEventsService } from '@pe/builder-controls';
import { PebElementId, PebScreen, pebScreenDocumentWidthList } from '@pe/builder-core';
import {
  fromResizeObserver,
  PebAbstractElement,
  PebEditorOptionsAction,
  PebEditorOptionsState,
  PebRenderer,
  PebRendererOptions, PebRTree,
} from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebDeselectAllAction, PebElementSelectionState, PebSelectAction } from '@pe/builder-state';
import { PebDeviceService, PeDestroyService } from '@pe/common';

import { PebCopyAction, PebPasteAction } from './actions';
import { PebContextMenuService, PebEditorUtilsService } from './services';


@Component({
  selector: 'peb-editor-renderer',
  templateUrl: './editor-renderer.component.html',
  styleUrls: ['editor-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorRendererComponent {

  @ViewChild('editorRenderer', { read: ElementRef, static: true }) editorRenderer: ElementRef;
  @ViewChild('renderer', { read: PebRenderer, static: true }) renderer: PebRenderer;

  @Select(PebEditorOptionsState.scale) currentScale$!: Observable<number>;
  @Select(PebEditorOptionsState.scaleToFit) scaleToFit$!: Observable<boolean>;
  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebElementSelectionState.id) selectedElementIds$!: Observable<PebElementId[]>;
  @Select(PebEditorOptionsState.state) editorOptions$!: Observable<PebRendererOptions>;

  options$ = this.editorOptions$.pipe(take(1));

  iframe$ = new ReplaySubject<HTMLIFrameElement>(1);

  theme$: Observable<PageSnapshot> = combineLatest([
    this.editorUtilsService.constructPageSnapshot(this.editorStore.snapshot$, this.editorStore.page$, this.screen$),
    this.screen$,
  ]).pipe(
    map(([snapshot, screen]) => ({ snapshot, screen })),
    startWith(null),
    pairwise(),
    filter(([prev, curr]) => {
      return prev?.snapshot?.id !== curr.snapshot.id || prev?.screen !== curr.screen;
    }),
    map(([prev, curr]) => curr.snapshot),
    shareReplay(1),
  );

  scale$ = this.currentScale$.pipe(map(scale => `scale(${scale})`));

  width$ = this.screen$.pipe(map(screen => pebScreenDocumentWidthList[screen]));

  contentPadding$ = this.scaleToFit$.pipe(
    map((fit) => {
      const PADDING = 40;

      return {
        vertical: fit ? 10 : this.deviceService.isDesktop ? PADDING : 10,
        horizontal: fit ? 0 : this.deviceService.isDesktop ? PADDING : 0,
      };
    }),
    shareReplay(1),
  );

  padding$ = this.contentPadding$.pipe(
    map(padding => `${padding.vertical}px ${padding.horizontal}px`),
  );

  viewBox$: Observable<Partial<DOMRectReadOnly>> = this.iframe$.pipe(
    switchMap(() => fromResizeObserver(this.renderer.nativeElement)),
    filter(({ height }) => height > 0),
    takeUntil(this.destroy$),
  );

  dimensions$ = this.viewBox$.pipe(
    switchMap(({ width, height }) => this.currentScale$.pipe(
      map(scale => ({ width: width * scale, height: height * scale })),
    )),
    shareReplay(1),
  );

  origin$ = merge(
    this.dimensions$,
    this.iframe$.pipe(switchMap(iframe => fromEvent(iframe.contentWindow, 'resize'))),
  ).pipe(
    switchMap(() => combineLatest([this.iframe$, this.dimensions$, this.contentPadding$])),
    map(([iframe, { width, height }, padding]) => {
      const body = iframe.contentDocument.body;
      const bodyWidth = body.clientWidth || iframe.contentWindow.innerWidth;
      const bodyHeight = body.clientHeight || iframe.contentWindow.innerHeight;
      let x = 0;
      let y = 0;

      if (width < bodyWidth) {
        x = (bodyWidth - width) * 0.5 - padding.horizontal;
      }
      if (height < bodyHeight) {
        y = (bodyHeight - height) * 0.5;
      }

      return { x, y };
    }),
  );

  translate$ = this.origin$.pipe(
    distinctUntilChanged((a, b) => a.x === b.x && a.y === b.y),
    map(({ x, y }) => `translate(${x}px, ${y}px)`),
  );

  sections$ = this.tree.sections$;

  constructor(
    private actions$: Actions,
    private readonly editorAccessorService: PebEditorAccessorService,
    private readonly editorStore: PebEditorStore,
    private readonly editorUtilsService: PebEditorUtilsService,
    private readonly elmRef: ElementRef,
    private readonly destroy$: PeDestroyService,
    private readonly deviceService: PebDeviceService,
    private readonly store: Store,
    private readonly eventsService: PebPointerEventsService,
    private readonly gridService: PebGridService,
    private readonly elementsService: PebElementsService,
    private readonly contextMenuService: PebContextMenuService,
    private readonly tree: PebRTree<PebAbstractElement>,
  ) {
    this.theme$.pipe(
      map(theme => {
        const documentID = theme?.template?.id;
        const element = this.editorAccessorService.renderer.elementRegistry.get(documentID);

        if (!element.id) { throw new Error('Not Element'); }

        return documentID;
      }),
      tap(documentID => {
        this.store.dispatch(new PebSelectAction(documentID));
      }),
      retryWhen(errors => errors.pipe(
        delay(300),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onLoad(iframe: HTMLIFrameElement) {
    const doc = iframe.contentDocument;

    doc.open();
    doc.write(
      `<!DOCTYPE html><html><head><base href="/"></head><body spellcheck="false" class="scrollbar"></body></html>`
    );
    doc.close();

    const style = doc.createElement('style');
    style.innerText = `html, body {
      background: transparent !important;
      min-width: 100% !important;
      min-height: 100% !important;
    }
    html {
      overflow: hidden;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      box-sizing: border-box;
      overflow: auto !important;
      content-visibility: auto;
      user-select: none;
    }
    `;
    doc.head.appendChild(style);

    const obs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (['style', 'link'].includes(n.nodeName.toLowerCase())) {
            doc.head.appendChild(n.cloneNode(true));
          }
        });
      });
    });

    obs.observe(document.head, { childList: true });

    document.querySelectorAll('link, style').forEach((htmlElement) => {
      doc.head.appendChild(htmlElement.cloneNode(true));
    });

    doc.body.appendChild(this.editorRenderer.nativeElement);

    const scroll$ = fromEvent(iframe.contentDocument.body, 'scroll', { passive: true }).pipe(
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      map(() => ({
        top: 0 - iframe.contentDocument.body.scrollTop,
        left: 0 - iframe.contentDocument.body.scrollLeft,
      })),
      startWith({
        top: 0 - iframe.contentDocument.body.scrollTop,
        left: 0 - iframe.contentDocument.body.scrollLeft,
      }),
    );

    const origin$ = combineLatest([this.origin$, scroll$]).pipe(
      withLatestFrom(this.contentPadding$),
      tap(([[{ x, y }, { top, left }], { horizontal, vertical }]) => {
        this.eventsService.setOrigin(x + left + horizontal, y + top + vertical);
      }),
    );

    const scaleToFit$ = this.scaleToFit$.pipe(
      filter(Boolean),
      switchMapTo(this.screen$),
      tap((screen) => {
        const scale = doc.body.clientWidth / pebScreenDocumentWidthList[screen];
        this.store.dispatch(new PebEditorOptionsAction({ scale }));
      }),
    );

    const cursor$ = this.eventsService.cursor$.pipe(
      distinctUntilChanged(),
      filter(() => !!this.renderer.hitArea),
      tap((value) => {
        this.renderer.hitArea.nativeElement.style.cursor = value;
      }),
    );

    const keydown$ = merge(
      fromEvent<KeyboardEvent>(window, 'keydown').pipe(
        filter(() => !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())),
      ),
      fromEvent<KeyboardEvent>(iframe.contentWindow, 'keydown'),
    ).pipe(
      share(),
    );

    const metaKey$ = keydown$.pipe(
      filter((ev: KeyboardEvent) => ev.ctrlKey || ev.metaKey),
      map((ev: KeyboardEvent) => ev.key),
      share(),
    );

    const copyElement$ = metaKey$.pipe(
      filter(key => key === 'c'),
      tap(() => {
        this.store.dispatch(new PebCopyAction());
      }),
    );

    const pasteElement$ = metaKey$.pipe(
      filter(key => key === 'v'),
      tap(() => {
        this.store.dispatch(new PebPasteAction());
      }),
    );

    const deleteElement$ = keydown$.pipe(
      map((ev: KeyboardEvent) => ev.key),
      filter(key => ['Backspace', 'Delete'].includes(key)),
      withLatestFrom(this.selectedElementIds$, this.screen$),
      tap(([key, selectedElementIds, screen]) => {
        this.editorAccessorService.editorComponent.manipulateElementSubject$.next({
          selectedElements: selectedElementIds,
          type: 'delete',
          screen: screen,
        });
      }),
    );

    const undo$ = keydown$.pipe(
      filter((ev: KeyboardEvent) => ev.key === 'z' && !ev.shiftKey),
      tap((ev) => {
        ev.preventDefault();
        this.editorAccessorService.editorComponent.commands$.next({ type: 'undo' });
      }),
    );

    const redo$ = keydown$.pipe(
      filter((ev: KeyboardEvent) => ev.key === 'z' && ev.shiftKey),
      tap((ev) => {
        ev.preventDefault();
        this.editorAccessorService.editorComponent.commands$.next({ type: 'redo' });
      }),
    );

    const closePage$ = keydown$.pipe(
      filter((ev: KeyboardEvent) => ev.key === 'Escape' && ev.altKey),
      tap(() => {
        this.store.dispatch(new PebDeselectAllAction());
        this.editorStore.activatePage(null).subscribe();
      }),
    );

    const orientationChange$ = fromEvent(window, 'orientationchange').pipe(
      tap(() => {
        if (this.deviceService.isMobile) {
          this.deviceService.landscape = window.orientation === 90 || window.orientation === -90;
        }
      }),
    );

    merge(
      origin$,
      scaleToFit$,
      cursor$,
      copyElement$,
      pasteElement$,
      deleteElement$,
      undo$,
      redo$,
      closePage$,
      orientationChange$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

    this.eventsService.setContentElement(iframe);
    this.renderer.options = { ...this.renderer.options, contentDocument: doc };
    this.editorAccessorService.renderer = this.renderer;
    this.editorAccessorService.iframe = iframe;

    this.iframe$.next(iframe);
  }

  contextMenu($event: MouseEvent) {
    $event.preventDefault();

    this.contextMenuService.open($event);
  }
}
