import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PebShippingPackagesComponent } from './shipping-packages.component';

const routes: Routes = [
  {
    path: '',
    component: PebShippingPackagesComponent,
  },
];

export const shippingPackagesRoutingModule = RouterModule.forChild(routes);
@NgModule({
  imports: [shippingPackagesRoutingModule],
  exports: [RouterModule],
})
export class ShippingPackagesRoutingModule { }
