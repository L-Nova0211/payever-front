import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SiteEnvGuard } from './env.guard';
import { CosSitesRootComponent } from './sites-root/sites-root.component';

const routes: Routes = [{
  path: '',
  component: CosSitesRootComponent,
  canActivate: [SiteEnvGuard],
  children: [{
    path: '',
    loadChildren: () => import('./site.module').then(m => m.PebSiteModule),
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CosSitesRoutingModule {
}
