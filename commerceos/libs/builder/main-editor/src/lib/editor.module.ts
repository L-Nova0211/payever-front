import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { PebControlsModule } from '@pe/builder-controls';
import { PebLayersModule } from '@pe/builder-layers';
import { PebRendererModule } from '@pe/builder-renderer';
import { PebEditorIconsModule, PebEditorSharedModule } from '@pe/builder-shared';
import { ButtonModule } from '@pe/button';

import { PebEditorRightSidebarComponent, PebGenericSidebarComponent } from './components';
import {
  PebEditorCompileErrorDialog,
  PebEditorLanguagesDialog,
  PebEditorPublishDialogComponent,
  PebEditorScriptsDialogModule,
} from './dialogs';
import { PebEditorRendererComponent } from './editor-renderer.component';
import { PebEditor } from './editor.component';
import { PebEditorMaterialComponent } from './material.component';


@NgModule({
  declarations: [
    PebEditor,
    PebEditorRightSidebarComponent,
    PebEditorCompileErrorDialog,
    PebEditorLanguagesDialog,
    PebEditorPublishDialogComponent,
    PebEditorRendererComponent,
    PebEditorMaterialComponent,
    PebGenericSidebarComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    PebControlsModule,
    PebEditorScriptsDialogModule,
    PebEditorSharedModule,
    PebRendererModule,
    ScrollingModule,
    MatChipsModule,
    PebLayersModule,
    PebEditorIconsModule,
    ButtonModule,
  ],
  exports: [
    PebEditor,
  ],
})
export class PebMainEditorModule {}
