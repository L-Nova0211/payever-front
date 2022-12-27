import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ZoneResolver } from './resolver/zone.resolver';
import { PebConnectComponent } from './routes/connect/connect.component';
import { PebDeliveryByLocationComponent } from './routes/delivery-by-location/delivery-by-location.component';
import { PebPackagingSlipComponent } from './routes/packaging-slip/packaging-slip.component';
import { PebPickupByLocationComponent } from './routes/pickup-by-location/pickup-by-location.component';
import { PebShippingComponent } from './routes/root/shipping.component';
import { PebShippingOptionsComponent } from './routes/shipping-options/shipping-options.component';
import { PebShippingPackagesComponent } from './routes/shipping-packages/shipping-packages.component';

const routes: Routes = [
  {
    path: '',
    component: PebShippingComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profiles' },
      {
        path: 'profiles',
        loadChildren: () => import('./routes/shipping-profiles/shipping-profiles.module')
          .then(m => m.ShippingProfilesModule),
      },
      {
        path: 'zones',
        loadChildren: () => import('./routes/shipping-options/shipping-options.module')
          .then(m => m.ShippingOptionsModule),
      },
      {
        path: 'packages',
        loadChildren: () => import('./routes/shipping-packages/shipping-packages.module')
        .then(m => m.ShippingPackagesModule),
      },
      {
        path: 'delivery-by-location',
        component: PebDeliveryByLocationComponent,
      },
      { path: 'pickup-by-location', component: PebPickupByLocationComponent },
      { path: 'packaging-slip', component: PebPackagingSlipComponent },
      { path: 'connect', component: PebConnectComponent },
    ],
  },
];

export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PebShippingRouteModule { }
