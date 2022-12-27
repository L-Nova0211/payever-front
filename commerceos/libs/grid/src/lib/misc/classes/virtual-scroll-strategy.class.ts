import { CdkVirtualScrollViewport, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export class GridVirtualScrollStrategy implements VirtualScrollStrategy {

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  scrolledIndexChange: Observable<number>;

  /** The attached viewport. */
  private _viewport: CdkVirtualScrollViewport | undefined;

  private readonly _scrolledIndexChange = new Subject<number>();

  constructor(
    private _columns: number,
    private _rowHeight: number,
    private _minBufferRows: number,
    private _maxBufferRows: number
  ) {
    this.scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
  }

  /**
   * @docs-private Implemented as part of VirtualScrollStrategy.
   * Attaches this scroll strategy to a viewport.
   * @param viewport The viewport to attach this strategy to.
   */
  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /**
   * @docs-private Implemented as part of VirtualScrollStrategy.
   * Detaches this scroll strategy from the currently attached viewport.
   */
  detach(): void {
    this._scrolledIndexChange.complete();
    this._viewport = undefined;
  }

  /**
   * @docs-private Implemented as part of VirtualScrollStrategy.
   * Called when the viewport is scrolled (debounced using requestAnimationFrame).
   */
  onContentScrolled(): void {
    if (this._viewport) {
      this._updateRenderedRange();
    }
  }

  /**
   * @docs-private Implemented as part of VirtualScrollStrategy.
   * Called when the length of the data changes.
   */
  onDataLengthChanged(): void {
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /**
   * @docs-private Implemented as part of VirtualScrollStrategy.
   * Called when the range of items rendered in the DOM has changed.
   */
  onContentRendered(): void {
    //
  }

  /**
   * @docs-private Implemented as part of VirtualScrollStrategy.
   * Called when the offset of the rendered items changed.
   */
  onRenderedOffsetChanged(): void {
    //
  }

  /**
   * @docs-private Implemented as part of VirtualScrollStrategy.
   * Scroll to the offset for the given index.
   * @param index The index of the element to scroll to.
   * @param behavior The ScrollBehavior to use when scrolling.
   */
  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (this._viewport) {
      this._viewport.scrollToOffset(index * this._rowHeight, behavior);
    }
  }

  updateItemAndBufferSize(
    columns: number,
    rowHeight: number,
    minBufferRows: number,
    maxBufferRows: number
  ): void {
    if (maxBufferRows < minBufferRows) {
      throw Error('CDK virtual scroll: maxBufferItems must be greater than or equal to minBufferItems');
    }

    this._columns = columns;
    this._rowHeight = rowHeight;
    this._minBufferRows = minBufferRows;
    this._maxBufferRows = maxBufferRows;

    this._updateTotalContentSize();
  }

  /** Update the viewport's total content size. */
  private _updateTotalContentSize(): void {
    if (this._viewport) {
      const dataLength = this._viewport.getDataLength();
      const height = (dataLength / this._columns) * this._rowHeight;
      this._viewport.setTotalContentSize(height);
    }
  }

  /** Update the viewport's rendered range. */
  private _updateRenderedRange(): void {
    if (!this._viewport) {
      return;
    }

    const scrollOffset = this._viewport.measureScrollOffset('top');
    const firstVisibleIndex = Math.floor(scrollOffset / this._rowHeight) * this._columns;
    const renderedRange = this._viewport.getRenderedRange();
    const newRange = { ...renderedRange };
    const viewportSize = this._viewport.getViewportSize();
    const dataLength = this._viewport.getDataLength();
    const minBufferPx = this._minBufferRows * this._rowHeight;
    const maxBufferPx = this._maxBufferRows * this._rowHeight;
    const startBuffer = scrollOffset - (newRange.start / this._columns) * this._rowHeight;

    if (startBuffer < minBufferPx && newRange.start !== 0) {
      const expandStart = Math.ceil((maxBufferPx - startBuffer) / this._rowHeight) * this._columns;
      newRange.start = Math.max(0, newRange.start - expandStart);
      newRange.end = Math.min(
        dataLength,
        Math.ceil(firstVisibleIndex + (viewportSize + minBufferPx) / this._rowHeight * this._columns)
      );
    } else {
      const endBuffer = (newRange.end / this._columns) * this._rowHeight - (scrollOffset + viewportSize);

      if (endBuffer < minBufferPx && newRange.end !== dataLength) {
        const expandEnd = Math.ceil((maxBufferPx - endBuffer) / this._rowHeight) * this._columns;
        if (expandEnd > 0) {
          newRange.end = Math.min(dataLength, newRange.end + expandEnd);
          newRange.start = Math.max(0, Math.floor(firstVisibleIndex - (minBufferPx / this._rowHeight * this._columns)));
        }
      }
    }

    this._viewport.setRenderedRange(newRange);
    this._viewport.setRenderedContentOffset((newRange.start / this._columns) * this._rowHeight);
    this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
  }
}

