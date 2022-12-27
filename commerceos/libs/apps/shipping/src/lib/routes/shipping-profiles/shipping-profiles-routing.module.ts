import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProfileResolver } from '../../resolver/profile.resolver';

import { ProfileWrapComponent } from './profiles-dialog';
import { PebShippingProfilesComponent } from './shipping-profiles.component';


const routes: Routes = [
  {
    path: '',
    component: PebShippingProfilesComponent,
    children: [
      {
        path: 'profile/:mode',
        component: ProfileWrapComponent,
        children: [
          {
            path: 'product',
            loadChildren: () => import('../../routes/shipping-profiles/browse-products/products/products.module')
              .then(m => m.PeProductsModule),
          },
        ],
      },

    ],
  },
  {
    path: ':profileId/details',
    component: PebShippingProfilesComponent,
    resolve: {
      profile: ProfileResolver,
    },
    data: {
      isDetailsView: true,
    },
  },
];

export const shippingProfilesRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [shippingProfilesRoutingModule],
  exports: [RouterModule],
})
export class ShippingProfilesRoutingModule { }
