import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AngularResizedEventModule } from 'angular-resize-event';

import { AuthModule } from '@pe/auth';
import { NavigationService } from '@pe/common';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { CosCheckoutRootComponent } from './root/checkout-root.component';
import { PeCheckoutHeaderService } from './services/checkout-header.service';


const routes: Route[] = [
  {
    path: '',
    component: CosCheckoutRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./checkout.module').then(m => m.CheckoutModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    AngularResizedEventModule,
    PeSimpleStepperModule,
    AuthModule,
  ],
  declarations: [CosCheckoutRootComponent],
  providers: [
    PeCheckoutHeaderService,
    NavigationService,
  ],
})
export class CosCheckoutModule {}
