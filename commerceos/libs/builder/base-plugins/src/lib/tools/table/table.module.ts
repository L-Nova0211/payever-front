import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorTableTool } from './table.tool';


@NgModule({
  declarations: [PebEditorTableTool],
  exports: [PebEditorTableTool],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
})
export class PebEditorTableToolModule {
}
