import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorShapesTool } from './shapes.tool';


@NgModule({
  declarations: [
    PebEditorShapesTool,
  ],
  exports: [
    PebEditorShapesTool,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
})
export class PebEditorShapesToolModule {
}
