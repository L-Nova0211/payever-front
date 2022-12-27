
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PebEditorModule } from '@pe/builder-editor';
import { PebLayersModule } from '@pe/builder-layers';
import { PebEditor } from '@pe/builder-main-editor';
import { PebEditorSharedModule } from '@pe/builder-shared';
import { PebTextEditorModule } from '@pe/builder-text-editor';
import { PebViewerModule } from '@pe/builder-viewer';

import { pebEditorMailConfig, pebEditorMailConfigModules, pebEditorToolbarModule } from './mail-editor.config';


// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const pebEditorModuleForRoot = PebEditorModule.forRoot(pebEditorMailConfig);
export const pebViewerModuleForRoot = PebViewerModule.withConfig({});

// @dynamic
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    pebEditorModuleForRoot,
    pebViewerModuleForRoot,
    pebEditorToolbarModule,
    PebTextEditorModule,
    PebEditorSharedModule,
    PebLayersModule,
    ...pebEditorMailConfigModules,
  ],
  exports: [
    PebEditor,
  ],
})
export class PebMailEditorModule {
}
