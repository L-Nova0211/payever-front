import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebViewerModule } from '@pe/builder-viewer';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';

import { ReviewPublishComponent } from './review-publish.component';

export const pebViewerModuleForChild = PebViewerModule.withConfig({});


@NgModule({
  declarations: [
    ReviewPublishComponent,
  ],
  imports: [
    CommonModule,
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PePlatformHeaderModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    pebViewerModuleForChild,
  ],
  exports: [
    ReviewPublishComponent,
  ],
})
export class PebPublishingModule {
}
