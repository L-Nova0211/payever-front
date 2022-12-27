import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorScreenToolDialogComponent } from './screen.dialog';
import { PebEditorScreenTool } from './screen.tool';


@NgModule({
  declarations: [
    PebEditorScreenToolDialogComponent,
    PebEditorScreenTool,
  ],
  exports: [
    PebEditorScreenToolDialogComponent,
    PebEditorScreenTool,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
    MatIconModule,
  ],
})
export class PebEditorScreenToolModule {
}
