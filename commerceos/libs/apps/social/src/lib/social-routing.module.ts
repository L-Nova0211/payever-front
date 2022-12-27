import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeSocialRoutingPathsEnum } from './enums';
import { PeSocialComponent } from './social.component';

const routes: Routes = [{
  path: '',
  component: PeSocialComponent,
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: PeSocialRoutingPathsEnum.Posts,
    },
    {
      path: PeSocialRoutingPathsEnum.Posts,
      loadChildren: () => import('./components/calendar/calendar.module').then(m => m.PeSocialCalendarModule),
    },
    {
      path: PeSocialRoutingPathsEnum.Connect,
      loadChildren: () => import('./components/connect/connect.module').then(m => m.PeSocialConnectModule),
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeSocialRoutingModule { }
