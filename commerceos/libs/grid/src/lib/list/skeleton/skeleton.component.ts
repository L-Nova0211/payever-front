import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { range } from 'lodash-es';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PeGridService } from '../../grid.service';
import { GridSkeletonColumnType, PeGridView } from '../../misc/enums';
import { PeGridTableDisplayedColumns } from '../../misc/interfaces';
import { PeGridViewportService } from '../../viewport';
import { PeGridListService } from '../list.service';

@Component({
  selector: 'pe-grid-list-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PeGridListSkeletonComponent {
  @Input() columns: number;

  displayColumnsData: PeGridTableDisplayedColumns[] = [];
  defaultShow = 4;

  constructor(
    private peGridViewportService: PeGridViewportService,
    public listService: PeGridListService,
    private peGridService: PeGridService,
    protected destroy$: PeDestroyService,
    private cdr: ChangeDetectorRef
  ) {
    this.listService.displayedColumns$.pipe(
      tap((columns) => {
        this.displayColumnsData = columns;
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  get theme(): string {
    return this.peGridService.theme;
  }

  get items(): [] {
    return range(this.columns * 2);
  }

  get isMobile(): boolean {
    return document.body.clientWidth <= 720;
  }

  get isListWithMobileView(): boolean {
    return this.peGridViewportService.view == PeGridView.ListWithMobile;
  }

  get isMobileListWithMobileView(): boolean {
    return this.isMobile && this.isListWithMobileView;
  }

  getSkeletonType(column: PeGridTableDisplayedColumns): GridSkeletonColumnType {
    return column?.skeletonColumnType ?? GridSkeletonColumnType.Line;
  }
}
