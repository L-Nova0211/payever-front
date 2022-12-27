import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Route, RouterModule } from '@angular/router';
import { AngularResizedEventModule } from 'angular-resize-event';

import { AuthModule } from '@pe/auth';
import { AppType, APP_TYPE, MessageBus,NavigationService } from '@pe/common';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import { PeSimpleStepperModule } from '@pe/stepper';

import { CosConnectRootComponent } from './root/connect-root.component';
import { PeConnectHeaderService } from './services/connect-header.service';
import { CosMessageBus } from './services/message-bus.service';


const routes: Route[] = [
  {
    path: '',
    component: CosConnectRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../lib/connect').then(m =>  m.ConnectModule),
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
  declarations: [
    CosConnectRootComponent,
  ],
  providers: [
    SnackbarService,
    MatSnackBar,
    NavigationService,
    PeConnectHeaderService,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Connect,
    },
  ],
})
export class CosConnectModule {}
