import {
  Component, ElementRef, EventEmitter,
  HostBinding, HostListener, Injector, Input, Output, QueryList, ViewChildren,
} from '@angular/core';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { GridMobileRowClassDirective } from '../../misc/classes/mobile-row.class';
import { PeGridItem, PeGridItemColumn, PeGridTableDisplayedColumns } from '../../misc/interfaces';
import { PeGridViewportService } from '../../viewport';
import { PeGridTableService } from '../table.service';

@Component({
  selector: 'pe-table-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss', './mobile-row.scss'],
  providers: [PeDestroyService],
})
export class PeGridTableRowComponent extends GridMobileRowClassDirective {
  @Input() disableContextMenu = false;

  @Output() rowClicked = new EventEmitter<PeGridItem>();
  @Output() actionClick = new EventEmitter<PeGridItem>();
  @ViewChildren('elemItem', { read: ElementRef }) elemItems: QueryList<ElementRef>;

  displayColumnsData: PeGridTableDisplayedColumns[] = [];
  isMobile = document.body.clientWidth <= 720;

  @HostBinding('style.display') display = 'contents';

  @HostListener('contextmenu', ['$event']) onContextMenu(e: PointerEvent) {
    if (this.disableContextMenu) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.openContextMenu(e);
  }

  get theme(): string {
    return this.gridService.theme;
  }

  constructor(
    protected destroy$: PeDestroyService,
    public tableService: PeGridTableService,
    public peGridViewportService: PeGridViewportService,
    protected injector: Injector,
  ) {
    super(injector);

    merge(
      this.tableService.displayedColumns$.pipe(
        tap((columns) => this.displayColumnsData = columns),
      ),
      this.viewportService.isMobile$.pipe(
        tap(isMobile => this.isMobile = isMobile),
      ),
    ).pipe(
      tap(() => this.cdr.markForCheck()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  isFirstRow(item: PeGridItem): boolean {
    return this.tableService.firstRow?.id == item.id;
  }

  isLastRow(item: PeGridItem): boolean {
    return this.tableService.lastRow?.id == item.id;
  }

  getWidth(columnIndex: number): string {
    if (this.tableService.columnSizes.hasOwnProperty(columnIndex)) {
      return this.tableService.columnSizes[columnIndex];
    }

    return 'auto';
  }

  getCell(item: PeGridItem, columnName: string): PeGridItemColumn {
    if (!this.tableService.transformColumns[item.id]) {

      return null;
    }

    return this.tableService.transformColumns[item.id][columnName] ?? null;
  }

  getValue(item: PeGridItem, columnName: string): any {
    return this.getCell(item, columnName)?.value;
  }

}
