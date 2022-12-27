import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';

import { MediaDialogService } from './media-dialog.service';
import { PebMediaComponent } from './media.component';


@NgModule({
  declarations: [PebMediaComponent],
  imports: [
    CommonModule,
    PeDataGridModule,
    PeFiltersModule,
    PePlatformHeaderModule,
    PeSidebarModule,
    ReactiveFormsModule,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
  ],
  providers: [MediaDialogService],
})
export class PebMediaModule { }
