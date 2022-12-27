import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Route, RouterModule } from '@angular/router';

import { PE_ENV } from '@pe/common';
import { PeCommonHeaderService } from '@pe/header';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { RulesModule } from '@pe/rules';
import { PeSimpleStepperModule } from '@pe/stepper';
import { PebFormBackgroundModule, PebFormFieldInputModule, PebSelectModule } from '@pe/ui';


import { ActualPeStatisticsApi, PeWidgetService, PE_STATISTICS_API_PATH } from './infrastructure';
import { CosNextStatisticsRootComponent } from './root/next-statistics-root.component';
import { PeStatisticsHeaderService } from './statistics-header.service'


const routes: Route[] = [
  {
    path: '',
    component: CosNextStatisticsRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./statistics.module').then(m => m.PeStatisticsModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    MatSelectModule,
    MatInputModule,
    PeSimpleStepperModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebSelectModule,
    RulesModule,
  ],
  declarations: [CosNextStatisticsRootComponent],
  providers: [
    PeCommonHeaderService,
    PeWidgetService,
    ActualPeStatisticsApi,
    PeStatisticsHeaderService,
    PeOverlayWidgetService,
    {
      provide: PE_STATISTICS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.statistics,
    },
  ],
})
export class CosNextStatisticsModule {}
