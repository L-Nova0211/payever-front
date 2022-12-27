import { VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Directive, forwardRef, OnChanges, Input } from '@angular/core';

import { GridVirtualScrollStrategy } from '../classes/virtual-scroll-strategy.class';

export const gridScrollStrategyFactory = (directive: GridScrollStrategyDirective): VirtualScrollStrategy => {
  return directive.scrollStrategy;
};

@Directive({
  selector: 'cdk-virtual-scroll-viewport[columns]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: gridScrollStrategyFactory,
      deps: [forwardRef(() => GridScrollStrategyDirective)],
    },
  ],
})
export class GridScrollStrategyDirective implements OnChanges {

  @Input() columns: number;
  @Input() rowHeight: number;
  @Input() minBufferRows = 1;
  @Input() maxBufferRows = 5;

  get columnsValue(): number {
    return this.columns;
  }

  get rowHeightValue(): number {
    return this.rowHeight;
  }

  /** The scroll strategy used by this directive. */
  private readonly _scrollStrategy = new GridVirtualScrollStrategy(
    this.columnsValue,
    this.rowHeightValue,
    this.minBufferRows,
    this.maxBufferRows
  );

  get scrollStrategy(): VirtualScrollStrategy {
    return this._scrollStrategy;
  }

  ngOnChanges(): void {
    this.refreshScrollItems();
  }

  private refreshScrollItems(): void {
    this._scrollStrategy.updateItemAndBufferSize(
      this.columns,
      this.rowHeight,
      this.minBufferRows,
      this.maxBufferRows
    );
  }
}
