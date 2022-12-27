import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorSeoTool } from './seo.tool';


@NgModule({
  declarations: [PebEditorSeoTool],
  exports: [PebEditorSeoTool],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
})
export class PebEditorSeoToolModule { }
