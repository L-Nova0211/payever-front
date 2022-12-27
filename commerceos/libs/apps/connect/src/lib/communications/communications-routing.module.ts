import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DevicePaymentsModule } from './modules/device-payments/device-payments.module';

// https://github.com/ng-packagr/ng-packagr/issues/1285#issuecomment-527196671
export function GetDevicePaymentsModule() {
  return DevicePaymentsModule;
}

const routes: Routes = [
  {
    path: 'device-payments',
    loadChildren: GetDevicePaymentsModule,
  },
];

export const CommunicationsRouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [CommunicationsRouterModuleForChild],
  exports: [RouterModule],
})
export class CommunicationsRoutingModule {}
