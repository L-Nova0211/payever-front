import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule as CdkOverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Optional } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { NgxsModule } from '@ngxs/store';

import { PebActualShopThemesApi, PebEditorApi, PebEditorWs, PebThemesApi } from '@pe/builder-api';
import { PebContextService } from '@pe/builder-context';
import { PebSelectionBBoxState } from '@pe/builder-controls';
import { PebEditorIntegrationsStore, PebEditorState, PebMediaService } from '@pe/builder-core';
import {
  PebDocumentMakerElement,
  PebGridMakerElement,
  PebSectionMakerElement,
  PebShapeMakerElement,
  PebTextMakerElement,
} from '@pe/builder-elements';
import { FontLoaderService } from '@pe/builder-font-loader';
import { PebEditor, PebMainEditorModule } from '@pe/builder-main-editor';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebMediaModule } from '@pe/builder-media';
import { EDITOR_CONFIG_UI, PEB_EDITOR_CONFIG, PEB_EDITOR_PLUGINS, PebEditorConfig } from '@pe/builder-old';
import { PebProductsModule } from '@pe/builder-products';
import {
  ELEMENT_FACTORIES,
  PebEditorOptionsState,
}  from '@pe/builder-renderer';
import {
  ErrorInterceptor,
  PebBaseEditorIntegrationsStore,
  PebBaseEditorState,
  PebEditorAccessorService,
  PebEditorStore,
  PebEditorThemeService,
  SnackbarErrorService,
} from '@pe/builder-services';
import { PebEditorSnackbarModule, PebEditorSnackbarErrorModule } from '@pe/builder-services';
import { PebShapesModule } from '@pe/builder-shapes';
import {
  PagePreviewService,
  PebDirectivesModule,
  PebEditorIconsModule,
  PebEditorSharedModule,
} from '@pe/builder-shared';
import { PebElementSelectionState } from '@pe/builder-state';
import { PebTextEditorModule } from '@pe/builder-text-editor';
import { PE_ENV, PebDeviceService } from '@pe/common';

// fix build --prod
// https://github.com/angular/angular/issues/23609
export const pebElementSelectionState = NgxsModule.forFeature([
  PebElementSelectionState,
  PebEditorOptionsState,
  PebSelectionBBoxState,
]);

// @dynamic
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CdkOverlayModule,
    DragDropModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
    pebElementSelectionState,
    PortalModule,
    PebEditorSharedModule,
    PebEditorIconsModule,
    PebTextEditorModule,
    PebProductsModule,
    PebShapesModule,
    PebDirectivesModule,
    PebMediaModule,
    MatChipsModule,
    MatInputModule,
    PebEditorSnackbarModule,
    PebEditorSnackbarErrorModule,
    PebMainEditorModule,
  ],
  providers: [
    {
      provide: 'ContextServices.Integrations',
      useExisting: PebContextService,
    },
    FontLoaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: PebEditorState,
      useClass: PebBaseEditorState,
    },
    {
      provide: PebEditorIntegrationsStore,
      useClass: PebBaseEditorIntegrationsStore,
    },
    PebEditorStore,
  ],
  exports: [
    PebEditor,
  ],
})
export class PebEditorModule {
  static forRoot(config: PebEditorConfig): ModuleWithProviders<PebEditorModule> {
    return {
      ngModule: PebEditorModule,
      providers: [
        {
          provide: PEB_EDITOR_CONFIG,
          useValue: config,
        },
        {
          provide: 'ContextServices.Integrations',
          useExisting: PebContextService,
        },
        PagePreviewService,
        {
          provide: SnackbarErrorService,
          useClass: SnackbarErrorService,
          deps: [
            MatSnackBar,
            Router,
          ],
        },
        {
          provide: PEB_EDITOR_PLUGINS,
          useValue: config.plugins || [],
        },
        PebDeviceService,
        {
          provide: EDITOR_CONFIG_UI,
          useValue: config.ui,
        },
        {
          provide: PebEditorState,
          useClass: config.state,
        },
        {
          provide: PebThemesApi,
          // useClass: PebActualTerminalThemesApi,
          useClass: PebActualShopThemesApi,
        },
        {
          provide: PebEditorRenderer,
          useFactory: (editorAccessorService: PebEditorAccessorService, apmService: ApmService) => {
            return new PebEditorRenderer(editorAccessorService.renderer, apmService);
          },
          deps: [
            PebEditorAccessorService, ApmService,
          ],
        },
        {
          provide: ELEMENT_FACTORIES,
          useValue: {
            document: PebDocumentMakerElement,
            grid: PebGridMakerElement,
            section: PebSectionMakerElement,
            shape: PebShapeMakerElement,
            text: PebTextMakerElement,
          },
        },
        ...config.plugins || [].map(pluginCtor => ({
          provide: pluginCtor,
          useClass: pluginCtor,
        })),
      ],
    };
  }

  constructor(@Optional() api: PebEditorApi, @Optional() media: PebMediaService, @Optional() ws: PebEditorWs) {
    if (!ws) {
      throw new Error(`
        PebEditorModule requires WSService to be provided.
        Please make sure that you've defined it.
      `);
    }
    if (!api) {
      throw new Error(`
        PebEditorModule requires ApiService to be provided.
        Please make sure that you've defined it.
      `);
    }
    if (!media) {
      throw new Error(`
        PebEditorModule requires MediaService to be provided.
        Please make sure that you've defined it.
      `);
    }
  }
}
