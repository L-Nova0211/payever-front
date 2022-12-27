import { Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, filter, takeUntil, throttleTime, pairwise, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PeGridService } from '../../grid.service';
import { PeGridQueryParamsService } from '../services/query-params.service';

@Directive({
  selector: 'div[pe-grid-infinite-scroll]',
  providers: [PeDestroyService],
})

export class InfiniteScrollDirective implements OnInit {
  @Input() wrapperRef: HTMLDivElement;
  @Output() scrolledToEnd = new EventEmitter<void>();

  dataLength = 0;
  initialHeight = 0;
  offsetTop = 0;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.initialHeight = 0;
    this.dataLength = 0;
  }

  constructor(
    private destroy$: PeDestroyService,
    private element: ElementRef,
    private gridQueryParamsService: PeGridQueryParamsService,
    private peGridService: PeGridService,
  ) {
  }

  get wrapperHeight(): number {
    return this.wrapperRef.offsetHeight;
  }

  ngOnInit(): void {
    this.initScrollListener();
    this.peGridService.items$.pipe(
      tap((items) => {
        if (items?.length <= this.dataLength) {
          this.initialHeight = 0;
          this.dataLength = 0;
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private initScrollListener(): void {
    if (this.element?.nativeElement) {

      fromEvent(this.element.nativeElement, 'scroll').pipe(
        map(() => {
          // this.gridQueryParamsService.scrollPositionToParams(this.element.nativeElement.scrollTop);

          return {
            scrollTop: this.element.nativeElement.scrollTop,
            height: this.wrapperHeight,
          };
        }),
        throttleTime(200),
        pairwise(),
        filter(([e1, e2]) => {
          if (e1.height !== e2.height || e2.scrollTop < e1.scrollTop) {
            return false;
          }

          const offsetTop = this.calcHeight(e2.height);

          return e2.scrollTop > offsetTop;
        }),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        const dataLength = this.peGridService.items.length;
        if (dataLength != this.dataLength) {
          this.scrolledToEnd.emit();
          this.dataLength = this.peGridService.items.length;
          this.initialHeight = this.wrapperHeight;
        }
      });
    }
  }

  private calcHeight(height: number): number {
    if (this.initialHeight < height && (height - this.initialHeight) > 100) {
      const newHeight = height - this.initialHeight;
      this.offsetTop = this.initialHeight + Math.ceil((newHeight / 100) * 25);
    }

    return this.offsetTop;
  }
}
