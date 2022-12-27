import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorPublishToolDialogComponent } from './publish.dialog';
import { PebEditorPublishTool } from './publish.tool';


@NgModule({
  declarations: [
    PebEditorPublishTool,
    PebEditorPublishToolDialogComponent,
  ],
  exports: [
    PebEditorPublishTool,
    PebEditorPublishToolDialogComponent,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
})
export class PebEditorPublishToolModule {
}
