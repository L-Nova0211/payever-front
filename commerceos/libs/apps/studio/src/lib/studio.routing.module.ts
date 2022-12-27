import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeStudioGridComponent } from './studio/grid/grid.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: PeStudioGridComponent,
  },
];
// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PeStudioRoutingModule {}
