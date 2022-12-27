import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule } from '@angular/material/tree';

import { PebRendererModule } from '@pe/builder-renderer';
import { PebConfirmActionDialogModule } from '@pe/confirm-action-dialog';
import { PeDataGridModule, PeDataGridService } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { PebFormFieldInputModule, PebSelectModule } from '@pe/ui';

import { PebPagesContextMenuComponent } from './pages-context-menu/pages-context-menu.component';
import { PebPagesFolderDialogComponent } from './pages-folder-dialog/pages-folder-dialog.component';
import { PebPagesComponent } from './pages.component';
import { PebPagesService } from './pages.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatIconModule,
    MatTreeModule,
    MatSelectModule,

    PeDataGridModule,
    PeFiltersModule,
    PePlatformHeaderModule,
    PeSidebarModule,
    PebRendererModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebConfirmActionDialogModule,
    PeGridModule,
    PeFoldersModule,
  ],
  declarations: [
    PebPagesComponent,
    PebPagesContextMenuComponent,
    PebPagesFolderDialogComponent,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PebPagesComponent,
  ],
  providers: [
    PebPagesService,
    PeDataGridService,
  ],
})
export class PebPagesModule {}
