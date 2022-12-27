import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import {
  ActualBlogApi,
  MediaService,
  PEB_BLOG_API_BUILDER_PATH,
  PEB_BLOG_API_PATH,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_SHOPS_API_PATH,
  PebActualBlogEditorApi,
  PebActualBlogThemesApi,
  PebActualEditorApi,
  PebActualEditorWs,
  PebBlogsApi,
  PebBuilderBlogsApi,
  PebEditorApi, PebEditorAuthTokenService,
  PebEditorWs,
  PebThemesApi,
} from '@pe/builder-api';
import { PebBlogEditorModule } from '@pe/builder-blog-editor';
import { PebContextService } from '@pe/builder-context';
import { PebEnvService, PebMediaService, PebTranslateService } from '@pe/builder-core';
import { PEB_EDITOR_PUBLISH_DIALOG } from '@pe/builder-main-editor';
import { PebViewerModule } from '@pe/builder-viewer';
import { APP_TYPE, AppType, PE_ENV } from '@pe/common';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { THEMES_API_PATH } from '@pe/themes';

import { PeBlogBuilderEditComponent } from '../../components/builder-edit/builder-edit.component';
import { PebBlogBuilderInsertComponent } from '../../components/builder-insert/builder-insert.component';
import { PebBlogBuilderViewComponent } from '../../components/builder-view/builder-view.component';
import { PEB_BLOG_HOST } from '../../constants';

import { PebBlogEditorComponent } from './blog-editor.component';

export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: PebBlogEditorComponent,

  },
]);
export const pebViewerModuleForChild = PebViewerModule.withConfig({});
@NgModule({
  imports: [
    CommonModule,
    PebBlogEditorModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    routerModule,
    PePlatformHeaderModule,
    ReactiveFormsModule,
    pebViewerModuleForChild,
  ],
  declarations: [
    PebBlogEditorComponent,
    PebBlogBuilderInsertComponent,
    PeBlogBuilderEditComponent,
    PebBlogBuilderViewComponent,
  ],
  exports: [
    PebBlogBuilderInsertComponent,
    PeBlogBuilderEditComponent,
  ],
  providers: [
    PebContextService,
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'blog',
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Blog,
    },
    {
      provide: PebThemesApi,
      useClass: PebActualBlogThemesApi,
    },
    {
      provide: PebTranslateService,
      useExisting: TranslateService,
    },
    {
      provide: 'PE_ACCESS_TOKEN',
      deps: [PeAuthService],
      useFactory: (authService: PeAuthService) => authService.token,
    },
    {
      provide: PEB_BLOG_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.blogHost,
    },
    {
      provide: PEB_BLOG_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.blog + '/api',
    },
    {
      deps: [PE_ENV],
      provide: PEB_BLOG_API_BUILDER_PATH,
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: PEB_EDITOR_PUBLISH_DIALOG,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.blog + '/api',
    },
    {
      provide: PE_FOLDERS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,

    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlogWs,
    },
    {
      provide: PebBlogsApi,
      useClass: ActualBlogApi,
    },
    {
      deps: [PE_ENV],
      provide: PEB_BLOG_API_BUILDER_PATH,
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: PEB_EDITOR_PUBLISH_DIALOG,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.blog + '/api',
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlogWs,
    },
    {
      provide: PebBuilderBlogsApi,
      useClass: PebActualBlogEditorApi,
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: PebBlogsApi,
      useClass: ActualBlogApi,
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
export class PebBlogEditorRouteModule {}
