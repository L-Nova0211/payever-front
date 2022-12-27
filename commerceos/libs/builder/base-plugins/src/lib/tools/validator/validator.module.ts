import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorValidatorTool } from './validator.tool';


@NgModule({
  declarations: [
    PebEditorValidatorTool,
  ],
  exports: [
    PebEditorValidatorTool,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
})
export class PebEditorValidatorToolModule {
}
