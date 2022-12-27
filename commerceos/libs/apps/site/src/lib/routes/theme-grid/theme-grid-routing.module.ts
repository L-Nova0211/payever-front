import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebThemeGridComponent } from './theme-grid.component';

const routes: Routes = [
  {
    path: '',
    component: PebThemeGridComponent,
  },
];

export const siteThemesRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [siteThemesRoutingModule],
  exports: [RouterModule],
})
export class PebThemeGridRoutingModule { }
