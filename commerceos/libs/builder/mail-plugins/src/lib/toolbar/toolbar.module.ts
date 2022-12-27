import { OverlayModule as CdkOverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import {
  PebEditorActionsHistoryToolModule,
  PebEditorBrushToolModule,
  PebEditorShapesToolModule,
  PebEditorZoomToolModule,
  PEB_PREVIEW_TOOL_DIALOG,
} from '@pe/builder-base-plugins';
import { PebEditorIconsModule } from '@pe/builder-shared';
import { PebFormFieldInputModule, PebSelectModule } from '@pe/ui';

import { PebMailToolbarMaterialComponent } from '../components/material-styles/mail-material.component';

import { PebEditorMailToolbarComponent } from './toolbar.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkOverlayModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatChipsModule,
    PebEditorIconsModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebEditorZoomToolModule,
    PebEditorActionsHistoryToolModule,
    PebEditorShapesToolModule,
    PebEditorBrushToolModule,
  ],
  declarations: [
    PebEditorMailToolbarComponent,
    PebMailToolbarMaterialComponent,
  ],
  exports: [
    PebEditorMailToolbarComponent,
  ],
})
export class PebEditorMailToolbarModule {
  static withConfig(config: { previewDialog: Type<any> }): ModuleWithProviders<PebEditorMailToolbarModule> {
    return {
      ngModule: PebEditorMailToolbarModule,
      providers: [
        {
          provide: PEB_PREVIEW_TOOL_DIALOG,
          useValue: config.previewDialog,
        },
      ],
    };
  }
}
