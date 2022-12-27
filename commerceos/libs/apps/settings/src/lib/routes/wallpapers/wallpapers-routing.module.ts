import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WallpapersComponent } from './wallpapers.component';

const routes: Routes = [
  {
    path: '',
    component: WallpapersComponent,
  },
];

export const wallpapersRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [wallpapersRoutingModule],
  exports: [RouterModule],
})
export class WallpapersRoutingModule { }
