import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';

import { PebRendererModule, PebRendererSharedModule } from '@pe/builder-renderer';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeFoldersActionsService, PeFoldersApiService, PeFoldersModule } from '@pe/folders';
import { PeGridModule, PeGridState } from '@pe/grid';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';

import { PebShapesContextMenuComponent } from './shapes-context-menu/shapes-context-menu.component';
import { PebShapesComponent } from './shapes.component';


@NgModule({
  imports: [
    CommonModule,
    PebRendererModule,
    PebRendererSharedModule,
    PeDataGridModule,
    PeFiltersModule,
    PePlatformHeaderModule,
    PeSidebarModule,
    ReactiveFormsModule,
    PeGridModule,
    PeFoldersModule,
    NgxsModule.forFeature([PeGridState]),
  ],
  providers: [
    PeFoldersActionsService,
    PeFoldersApiService,
  ],
  declarations: [
    PebShapesComponent,
    PebShapesContextMenuComponent,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
  ],
})
export class PebShapesModule {}
