import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorModule } from '@pe/builder-editor';
import { PEB_EDITOR_PUBLISH_DIALOG, PebEditor } from '@pe/builder-main-editor';
import { ReviewPublishComponent } from '@pe/builder-publishing';
import { PebEditorSharedModule } from '@pe/builder-shared';
import { PebTextEditorModule } from '@pe/builder-text-editor';
import { PebViewerModule } from '@pe/builder-viewer';

import { PebShopSharedModule } from './shared/shared.module';
import { pebEditorShopConfig, pebEditorShopConfigModules, pebEditorToolbarModule } from './shop-editor.config';

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const pebEditorModuleForRoot = PebEditorModule.forRoot(pebEditorShopConfig);
export const pebViewerModuleForRoot = PebViewerModule.withConfig({});

// @dynamic
@NgModule({
  imports: [
    CommonModule,
    pebEditorModuleForRoot,
    pebViewerModuleForRoot,
    PebTextEditorModule,
    PebShopSharedModule,
    pebEditorToolbarModule,
    PebEditorSharedModule,
    ...pebEditorShopConfigModules,
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
export class PebShopEditorModule {
}
