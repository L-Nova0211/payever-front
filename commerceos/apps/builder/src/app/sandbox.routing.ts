import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SandboxFrontRoute } from './root/front.route';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SandboxFrontRoute,
  },
  {
    path: 'renderer',
    loadChildren: () => import('./+renderer/renderer.module').then(
      m => m.SandboxRendererModule,
    ),
  },
  {
    path: 'editor/:shopId',
    loadChildren: () => import('./+editor/editor.module').then(
      m => m.SandboxEditorModule,
    ),
  },
  {
    path: 'viewer',
    loadChildren: () => import('./+viewer/viewer.module').then(
      m => m.SandboxViewerModule,
    ),
  },
  {
    path: 'source-editor',
    loadChildren: () => import('./+source-editor/source-editor.module').then(
      m => m.SandboxSourceEditorModule,
    ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    enableTracing: false,
    relativeLinkResolution: 'legacy'
}),
  ],
  exports: [
    RouterModule,
  ],
})
export class SandboxRouting { }
