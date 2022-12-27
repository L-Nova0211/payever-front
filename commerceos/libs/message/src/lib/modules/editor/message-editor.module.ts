import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Routes } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import {
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PebActualEditorApi, PebActualEditorWs,
  PebEditorApi, PebEditorAuthTokenService,
  PebEditorWs,
} from '@pe/builder-api';
import { PebContextService } from '@pe/builder-context';
import { PebEnvService } from '@pe/builder-core';
import { PebMailEditorModule } from '@pe/builder-mail-editor';
import { PebViewerModule } from '@pe/builder-viewer';
import { PeChatModule } from '@pe/chat';
import { PE_ENV } from '@pe/common';
import { PebConfirmActionDialogModule } from '@pe/confirm-action-dialog';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PE_FOLDERS_API_PATH, PeFoldersActionsService } from '@pe/folders';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { SnackbarService } from '@pe/snackbar';
import { PebThemesModule, THEMES_API_PATH, ThemesApi } from '@pe/themes';
import { PebDateTimePickerModule, PebFormFieldInputModule } from '@pe/ui';

import { PeSharedModule } from '../shared';

import { PeMessageMailGuard } from './message-builder/guards/mail-builder.guard';
import { PeMessageBuilderComponent } from './message-builder/message-builder.component';
import { PeMessageScheduleComponent } from './message-builder/message-schedule/message-schedule.component';
import {
  PeMessageScheduleMaterialStylesComponent,
} from './message-builder/message-schedule/styles/schedule-material-styles.component';
import { PeMessageEditorComponent } from './message-editor.component';
import { PeMessageThemeComponent } from './message-theme-overlay/message-theme-overlay.component';
import {
  PeMessageThemeOverlayStylesComponent,
} from './message-theme-overlay/styles/message-theme-overlay-styles.component';

const routes: Routes = [
  {
    path: '',
    component: PeMessageEditorComponent,
    canDeactivate: [PeMessageMailGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/apps/contacts').then(m => m.ContactsModule),
      },
    ],
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const pebViewerModuleForRoot = PebViewerModule.withConfig({});
export const PeMessageEditorRouterModule = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    PeMessageEditorComponent,
    PeMessageBuilderComponent,
    PeMessageScheduleComponent,
    PeMessageThemeComponent,
    PeMessageScheduleMaterialStylesComponent,
    PeMessageThemeOverlayStylesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PeMessageEditorRouterModule,
    pebViewerModuleForRoot,
    PeSharedModule,

    PebMailEditorModule,
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PeChatModule,
    PePlatformHeaderModule,
    PebFormFieldInputModule,
    PebThemesModule,
    PebConfirmActionDialogModule,
    PebDateTimePickerModule,

    MatDialogModule,
  ],
  providers: [
    PeAuthService,
    PeOverlayWidgetService,
    SnackbarService,
    PeFoldersActionsService,
    ThemesApi,
    PebContextService,
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMessageWs,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMessage,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMessage,
    },
    {
      provide: PE_FOLDERS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.contacts + '/api',
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: PebEditorWs,
      deps: [
        [new Optional(), new SkipSelf(), PebEditorWs],
        PEB_EDITOR_WS_PATH,
        PebEditorAuthTokenService,
        PebEnvService,
      ],
      useFactory: (editorWs, path, tokenService, envService) => {
        if (!editorWs) {
          return new PebActualEditorWs(path, tokenService, envService);
        }

        return editorWs;
      },
    },
  ],
})
export class PeMessageEditorModule {}
