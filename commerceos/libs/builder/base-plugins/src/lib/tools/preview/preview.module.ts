import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';

import { PebEditorIconsModule } from '@pe/builder-shared';

import { PEB_PREVIEW_TOOL_DIALOG } from './preview.constant';
import { PebEditorPreviewTool } from './preview.tool';


@NgModule({
  declarations: [
    PebEditorPreviewTool,
  ],
  exports: [
    PebEditorPreviewTool,
  ],
  imports: [
    CommonModule,
    PebEditorIconsModule,
  ],
})
export class PebEditorPreviewToolModule {
  static withConfig(previewComponent: Type<any>): ModuleWithProviders<PebEditorPreviewToolModule> {
    return {
      ngModule: PebEditorPreviewToolModule,
      providers: [
        {
          provide: PEB_PREVIEW_TOOL_DIALOG,
          useValue: previewComponent,
        },
      ],
    };
  }
}
