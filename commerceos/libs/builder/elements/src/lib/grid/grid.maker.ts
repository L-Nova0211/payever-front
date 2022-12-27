import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import isEqual from 'lodash/isEqual';
import { combineLatest, EMPTY, merge, Observable } from 'rxjs';
import {
  filter,
  finalize,
  map,
  mapTo,
  pairwise,
  repeat,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { PebContextService } from '@pe/builder-context';
import {
  isImageContext,
  isIntegrationAction,
  isIntegrationData,
  MediaType,
  PebElementContext,
  PebElementContextState,
  PebFilterConditionType,
  PebFunctionType,
  PebIntegrationAction,
  PebIntegrationActionTag,
  PebIntegrationTag,
} from '@pe/builder-core';
import { PebAbstractElement } from '@pe/builder-renderer';
import { PebEditorAccessorService } from '@pe/builder-services';
import { PebTextEditorService } from '@pe/builder-text-editor';


@Component({
  selector: 'peb-element-grid-maker',
  templateUrl: './grid.maker.html',
  styleUrls: ['./grid.maker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PebTextEditorService,
  ],
})
export class PebGridMakerElement extends PebAbstractElement implements AfterViewInit {

  @ViewChild('gridRef') gridRef: ElementRef<HTMLDivElement>;
  @ViewChild('gridEnd') gridEnd: ElementRef<HTMLDivElement>;

  protected contextApi = this.injector.get(PebContextService);
  protected editorAccessorService = this.injector.get(PebEditorAccessorService);

  get isContext(): boolean {
    return !this.element.children.length;
  }

  get mappedStyles() {
    const styles = this.styles;

    return {
      host: {
        position: 'absolute',
        height: `${styles.height}px`,
        width: `${styles.width}px`,
        top: `${styles.top}px`,
        left: `${styles.left}px`,
        zIndex: styles.zIndex ?? null,
      },
      gridRef: {
        position: 'absolute',
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateColumns: styles.gridTemplateColumns.map(v => `${v}px`).join(' '),
        gridTemplateRows: styles.gridTemplateRows.map(v => `${v}px`).join(' '),
        overflowY: this.options.readOnly ? this.data?.fullHeight ? 'hidden' : 'auto' : null,
        overflowX: this.options.readOnly ? 'hidden' : null,
      },
      gridWrapper: {
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      },
    };
  }

  allItemsFetched: boolean;
  clones: ComponentRef<PebAbstractElement>[] = [];
  contextLoading: boolean;
  scrollGridRef: Function;

  private virtualElements = new Map<ComponentRef<PebAbstractElement>, { [index: number]: ViewRef }>();

  showVirtualElements(value: boolean, index: number) {
    // console.log(value);
    // this.clones.forEach((elm) => {
    //   const viewContainerRef = elm.instance.childrenSlot;
    //
    //   if (!value) {
    //     const viewRef = viewContainerRef.detach(index);
    //   }
    //
    //   if (!value && !this.virtualElements.has(elm)) {
    //
    //
    //     console.log('REMOVING');
    //     // this.virtualElements.set(elm, []);
    //     const viewRefs = [];
    //     const viewRef = viewContainerRef.detach(index);
    //     viewRefs.push(viewRef);
    //     // const viewRefs = [];
    //     // for (let i = 0; i < viewContainerRef.length; i += 1) {
    //     //   const viewRef = viewContainerRef.detach(i);
    //     //   // console.log(viewRef);
    //     //   viewRefs.push(viewRef);
    //     // }
    //     // console.log(viewRefs);
    //     this.virtualElements.set(elm, viewRefs);
    //   }
    //
    //   if (value && this.virtualElements.has(elm)) {
    //     // console.log(this.virtualElements.get(elm));
    //     this.virtualElements.get(elm).forEach((viewRef, i) => {
    //       // console.log(viewRef);
    //       viewContainerRef.insert(viewRef, i);
    //       this.virtualElements.delete(elm);
    //     });
    //   }
    // });
    // console.log(this.virtualElements);
  }

  ngAfterViewInit(): void {
    const renderer = this.editorAccessorService.renderer;
    const elViewInjector = renderer.createElementInjector();

    const cloneElement = (
      elm: PebAbstractElement,
      slot: ViewContainerRef,
      context: PebElementContext<any>,
      index: number
    ) => {
      const elViewFactory = renderer.factories[elm.element.type];
      const elCmpRef = elViewFactory.create(elViewInjector);

      const elmContext = context.data[index]
        ? { data: context.data[index], state: PebElementContextState.Ready }
        : { state: PebElementContextState.Empty };

      if (!elm.options.readOnly || elmContext.state !== PebElementContextState.Empty) {
        if (isIntegrationData(elm.data.functionLink) && isImageContext(elm.data.functionLink)) {
          elm.styles.backgroundImage = null;
        }

        const properties = {
          element: elm.element,
          data: elm.data,
          styles: elm.styles,
          context: elmContext,
          fetcher: elm.fetcher,
          options: { ...elm.options },
        };

        Object.assign(elCmpRef.instance, properties);
        slot.insert(elCmpRef.hostView);

        combineLatest([elm.data$, elm.style$, elm.context$]).pipe(
          mapTo(elm),
          tap((elm) => {
            elCmpRef.instance.data = elm.data;
            elCmpRef.instance.styles = elm.styles;
            elCmpRef.instance.context = elmContext;
          }),
          takeUntil(elCmpRef.instance.destroy$),
        ).subscribe();

        elm.children.forEach(e => cloneElement(e, elCmpRef.instance.childrenSlot, context, index));
      }

      return elCmpRef;
    }

    function applyContext(element: PebAbstractElement, context: PebElementContext<any>, index: number) {
      element.context = context.state === PebElementContextState.Ready
        ? { data: context.data[index], state: context.state }
        : { state: context.state };

      if (isIntegrationData(element.data.functionLink) && isImageContext(element.data.functionLink)) {
        const imageUrl = element.context?.data?.['imagesUrl']?.[0];
        element.styles = {
          ...element.styles,
          backgroundImage: imageUrl ?? null,
          mediaType: imageUrl ? MediaType.Image : MediaType.None,
        }
      }

      element.children.forEach(child => applyContext(child, context, index));
    }

    this.context$.pipe(
      tap((context: PebElementContext<any>) => {
        if (!this.contextLoading) {
          this.clones.forEach(clone => clone.destroy());
          this.clones = [];
        }
        if (context?.state === PebElementContextState.Ready) {
          const originalCount = 1;
          const cellCount = (this.data.rowCount * this.data.colCount);
          const existingClonesCount = this.clones.length;
          const clonesCount = cellCount - existingClonesCount - originalCount;

          if (this.children[0]) {
            Array.from({ length: clonesCount }, (_, i) => {
              const index = existingClonesCount + i + originalCount;
              const clone = cloneElement(this.children[0], this.childrenSlot, context, index);

              this.clones.push(clone);
            });
            applyContext(this.children[0], context, 0);
          }
          if (this.options.readOnly && !this.contextLoading) {
            this.contextLoading = true;
            this.onScrollGrid();
          }
          this.detectChanges();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    const getIntegrationAction = (prev, curr, isSortOrFilter?: boolean) => {
      if (curr?.functionLink?.functionType === PebFunctionType.Action) {
        const { integration, method } = (curr.functionLink as PebIntegrationAction);
        const action = integration.actions.find(i => i.method === method);
        const prevCount = prev.colCount * prev.rowCount;
        const currCount = curr.colCount * curr.rowCount;
        const contextLength = this.context?.data?.length;
        const update = currCount > prevCount && currCount > contextLength;
        const pagination = update
          ? { offset: contextLength, limit: currCount - contextLength }
          : { offset: 0, limit: currCount };
        const ids = [ ...curr?.context?.productsIds ?? [], ...curr?.context?.categoriesIds ?? [] ];
        const filter = ids.length ? [{ field: 'id', fieldCondition: PebFilterConditionType.In, value: ids }] : [];
        const order = [
          ...this.rendererContext['@product-filters']?.data ?? [],
          ...this.rendererContext['@product-sort']?.data ?? [],
        ];

        return (!isEqual(prev.context, curr.context) || !isEqual(prev.functionLink, curr.functionLink)) || update || isSortOrFilter
          ? { integrationAction: { integration, action, pagination, filter, order, data: ids }, update }
          : null;
      }

      this.context = { state: PebElementContextState.Empty };

      applyContext(this.children[0], this.context, 0);

      return null;
    }

    merge(
      this.editorAccessorService.renderer.context$.pipe(
        pairwise(),
        filter(([prev, curr]) => {
          const sort = '@product-sort';
          const filters = '@product-filters';

          return !isEqual(prev[sort], curr[sort]) || !isEqual(prev[filters], curr[filters]);
        }),
        withLatestFrom(this.data$),
        map(([context, data]) => getIntegrationAction(data, data, true)),
      ),
      this.data$.pipe(pairwise(), map(([prev, curr]) => getIntegrationAction(prev, curr)))
    ).pipe(
      filter(value => !!value),
      switchMap(({ integrationAction, update }) =>
        this.contextApi.fetchIntegrationAction(integrationAction).pipe(
          tap((context) => {
            const result = (context?.result ? context.result : context) ?? [];
            const isMax = context?.totalCount >= this.context?.data?.length + result.length;

            this.contextLoading = false;
            this.context = {
              data: update ? [ ...this.context.data, ...isMax ? result : [] ] : result,
              state: PebElementContextState.Ready,
            };

            applyContext(this.children[0], this.context, 0);
          }),
        ),
      ),
      takeUntil(this.destroy$),
    ).subscribe();

    if (this.data.fullHeight && this.options.interactions && isPlatformBrowser(this.platformId)) {
      this.createIntersectionObserver().pipe(
        filter(({ entries, observer }) => entries.some(entry => entry.isIntersecting)),
        take(1),
        switchMap(() => this.appendItems(true)),
        repeat(),
        takeUntil(this.destroy$),
      ).subscribe();
    }

    if (this.options.readOnly) {
      this.scrollGridRef = this.renderer.listen(this.gridRef.nativeElement, 'scroll', e => this.onScrollGrid(e));
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.options.readOnly) {
      this.scrollGridRef();
    }
  }

  private createIntersectionObserver(): Observable<any> {
    let obs: IntersectionObserver;

    return new Observable((source) => {
      obs = new IntersectionObserver((entries, observer) => {
        source.next({ entries, observer });
      }, { rootMargin: '0px' });
      obs.observe(this.gridEnd.nativeElement);
    }).pipe(
      finalize(() => obs?.disconnect()),
    );
  }

  private onScrollGrid(event?) {
    const gridRef = event?.path?.[0] ?? this.gridRef.nativeElement;

    if (gridRef) {
      const pos = gridRef.scrollTop + gridRef.offsetHeight;
      const max = gridRef.scrollHeight;

      if (pos === max) {
        const functionLink = this.data.functionLink;

        if (this.data.context?.productsIds?.length) {
          this.allItemsFetched = this.data.context.productsIds.length === this.context.data.length;
        }

        if (this.fetcher
          && isIntegrationAction(functionLink)
          && !functionLink.tags.includes(PebIntegrationActionTag.GetFilters)) {
          this.appendItems();
        }
      }
    }
  }

  private appendItems(updateHeight?: boolean) {
    let rowCount = 3;

    const contextLength = this.context.data.length;
    const currCount = this.data.colCount * (this.data.rowCount + rowCount);

    const appendRows = () => {
      const gridTemplateRows = this.styles.gridTemplateRows;
      const row = gridTemplateRows[gridTemplateRows.length - 1];

      const diff = this.context.data.length - currCount;

      if (diff < 0) {
        rowCount = rowCount - Math.floor(Math.abs(diff) / this.data.colCount);
      }

      this.data.rowCount += rowCount;
      this.styles.gridTemplateRows = Array.from({ length: this.data.rowCount }).fill(row) as number[];
      if (updateHeight) {
        const gridHeight = row * this.data.rowCount;

        this.parent.styles.height = gridHeight + this.parent.styles.height - this.styles.height;
        this.styles.height = gridHeight;
      }
    };

    if (currCount - contextLength <= 0) {
      appendRows();

      return EMPTY;
    }

    if (!this.allItemsFetched) {
      return this.fetcher({ 4: { offset: contextLength, limit: currCount - contextLength } }).pipe(
        tap((result) => {
          if (result?.data?.length) {
            this.context = {
              data: [ ...this.context.data, ...result.data ],
              state: PebElementContextState.Ready,
            };

            appendRows();
          } else {
            this.allItemsFetched = true;
          }
        }),
      ).toPromise();
    }

    return EMPTY;
  }
}
