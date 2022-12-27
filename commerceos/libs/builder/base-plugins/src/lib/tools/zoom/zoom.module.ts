import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorZoomDialogComponent } from './zoom.dialog';
import { PebEditorZoomTool } from './zoom.tool';


@NgModule({
  declarations: [
    PebEditorZoomTool,
    PebEditorZoomDialogComponent,
  ],
  imports: [
    CommonModule,
    PebEditorSharedModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  exports: [
    PebEditorZoomTool,
    PebEditorZoomDialogComponent,
  ],
})
export class PebEditorZoomToolModule {
}
