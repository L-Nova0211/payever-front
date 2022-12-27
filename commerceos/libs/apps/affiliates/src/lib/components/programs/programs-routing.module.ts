import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeAffiliatesProgramsComponent } from './programs.component';

const routes: Routes = [
  {
    path: '',
    component: PeAffiliatesProgramsComponent,
  },
];

export const affiliatesProgramsRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [affiliatesProgramsRoutingModule],
  exports: [RouterModule],
})
export class PeAffiliatesProgramsRoutingModule { }
