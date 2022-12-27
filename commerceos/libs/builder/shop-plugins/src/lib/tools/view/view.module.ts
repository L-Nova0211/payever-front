import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorViewToolDialogComponent } from './view.dialog';
import { PebEditorViewTool } from './view.tool';


@NgModule({
  declarations: [
    PebEditorViewTool,
    PebEditorViewToolDialogComponent,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
  exports: [
    PebEditorViewTool,
    PebEditorViewToolDialogComponent,
  ],
})
export class PebEditorViewToolModule { }
