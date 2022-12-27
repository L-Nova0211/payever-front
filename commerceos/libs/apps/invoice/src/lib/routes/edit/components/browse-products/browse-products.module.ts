import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula';

import { PebEnvService } from '@pe/builder-core';
import { EnvService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { TranslationGuard } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { PeBrowseProductsFormComponent } from './browse-products.component';

(window as any).PayeverStatic.IconLoader.loadIcons([
  'edit-panel',
]);

const routes: Route[] = [
  {
    path: '',
    component: PeBrowseProductsFormComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['products-list', 'products-editor', 'data-grid-app'],
      isFromDashboard: true,
    },
    children: [
      {
        path: '',
        data: {
          overlay: true,
          stopActionable: true,
          popupMode: true,
        },
        loadChildren: () => import('@pe/apps/products').then(m => m.ProductsModule),
      },
    ],
  },
];
export const routerModuleForChild = RouterModule.forChild(routes);
export const dragulaModule = DragulaModule.forRoot();
// @dynamic
@NgModule({
  exports: [RouterModule],
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    routerModuleForChild,
    PeSimpleStepperModule,
    MediaModule,
    dragulaModule,
  ],
  declarations: [PeBrowseProductsFormComponent],
  providers: [
    PeDataGridService,
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
  ],
})

export class PeBrowseProductsModule {}
