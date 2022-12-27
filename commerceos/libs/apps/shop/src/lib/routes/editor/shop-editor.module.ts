import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import {
  MediaService,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_GENERATOR_API_PATH,
  PebActualEditorWs,
  PebEditorApi,
  PebEditorAuthTokenService,
  PebEditorWs,
  PebThemesApi,
} from '@pe/builder-api';
import { PebContextApi, PebContextService } from '@pe/builder-context';
import { PebEnvService, PebMediaService } from '@pe/builder-core';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-services';
import { PeBuilderShareModule } from '@pe/builder-share';
import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PebViewerModule } from '@pe/builder-viewer';
import { APP_TYPE, AppType, PE_ENV } from '@pe/common';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeFoldersActionsService, PeFoldersApiService } from '@pe/folders';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import { THEMES_API_PATH } from '@pe/themes';

import { PebShopBuilderViewComponent } from '../../components';
import { PeShopBuilderEditComponent } from '../../components/builder-edit/builder-edit.component';
import { PebShopBuilderInsertComponent } from '../../components/builder-insert/builder-insert.component';
import {
  PEB_SHOPS_API_PATH,
  PebActualEditorApi,
  PebActualShopsApi,
  PebActualShopThemesApi,
  PebShopsApi,
} from '../../services';

import { PebShopEditorComponent } from './shop-editor.component';


export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: PebShopEditorComponent,
  },
]);

export const pebViewerModuleForChild = PebViewerModule.withConfig({});

@NgModule({
  imports: [
    CommonModule,
    PebShopEditorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonModule,
    routerModule,
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PePlatformHeaderModule,
    ReactiveFormsModule,
    pebViewerModuleForChild,
    PeBuilderShareModule,
  ],
  declarations: [
    PebShopEditorComponent,
    PebShopBuilderViewComponent,
    PebShopBuilderInsertComponent,
    PeShopBuilderEditComponent,
  ],
  exports: [
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    PebShopBuilderInsertComponent,
    PeShopBuilderEditComponent,
  ],
  providers: [
    PeFoldersActionsService,
    PeFoldersApiService,
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'shop',
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Shop,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide: PebThemesApi,
      useClass: PebActualShopThemesApi,
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: PebShopsApi,
      useClass: PebActualShopsApi,
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
    {
      provide: PebContextApi,
      useClass: PebContextService,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.shop + '/api',
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShopWs,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UploadInterceptorService,
      multi: true,
      deps: [
        BackgroundActivityService,
        PEB_EDITOR_API_PATH,
      ],
    },
    {
      provide: PebThemesApi,
      useClass: PebActualShopThemesApi,
    },
    {
      provide: PEB_GENERATOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderGenerator,
    },
  ],
})
export class PebShopEditorRouteModule {}
