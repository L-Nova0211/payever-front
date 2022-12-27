import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';

import { PeGridService } from '../../../grid.service';
import { PeGridListService } from '../../../list/list.service';
import { PeGridViewportService } from '../../../viewport';
import { PeGridItem, PeGridItemColumn, PeGridTableDisplayedColumns } from '../../interfaces/grid.interface';

const DEFAULT_SHOW = 8;

@Component({
  selector: 'pe-grid-vertical-columns',
  templateUrl: './vertical-columns.component.html',
  styleUrls: ['./vertical-columns.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerticalColumnsComponent implements OnChanges {
  @Input() item: PeGridItem;
  @Input() isGridItem = true;
  @Input() excludeColumns: string[] = [];
  @Input() displayColumns: PeGridTableDisplayedColumns[] = [];

  isMoreOpen = false;
  defaultShow = DEFAULT_SHOW;

  constructor(
    public listService: PeGridListService,
    public peGridViewportService: PeGridViewportService,
    private peGridService: PeGridService,
    private cdr: ChangeDetectorRef
  ) {
  }

  get theme(): string {
    return this.peGridService.theme;
  }

  get isMobile(): boolean {
    return this.peGridViewportService.isMobile;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { displayColumns } = changes;

    if (displayColumns?.currentValue) {
      this.displayColumns == displayColumns.currentValue;
      this.defaultShow = this.isMobile ? DEFAULT_SHOW : this.displayColumns.length;

      this.cdr.markForCheck();
    }
  }

  isAvailableColumnsLength(columns: PeGridTableDisplayedColumns[]) {
    return columns.filter(column => this.isNotExcludeColumn(column.name))?.length ?? 0;
  }

  isNotExcludeColumn(columnName: string): boolean {
    return !this.excludeColumns.includes(columnName);
  }

  getCustomStyles(item: PeGridItem, columnName: string): {[key: string]: string} {
    return this.getCell(item, columnName)?.customStyles ?? {};
  }

  getCell(item: PeGridItem, columnName: string): PeGridItemColumn {
    return this.listService.transformColumns[item.id][columnName];
  }

  getValue(item: PeGridItem, columnName: string): any {
    return this.getCell(item, columnName)?.value;
  }

  getLabel(item: PeGridItem, columnName: string): any {
    return this.getCell(item, columnName)?.label;
  }

  onToggleMore(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    this.isMoreOpen = !this.isMoreOpen;
  }

}
