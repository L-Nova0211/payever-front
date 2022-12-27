import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorMediaToolDialogComponent } from './media.dialog';
import { PebEditorMediaTool } from './media.tool';


@NgModule({
  declarations: [
    PebEditorMediaTool,
    PebEditorMediaToolDialogComponent,
  ],
  exports: [
    PebEditorMediaTool,
    PebEditorMediaToolDialogComponent,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
})
export class PebEditorMediaToolModule {
}
