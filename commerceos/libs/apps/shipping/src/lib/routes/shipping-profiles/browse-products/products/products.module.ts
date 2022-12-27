import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { PebEnvService } from '@pe/builder-core';
import { EnvService,NavigationService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { PeFoldersModule } from '@pe/folders';
import { TranslationGuard } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { PeProductsComponent } from './products.component';

(window as any).PayeverStatic.IconLoader.loadIcons([
  'edit-panel',
]);

const routes: Route[] = [
  {
    path: '',
    component: PeProductsComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['commerceos-products-list-app', 'commerceos-products-editor-app', 'data-grid-app'],
      isFromDashboard: true,
    },
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/apps/products').then(m => m.ProductsModule),
      },
    ],
  },
];
export const routerModuleForChild = RouterModule.forChild(routes);
// @dynamic
@NgModule({
  exports: [RouterModule],
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    routerModuleForChild,
    PeSimpleStepperModule,
    MediaModule,
    PeFoldersModule,
  ],
  declarations: [PeProductsComponent],
  providers: [
    NavigationService,
    PeDataGridService,
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
  ],
})

export class PeProductsModule {}
