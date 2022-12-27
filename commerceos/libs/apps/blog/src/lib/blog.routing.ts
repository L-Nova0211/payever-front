import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebBlogGuard } from './guards/blog.guard';
import { BlogThemeGuard } from './guards/theme.guard';
import { PebBlogComponent } from './routes/_root/blog-root.component';
import { PebBlogDashboardComponent } from './routes/dashboard/blog-dashboard.component';
import { PebBlogEditorComponent } from './routes/editor/blog-editor.component';
import { PebBlogSettingsComponent } from './routes/settings/blog-settings.component';

const routes: Routes = [
  {
    path: '',
    component: PebBlogComponent,
    canActivate: [PebBlogGuard],
    children: [
      {
        path: ':blogId',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: PebBlogDashboardComponent,
            canActivate:[BlogThemeGuard],
          },
          {
            path: 'edit',
            component: PebBlogEditorComponent,
            canActivate:[BlogThemeGuard],
          },
          {
            path: 'settings',
            component: PebBlogSettingsComponent,

          },
          {
            path: 'themes',
            loadChildren: () => import('./routes/themes/blog-themes.module').then(m => m.PebBlogThemeModule),
          },
          {
            path: 'builder/:themeId/edit',
            component: PebBlogEditorComponent,
          },
        ],
      },
    ],
  },
];

// // HACK: fix --prod build
// // https://github.com/angular/angular/issues/23609
export const routerModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [routerModuleForChild],
  exports: [RouterModule],
  providers: [
    BlogThemeGuard,
  ],
})
export class PebBlogRouteModule { }
