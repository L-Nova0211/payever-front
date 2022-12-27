import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { PebEditorApi, PebEditorWs } from '@pe/builder-api';
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
import { NavigationService, PE_ENV } from '@pe/common';

import { PeMessageAppComponent } from './message-app.component';
import { PeMessageAppRouteModule } from './message-app.routing';
import { PeMessageModule } from './modules/message/message.module';
import { PeSharedModule } from './modules/shared';
import { TaggingPipe } from './pipes';
import { PeMessageIntegrationService } from './services';

const mailIntegrationProviders = [
  PebControlsService,
  PebRadiusService,
  PebRadiusMoveService,
  PebEditorStore,
  PebMoveService,
  PebPointerEventsService,
  PebResizeService,
  PebRTree,
  {
    provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
    useValue: { duration: 250 },
  },
  {
    provide: PebRTree,
    useClass: PebRTree,
    deps: [PebEditorState],
  },
  {
    provide: PebEditorThemeService,
    useClass: PebEditorThemeService,
    deps: [
      PebEditorApi,
      SnackbarErrorService,
      PebEditorWs,
      PE_ENV,
    ],
  },
];

@NgModule({
  imports: [
    ClipboardModule,
    CommonModule,
    PeSharedModule,
    PeMessageModule,
    PeMessageAppRouteModule,
  ],
  declarations: [
    PeMessageAppComponent,
    TaggingPipe,
  ],
  providers: [
    NavigationService,
    PeMessageIntegrationService,
    ...mailIntegrationProviders,
  ],
  exports: [],
})
export class PeMessageAppModule { }
