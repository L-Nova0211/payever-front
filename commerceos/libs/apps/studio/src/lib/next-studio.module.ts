import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { CosMessageBus } from '@pe/base';
import { AppType, APP_TYPE, MessageBus } from '@pe/common';
import { PeCommonHeaderService } from '@pe/header';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { CosNextStudioRootComponent } from './root/next-studio-root.component';
import { PeStudioHeaderService } from './studio-header.service';

(window as any).PayeverStatic.IconLoader.loadIcons(['apps','set', 'settings']);

const routes: Route[] = [
  {
    path: '',
    component: CosNextStudioRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./studio.module').then(m => m.PeStudioModule),
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, PePlatformHeaderModule, RouterModule.forChild(routes), PeSimpleStepperModule],
  declarations: [CosNextStudioRootComponent],
  providers: [
    PeStudioHeaderService,
    {
      provide: APP_TYPE,
      useValue: AppType.Studio,
    },
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    PeCommonHeaderService,
  ],
})
export class CosNextStudioModule {}
