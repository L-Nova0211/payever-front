import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeThemeGridComponent } from './theme-grid.component';

const routes: Routes = [
  {
    path: '',
    component: PeThemeGridComponent,
    children:[
      {
        path: ':invoiceId',
        component: PeThemeGridComponent,
      },
    ],
  },
];

export const themeGridRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [themeGridRoutingModule],
  exports: [RouterModule],
})
export class PeThemeGridRoutingModule { }
