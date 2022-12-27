import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { range } from 'lodash-es';

import { PeGridService } from '../../grid.service';
import { GridSkeletonColumnType, PeGridView } from '../../misc/enums';
import { PeGridTableDisplayedColumns } from '../../misc/interfaces';
import { PeGridViewportService } from '../../viewport';
import { PeGridTableService } from '../table.service';

@Component({
  selector: 'pe-table-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss', './mobile-skeleton.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeGridTableSkeletonComponent {
  @Input() displayedColumns: PeGridTableDisplayedColumns[] = [];
  @Input() isMobile = false;

  constructor(
    private peGridViewportService: PeGridViewportService,
    private tableService: PeGridTableService,
    private viewportService: PeGridViewportService,
    private peGridService: PeGridService
  ) { }

  get theme(): string {
    return this.peGridService.theme;
  }

  get isSelectable(): boolean {
    return this.peGridViewportService.selectable;
  }

  get rows(): [] {
    return range(5);
  }

  get isTableWidthScroll(): boolean {
    return this.viewportService.view === PeGridView.TableWithScroll;
  }

  getWidth(column: PeGridTableDisplayedColumns, columnIndex: number): string {
    if (this.tableService.columnSizes.hasOwnProperty(columnIndex)) {
      return this.tableService.columnSizes[columnIndex];
    }

    return 'auto';
  }

  getSkeletonType(column: PeGridTableDisplayedColumns): GridSkeletonColumnType {
    return column?.skeletonColumnType ?? GridSkeletonColumnType.Line;
  }
}
