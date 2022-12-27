import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ZoneResolver } from '../../resolver/zone.resolver';

import { PebShippingOptionsComponent } from './shipping-options.component';


const routes: Routes = [
  {
    path: '',
    component: PebShippingOptionsComponent,
  },
  {
    path: ':zoneId/details',
    component: PebShippingOptionsComponent,
    resolve: {
      zone: ZoneResolver,
    },
    data: {
      isDetailsView: true,
    },
  },
];

export const shippingOptionsRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [shippingOptionsRoutingModule],
  exports: [RouterModule],
})
export class ShippingOptionsRoutingModule { }
