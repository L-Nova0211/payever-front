import {
  AfterViewChecked, ChangeDetectorRef,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Injector,
  QueryList,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { takeUntil, pairwise, filter, tap } from 'rxjs/operators';

import { PeGridService } from '../../grid.service';
import { MOBILE_ROW_HEIGHT, PeGridTableService } from '../../table/table.service';
import { PeGridViewportService } from '../../viewport';
import { PeGridView } from '../enums';

import { GridBaseItemClassDirective } from './base-item.class';

@Directive()
export class GridMobileRowClassDirective extends GridBaseItemClassDirective implements AfterViewChecked {

  @ContentChildren('contentRow') contentRowsRef: QueryList<TemplateRef<HTMLElement>>;
  @ContentChild('thumbnail', { static: true }) thumbnailRef: TemplateRef<HTMLElement>;
  @ContentChild('bottomLine', { static: true }) bottomLineRef: TemplateRef<HTMLElement>;
  @ViewChild('textBlock') textBlock: ElementRef<HTMLElement>;
  @ViewChild('rowRef') rowRef: ElementRef<HTMLElement>;

  protected tableService: PeGridTableService = this.injector.get(PeGridTableService);
  protected viewportService: PeGridViewportService = this.injector.get(PeGridViewportService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected gridService: PeGridService = this.injector.get(PeGridService);

  constructor(
    protected injector: Injector,
  ) {
    super(injector);

    this.viewportService.viewChange$.pipe(
      takeUntil(this.destroy$),
      pairwise(),
      filter(([prev, current]: PeGridView[]) => prev === PeGridView.List && current === PeGridView.Table),
      tap(() => {
        this.setRowHeight();
      })
    ).subscribe();
  }

  get theme(): string {
    return this.gridService.theme;
  }

  get isTableWidthScroll(): boolean {
    return this.viewportService.view === PeGridView.TableWithScroll;
  }

  ngAfterViewChecked(): void {
    if (
      !this.tableService.isMobile
      || this.viewportService.view === PeGridView.List
      || this.viewportService.view === PeGridView.BigList
    ) {
      return;
    }

    this.setRowHeight();
  }

  private setRowHeight(): void {
    const timeout = setTimeout(() => {
      if (!this.rowRef) {
        this.setRowHeight();

        return;
      }
      const rowHeight = this.rowRef?.nativeElement.offsetHeight || MOBILE_ROW_HEIGHT;
      this.tableService.mobileRowHeight$.next(rowHeight);

      clearTimeout(timeout);
    }, 300);
  }
}
