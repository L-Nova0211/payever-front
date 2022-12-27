import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorBrushTool } from './brush.tool';


@NgModule({
  declarations: [
    PebEditorBrushTool,
  ],
  exports: [
    PebEditorBrushTool,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
})
export class PebEditorBrushToolModule { }
