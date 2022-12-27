import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebBlogThemesComponent } from './blog-themes.component';

const routes: Routes = [
  {
    path: '',
    component: PebBlogThemesComponent,
  },
];

export const blogThemesRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [blogThemesRoutingModule],
  exports: [RouterModule],
})
export class PebBlogThemeRoutingModule { }
