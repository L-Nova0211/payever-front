import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxsModule } from '@ngxs/store';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { PeHelpfulService, PreloaderState } from '@pe/common';
import { PeFoldersModule } from '@pe/folders';
import { I18nModule } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PebCheckboxModule } from '@pe/ui';

import { PeGridContentComponent } from './content/content.component';
import { PeGridDatepickerComponent } from './datepicker/datepicker.component';
import { PeGridComponent } from './grid.component';
import { PeGridItemComponent } from './list/item/item.component';
import { PeGridListItemComponent } from './list/list-item/list-item.component';
import { PeGridListComponent } from './list/list.component';
import { MobileItemCellComponentHostComponent } from './list/mobile-item/cell-components-host/cell-components-host';
import { PeGridMobileItemComponent } from './list/mobile-item/mobile-item.component';
import { PeGridListSkeletonComponent } from './list/skeleton/skeleton.component';
import { PeGridMenuComponent } from './menu/menu.component';
import { PeGridMaterialComponent } from './misc/components/material/material.component';
import { PeGridMoveOverviewComponent } from './misc/components/move-overview/move-overview';
import { VerticalColumnsComponent } from './misc/components/vertical-columns/vertical-columns.component';
import { ActiveScrollDirective, InfiniteScrollDirective } from './misc/directives';
import { GridScrollStrategyDirective } from './misc/directives';
import { PeDisplayColumnsSortPipe } from './misc/pipes/display-columns-sort.pipe';
import { PeMoveOverviewService } from './misc/services/move-overview.service';
import { PeGridSidenavComponent } from './sidenav/sidenav.component';
import { CellComponentHostComponent } from './table/cell-components-host/cell-components-host';
import {
  PeGridTableActionCellComponent,
  PeGridTablePreviewCellComponent,
  PeGridTableTitleCellComponent,
  PeGridTableTextInfoCellComponent,
  PeGridTableBadgeCellComponent,
  PeGridTableMoreCellComponent,
} from './table/cell-components-host/components';
import { PeGridTableRowComponent } from './table/row/row.component';
import { PeGridTableSkeletonComponent } from './table/skeleton/skeleton.component';
import { PeGridTableComponent } from './table/table.component';
import { PeGridToolbarFilterComponent } from './toolbar/filter-form/filter-form.component';
import { PeGridToolbarComponent } from './toolbar/toolbar.component';
import { PeGridViewportComponent } from './viewport/viewport.component';

export const i18n = I18nModule.forChild();
export const NgxsFeatureModule = NgxsModule.forFeature([PreloaderState]);

const components = [
  PeGridComponent,
  PeGridContentComponent,
  PeGridItemComponent,
  PeGridMobileItemComponent,
  MobileItemCellComponentHostComponent,
  PeGridListComponent,
  PeGridMenuComponent,
  PeGridDatepickerComponent,
  PeGridSidenavComponent,
  PeGridTableComponent,
  CellComponentHostComponent,
  PeGridToolbarComponent,
  PeGridToolbarComponent,
  PeGridViewportComponent,
  GridScrollStrategyDirective,
  InfiniteScrollDirective,
  ActiveScrollDirective,
  PeGridToolbarFilterComponent,
  PeGridTableBadgeCellComponent,
  PeGridTablePreviewCellComponent,
  PeGridTableActionCellComponent,
  PeGridTableTitleCellComponent,
  PeGridTableTextInfoCellComponent,
  PeGridTableMoreCellComponent,
  PeGridTableRowComponent,
  PeGridMoveOverviewComponent,
  VerticalColumnsComponent,
  PeGridListItemComponent,
  PeGridListSkeletonComponent,
  PeGridTableSkeletonComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    ReactiveFormsModule,
    ScrollingModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgScrollbarModule,
    i18n,
    NgxsFeatureModule,
    PeFoldersModule,
    PebCheckboxModule,
    PortalModule,
  ],
  declarations: [
    PeGridMaterialComponent,
    ...components,
    VerticalColumnsComponent,
    PeDisplayColumnsSortPipe,
  ],
  providers: [
    PeMoveOverviewService,
    PeOverlayWidgetService,
    PeHelpfulService,
  ],
  exports: [
    ...components,
  ],
})
export class PeGridModule {
}
