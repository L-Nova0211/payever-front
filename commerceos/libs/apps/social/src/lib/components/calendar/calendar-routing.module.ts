import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeSocialPostResolver } from '../../resolver';

import { PeSocialCalendarComponent } from './calendar.component';

const routes: Routes = [
  {
    path: '',
    component: PeSocialCalendarComponent,
  },
  {
    path: ':postId/details',
    component: PeSocialCalendarComponent,
    resolve: {
      post: PeSocialPostResolver,
    },
    data: {
      isDetailsView: true,
    },
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [PeSocialPostResolver],
})
export class PeSocialCalendarRoutingModule { }
