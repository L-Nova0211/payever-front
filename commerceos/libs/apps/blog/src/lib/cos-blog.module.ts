import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthStubService, PeAuthService } from '@pe/auth';
import { CosMessageBus } from '@pe/base';
import {
  ActualBlogApi,
  MediaService,
  PebActualBlogEditorApi,
  PebActualBlogThemesApi,
  PebActualEditorApi,
  PebActualEditorWs,
  PebBlogsApi,
  PebBuilderBlogsApi,
  PebEditorApi,
  PebEditorAuthTokenService,
  PebEditorWs,
  PebThemesApi,
  PEB_BLOG_API_BUILDER_PATH,
  PEB_BLOG_API_PATH,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_SHOPS_API_PATH,
} from '@pe/builder-api';
import { PebContextService } from '@pe/builder-context';
import { PebEnvService, PebMediaService, PebTranslateService } from '@pe/builder-core';
import { PEB_EDITOR_PUBLISH_DIALOG } from '@pe/builder-main-editor';
import { PebRendererModule } from '@pe/builder-renderer';
import { BackgroundActivityService } from '@pe/builder-services';
import { PeBuilderShareModule } from '@pe/builder-share';
import { AppType, APP_TYPE, EnvironmentConfigInterface, EnvService, MessageBus, PE_ENV } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { TranslateService, TranslationGuard } from '@pe/i18n';
import { PeMediaService, PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';
import { PebMessagesModule } from '@pe/ui';
import { WelcomeScreenService } from '@pe/welcome-screen';

import { PEB_BLOG_HOST, PE_BLOG_CONTAINER } from './constants';
import { BlogEnvGuard } from './env.guard';
import { CosBlogRootComponent } from './root/blog-root.component';
import { BlogEnvService } from './services/blog-env.service';
import { PeBlogHeaderService } from './services/blog-header.service';
import { DialogService } from './services/dialog-data.service';


const routes: Route[] = [
  {
    path: '',
    component: CosBlogRootComponent,
    canActivate: [BlogEnvGuard,TranslationGuard],
    data: {
      i18nDomains : [
        'commerceos-themes-app',
        'commerceos-grid-app',
      ],
    },
    children: [{
      path: '',
      loadChildren: () => import('./blog.module').then(m => m.PebBlogModule),
    }],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PebRendererModule,
    PebMessagesModule,
    PeBuilderShareModule,
  ],
  declarations: [CosBlogRootComponent],
  providers: [
    PeOverlayWidgetService,
    WelcomeScreenService,
    AuthStubService,
    BlogEnvGuard,
    PeBlogHeaderService,
    BackgroundActivityService,
    PeDataGridService,
    DialogService,
    ThemesApi,
    PebContextService,
    PeMediaService,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: EnvService,
      useClass: BlogEnvService,
    },
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [AuthStubService],
      useFactory: authService => authService,
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
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: authService => authService,
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
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,
    },
    {
      provide: PE_FOLDERS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderBlog,
    },
    {
      deps: [PE_ENV],
      provide: PE_CUSTOM_CDN_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.custom.cdn,
    },
    {
      deps: [PE_ENV],
      provide: PE_MEDIA_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
    },
    {
      provide: PE_MEDIA_CONTAINER,
      useValue: PE_BLOG_CONTAINER,
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
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
  ],
})
export class CosBlogModule {}
