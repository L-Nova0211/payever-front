import { OverlayModule as CdkOverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  PebEditorActionsHistoryToolModule,
  PebEditorBrushToolModule,
  PebEditorLanguageToolModule,
  PebEditorMediaToolModule,
  PebEditorPreviewToolModule,
  PebEditorPublishToolModule,
  PebEditorScreenToolModule,
  PebEditorShapesToolModule,
  PebEditorTableToolModule,
  PebEditorValidatorToolModule,
  PebEditorZoomToolModule,
  PEB_PREVIEW_TOOL_DIALOG,
} from '@pe/builder-base-plugins';
import { PebEditorIconsModule } from '@pe/builder-shared';

import { PebEditorSeoToolModule } from '../tools/seo';
import { PebEditorViewToolModule } from '../tools/view';

import { PebEditorShopToolbarComponent } from './toolbar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CdkOverlayModule,
    MatDialogModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    PebEditorIconsModule,
    PebEditorZoomToolModule,
    PebEditorViewToolModule,
    PebEditorActionsHistoryToolModule,
    PebEditorLanguageToolModule,
    PebEditorShapesToolModule,
    PebEditorBrushToolModule,
    PebEditorScreenToolModule,
    PebEditorMediaToolModule,
    PebEditorValidatorToolModule,
    PebEditorSeoToolModule,
    PebEditorPreviewToolModule,
    PebEditorPublishToolModule,
    PebEditorTableToolModule,
  ],
  declarations: [
    PebEditorShopToolbarComponent,
  ],
  exports: [
    PebEditorShopToolbarComponent,
    PebEditorZoomToolModule,
    PebEditorViewToolModule,
    PebEditorActionsHistoryToolModule,
    PebEditorLanguageToolModule,
    PebEditorShapesToolModule,
    PebEditorBrushToolModule,
    PebEditorScreenToolModule,
    PebEditorMediaToolModule,
    PebEditorValidatorToolModule,
    PebEditorSeoToolModule,
    PebEditorPreviewToolModule,
    PebEditorPublishToolModule,
    PebEditorTableToolModule,
  ],
})
export class PebEditorShopToolbarModule {
  static withConfig(config: { previewDialog: Type<any> }): ModuleWithProviders<PebEditorShopToolbarModule> {
    return {
      ngModule: PebEditorShopToolbarModule,
      providers: [
        { provide: PEB_PREVIEW_TOOL_DIALOG, useValue: config.previewDialog },
      ],
    };
  }
}
