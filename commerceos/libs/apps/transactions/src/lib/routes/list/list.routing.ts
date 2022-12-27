import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeListComponent } from './list.component';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list',
  },
  {
    path: '',
    component: PeListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class PeListRouteModule {}
