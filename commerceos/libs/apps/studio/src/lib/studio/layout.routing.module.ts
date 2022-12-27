import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];
export const RouterModuleForChild = RouterModule.forChild(routes);
@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PeStudioLayoutRoutingModule {}
