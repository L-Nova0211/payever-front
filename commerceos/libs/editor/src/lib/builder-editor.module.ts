import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { RouterModule, Routes } from '@angular/router';

import { PebEditorApi, PebEditorWs } from '@pe/builder-api';
import { PebContextApi, PebContextService } from '@pe/builder-context';
import {
  PebControlsService,
  PebMoveService,
  PebPointerEventsService,
  PebRadiusMoveService,
  PebRadiusService,
  PebResizeService,
} from '@pe/builder-controls';
import { PebEditorState } from '@pe/builder-core';
import { PebRTree } from '@pe/builder-renderer';
import { PebEditorStore, PebEditorThemeService, SnackbarErrorService } from '@pe/builder-services';
import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PebViewerModule } from '@pe/builder-viewer';
import { PE_ENV } from '@pe/common';
import { PeFiltersModule } from '@pe/filters';
import { I18nModule } from '@pe/i18n';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { PebMessagesModule } from '@pe/ui';

import { PeBuilderEditorComponent } from './builder-editor.component';
import { PeBuilderHeaderMenuComponent } from './builder-menu';
import { PeBuilderHeaderMenuStylesComponent } from './builder-menu-styles';

const routes: Routes = [{
  path: '',
  component: PeBuilderEditorComponent,
}];

const angularModules = [
  CommonModule,
  MatButtonModule,
  MatChipsModule,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  ReactiveFormsModule,
  RouterModule.forChild(routes),
];

const peModules = [
  I18nModule,
  PebMessagesModule,
  PebShopEditorModule,
  PebViewerModule.withConfig({}),
  PeFiltersModule,
  PePlatformHeaderModule,
  PeSidebarModule,
];

@NgModule({
  imports: [
    ...angularModules,
    ...peModules,
  ],
  declarations: [
    PeBuilderEditorComponent,
    PeBuilderHeaderMenuComponent,
    PeBuilderHeaderMenuStylesComponent,
  ],
  // TODO: temporary solution until builder will be ready
  providers: [
    PebControlsService,
    PebEditorStore,
    PebMoveService,
    PebPointerEventsService,
    PebRadiusMoveService,
    PebRadiusService,
    PebResizeService,
    {
      provide: PebContextApi,
      useClass: PebContextService,
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2500 },
    },
    {
      deps: [PebEditorState],
      provide: PebRTree,
      useClass: PebRTree,
    },
    {
      deps: [
        PebEditorApi,
        SnackbarErrorService,
        PebEditorWs,
        PE_ENV,
      ],
      provide: PebEditorThemeService,
      useClass: PebEditorThemeService,
    },
  ]
})
export class PeBuilderEditorModule { }
