import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorModule } from '@pe/builder-editor';
import { PebLayersModule } from '@pe/builder-layers';
import { PEB_EDITOR_PUBLISH_DIALOG, PebEditor } from '@pe/builder-main-editor';
import { ReviewPublishComponent } from '@pe/builder-publishing';
import { PebTextEditorModule } from '@pe/builder-text-editor';
import { PebViewerModule } from '@pe/builder-viewer';

import { pebEditorBlogConfig, pebEditorBlogConfigModules, pebEditorToolbarModule } from './blog-editor.config';

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const pebEditorModuleForRoot = PebEditorModule.forRoot(pebEditorBlogConfig);
export const pebViewerModuleForRoot = PebViewerModule.withConfig({});

// @dynamic
@NgModule({
  imports: [
    CommonModule,
    pebEditorModuleForRoot,
    pebViewerModuleForRoot,
    PebTextEditorModule,
    pebEditorToolbarModule,
    PebLayersModule,
    ...pebEditorBlogConfigModules,
  ],
  exports: [
    PebEditor,
  ],
  providers: [
    {
      provide: PEB_EDITOR_PUBLISH_DIALOG,
      useValue: ReviewPublishComponent,
    },
  ],
})
export class PebBlogEditorModule {}
