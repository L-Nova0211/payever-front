import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PebControlsModule } from '@pe/builder-controls';
import { PebRendererSharedModule } from '@pe/builder-renderer';
import { PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';

import { PebEditorShapeSidebarComponent } from './shape.sidebar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PebEditorIconsModule,
    PebEditorSharedModule,
    PebRendererSharedModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    PebControlsModule,
  ],
  declarations: [
    PebEditorShapeSidebarComponent,
  ],
  exports: [
    PebEditorShapeSidebarComponent,
  ],
})
export class PebEditorShapePluginModule { }
