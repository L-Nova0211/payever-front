import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebShopThemesComponent } from './shop-themes.component';

const routes: Routes = [
  {
    path: '',
    component: PebShopThemesComponent,
  },
];

export const shopThemesRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [shopThemesRoutingModule],
  exports: [RouterModule],
})
export class PebShopThemesRoutingModule { }
