import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebEditorMasterChangesBannerComponent } from './master-changes-banner/master-changes-banner.component';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    PebEditorMasterChangesBannerComponent,
  ],
  exports: [
    PebEditorMasterChangesBannerComponent,
  ],
})
export class PebEditorBlogMasterPageChangesPluginModule { }
